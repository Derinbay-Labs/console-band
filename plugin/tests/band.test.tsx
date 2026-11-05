import { expect, test } from 'claude-code/testing'

import type { Turn } from '../types'
import { DEFAULT_GATE, DEFAULT_TURN, FIVE_HOUR_MS, afterCall, gateSummary, pacePercent, receiptOf, recordCheck, settleCheck } from '../hooks/core'

const band = (columns: number, maxRows = 20) => ({
  plugin: 'console-band',
  surface: 'terminal' as const,
  component: 'AbovePrompt' as const,
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows,
    bodyColumns: columns,
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
  viewport: { columns: columns + 5, rows: 40 },
})

const cat = (name: string, tokens: number, kind = 'used') => ({ name, tokens, color: 'text', isDeferred: false, kind })

const USAGE = {
  startedAt: 0,
  context: {
    window: 1_000_000,
    tokens: 390_000,
    percent: 39,
    breakdown: {
      categories: [cat('System prompt', 2400), cat('System tools', 15000), cat('Messages', 338000), cat('Autocompact buffer', 33000, 'buffer')],
      totalTokens: 355400,
      maxTokens: 1_000_000,
      rawMaxTokens: 1_000_000,
    },
  },
  rateLimits: [
    { kind: 'five_hour', percentUsed: 78, resetsAt: new Date(Date.now() + 2 * 3_600_000).toISOString() },
    { kind: 'seven_day', percentUsed: 39, resetsAt: new Date(Date.now() + 3 * 86_400_000).toISOString() },
  ],
  cost: { usd: 14.2 },
}

test('wide terminal draws the full console, narrow collapses it', async ($, on) => {
  on('session.usage', () => ({ value: USAGE as never }))
  on('session.model', () => ({ value: 'Opus 5.5 (1M)' }))
  on('session.version', () => ({ value: { version: '2.1.295' } as never }))
  on('session.measure', (_$, e) => ({ changed: e.changed }))
  await $.session.measure({ context: { window: 1_000_000 }, rateLimits: [], changed: ['context'] })

  const wide = await $.ui.mount(band(160))
  expect(await wide.find({ text: /LOC/ })).toBeDefined()
  expect(await wide.find({ text: /tooling/ })).toBeDefined()
  expect(await wide.find({ text: '$14.20' })).toBeDefined()
  expect(await wide.find({ text: /WEEKLY/ })).toBeDefined()
  expect(await wide.find({ text: '┃' })).toBeDefined()
  expect(await wide.find({ text: /cold/ })).toBeDefined()
  await wide.unmount()

  const mid = await $.ui.mount(band(120))
  for (const key of ['head', 'loc', 'env', 'main', 'turn', 'gate', 'ctx', 'bd', 'lim', 'cache', 'foot']) {
    const el = await mid.find({ key })
    expect(el).toBeDefined()
    expect(el?.text.length ?? 0).toBeLessThanOrEqual(120)
  }
  await mid.unmount()

  const narrow = await $.ui.mount(band(70))
  expect(await narrow.find({ text: /LOC/ })).toBeUndefined()
  expect(await narrow.find({ text: /tooling/ })).toBeUndefined()
  expect(await narrow.find({ text: /CONTEXT/ })).toBeDefined()
  expect(await narrow.find({ text: 'Opus 5.5 (1M)' })).toBeDefined()
  expect(await narrow.find({ key: 'live' })).toBeDefined()
  await narrow.unmount()

  // A short band keeps its highest rows: the header, context and limits outlast the log and location.
  const short = await $.ui.mount(band(120, 4))
  for (const key of ['head', 'ctx', 'lim', 'cache']) expect(await short.find({ key })).toBeDefined()
  expect(await short.find({ key: 'loc' })).toBeUndefined()
  await short.unmount()
})

test('gate tallies a check, then settles an ask by whether the call ran', () => {
  const ask = { id: 't1', tool: 'Bash', bucket: 'shell' as const, verdict: 'ask' as const, inSubagent: false, detail: 'ls', at: 1 }
  const asked = recordCheck(DEFAULT_GATE, ask)
  expect(gateSummary(asked).ask).toBe(1)
  const ran = settleCheck(asked, 't1', true)
  expect(gateSummary(ran)).toEqual({ rule: 0, ask: 0, cleared: 1, deny: 0, total: 1 })
  expect(gateSummary(settleCheck(asked, 't1', false)).deny).toBe(1)
})

test('turn receipt counts main-loop errors and edits from every loop', () => {
  let t: Turn = { ...DEFAULT_TURN, startedAt: 10, costAtStart: 1 }
  t = afterCall(t, { inSubagent: false, hasFailed: true, isEdit: false })
  t = afterCall(t, { inSubagent: true, hasFailed: true, isEdit: false })
  t = afterCall(t, { inSubagent: true, hasFailed: false, isEdit: true })
  const r = receiptOf(t, { durationMs: 5000, agentsSince: 1, costNow: 1.5, reason: 'answer' })
  expect(r.errors).toBe(1)
  expect(r.edits).toBe(1)
  expect(r.costDelta).toBe(0.5)
})

test('pace is the share of the window already passed', () => {
  expect(Math.round(pacePercent(1_000 + 2 * 3_600_000, FIVE_HOUR_MS, 1_000) ?? 0)).toBe(60)
  expect(pacePercent(null, FIVE_HOUR_MS, 1_000)).toBeNull()
  expect(pacePercent(0, FIVE_HOUR_MS, 1_000)).toBe(100)
  expect(pacePercent(10 * 3_600_000, FIVE_HOUR_MS, 0)).toBe(0)
})
