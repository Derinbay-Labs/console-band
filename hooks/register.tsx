import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { AgentCard, Check, Git, LogLine, Loop, Segment, Usage, Weather } from '../types'
import {
  DEFAULT_ARCHITECT, DEFAULT_GATE, DEFAULT_MAIN, DEFAULT_TURN, EDIT_TOOLS, FIVE_HOUR_MS, LOOP_ACTIVE_MS, SEVEN_DAY_MS,
  adviceLine, afterCall, applyStep, bucketOf, bucketTotal, describeInput, endConsult, fmtSpan, fmtTime,
  fmtTimer, fmtUsd, gateSummary, handbackOf, isAdvising, listOf, momentOf, newCard, normalize,
  normalizeArchitect, normalizeGate, pacePercent, plural, prettyModel, promptLine, receiptOf, recordCheck,
  shorten, startConsult,
} from './core'

const usageAtom = atom({ plugin: 'console-band', key: 'usage' } as const, null)
const gitAtom = atom({ plugin: 'console-band', key: 'git' } as const, null)
const weatherAtom = atom({ plugin: 'console-band', key: 'weather' } as const, null)
const lastTurnAtom = atom({ plugin: 'console-band', key: 'lastTurnAt' } as const, null)
const nowAtom = atom({ plugin: 'console-band', key: 'now' } as const, 0)
const pulseAtom = atom({ plugin: 'console-band', key: 'pulse' } as const, false)
const mainAtom = atom({ plugin: 'console-band', key: 'main' } as const, DEFAULT_MAIN)
const architectAtom = atom({ plugin: 'console-band', key: 'architect' } as const, DEFAULT_ARCHITECT)
const architectTypesAtom = atom({ plugin: 'console-band', key: 'architectTypes' } as const, [])
const gateAtom = atom({ plugin: 'console-band', key: 'gate' } as const, DEFAULT_GATE)
const agentsAtom = atom({ plugin: 'console-band', key: 'agents' } as const, [])
const loopsAtom = atom({ plugin: 'console-band', key: 'loops' } as const, [])
const logAtom = atom({ plugin: 'console-band', key: 'log' } as const, [])
const turnAtom = atom({ plugin: 'console-band', key: 'turn' } as const, DEFAULT_TURN)
const receiptAtom = atom({ plugin: 'console-band', key: 'receipt' } as const, null)

// Agent types and server tools that count as the on-call architect.
const ARCHITECT = /advisor|architect/i
const LOG_ROWS = 3
const AGENT_ROWS = 3

const COMPACT_BELOW = 100
const LABEL = 9

const C = {
  teal: '#4aa3b8',
  orange: '#e8734a',
  green: '#3ec28f',
  yellow: '#e5c07b',
  red: '#e05561',
  purple: '#b48ead',
  blue: '#8fb3e8',
  grey: '#9aa0a6',
  dim: '#3a3f47',
  text: '#d8dee9',
  cleared: '#7f8cff',
}

// /context row names, matched by prefix, to the short labels and colours of the band.
const CATEGORIES: [RegExp, string, string][] = [
  [/^system prompt/i, 'system', C.grey],
  [/^system tools/i, 'tools', C.text],
  [/^mcp tools/i, 'mcp', C.teal],
  [/^mcp/i, 'mcp-instr', C.green],
  [/agents/i, 'agents', C.blue],
  [/^memory/i, 'memory', C.orange],
  [/^skills/i, 'skills', C.yellow],
  [/^messages/i, 'msgs', C.purple],
]

export const fmtTokens = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${Math.round(n / 1000)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(Math.round(n))
}

const fmtDuration = (ms: number): string => {
  const m = Math.max(0, Math.floor(ms / 60_000))
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}m`
}

const fmtClock = (ms: number): string => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const levelColor = (pct: number): string => (pct >= 80 ? C.red : pct >= 50 ? C.yellow : C.green)

const WEATHER: [number, string][] = [
  [0, 'Clear'], [3, 'Cloudy'], [48, 'Fog'], [57, 'Drizzle'], [67, 'Rain'],
  [77, 'Snow'], [82, 'Showers'], [86, 'Snow'], [99, 'Storm'],
]

const opt = (options: unknown, key: string): string => {
  const v = (options as Record<string, unknown> | undefined)?.[key]
  return v === undefined || v === null ? '' : String(v).trim()
}

type Span = { text: string; color?: string; bold?: boolean }

let isWorking = false
let lastMinute = -1
let timers: { cancel: () => void }[] = []

async function refreshUsage($: EngineInterface) {
  const [u, model, version] = await Promise.all([
    $.session.usage({ breakdown: 'summary', columns: 80 }),
    $.session.model(),
    $.session.version(),
  ])
  const segments: Segment[] = []
  let messages = 0
  let reserved = 0
  for (const row of u.context.breakdown?.categories ?? []) {
    if (row.kind === 'buffer') reserved += row.tokens
    if (row.kind !== 'used' || row.tokens <= 0) continue
    const hit = CATEGORIES.find(([re]) => re.test(row.name))
    const label = hit?.[1] ?? row.name.toLowerCase()
    if (label === 'msgs') messages += row.tokens
    segments.push({ label, tokens: row.tokens, color: hit?.[2] ?? C.grey })
  }
  const limit = (kind: string) => u.rateLimits.find(r => r.kind === kind)?.percentUsed ?? null
  const resetsAt = (kind: string) => {
    const at = Date.parse(u.rateLimits.find(r => r.kind === kind)?.resetsAt ?? '')
    return Number.isNaN(at) ? null : at
  }
  const usage: Usage = {
    model,
    version: version.version,
    startedAt: u.startedAt,
    costUsd: u.cost?.usd ?? null,
    window: u.context.window,
    tokens: u.context.tokens ?? null,
    percent: u.context.percent ?? null,
    segments,
    messages,
    reserved,
    session: limit('five_hour'),
    weekly: limit('seven_day'),
    sessionResetsAt: resetsAt('five_hour'),
    weeklyResetsAt: resetsAt('seven_day'),
  }
  await update($, usageAtom, () => usage)
}

async function refreshGit($: EngineInterface) {
  const cwd = await $.session.cwd()
  const dir = cwd.split(/[\\/]/).filter(Boolean).pop() ?? cwd
  const [head, log, status] = await Promise.all([
    $.process.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], { timeoutMs: 5000 }).catch(() => null),
    $.process.run(['git', 'log', '-1', '--format=%ct'], { timeoutMs: 5000 }).catch(() => null),
    $.process.run(['git', 'status', '--porcelain'], { timeoutMs: 5000 }).catch(() => null),
  ])
  const isRepo = head?.exitCode === 0
  const committedAt = Number(log?.stdout.trim())
  const now = await $.clock.now()
  const git: Git = {
    dir,
    branch: isRepo ? head.stdout.trim() : null,
    ageMinutes: isRepo && committedAt > 0 ? Math.floor((now - committedAt * 1000) / 60_000) : null,
    modified: isRepo && status?.exitCode === 0 ? status.stdout.split('\n').filter(Boolean).length : 0,
  }
  await update($, gitAtom, () => git)
}

async function refreshWeather($: EngineInterface, lat: string, lon: string) {
  if (!lat || !lon) return
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,weather_code`
  const res = await $.http.fetch(url).catch(() => null)
  if (!res?.ok) return
  const cur = (JSON.parse(res.text) as { current?: { temperature_2m?: number; weather_code?: number } }).current
  if (cur?.temperature_2m === undefined) return
  const code = cur.weather_code ?? 0
  const weather: Weather = {
    tempC: Math.round(cur.temperature_2m),
    text: WEATHER.find(([max]) => code <= max)?.[1] ?? '',
  }
  await update($, weatherAtom, () => weather)
}

type ServerBlock = { type: string; id?: string; name?: string; tool_use_id?: string }

const getCards = async ($: EngineInterface) => listOf<AgentCard>(await read($, agentsAtom)).map(c => newCard(c))
const getArchitect = async ($: EngineInterface) => normalizeArchitect(await read($, architectAtom))

async function say($: EngineInterface, who: string, text: string, kind: LogLine['kind'] = 'info') {
  const line: LogLine = { at: await $.clock.now(), who, text, kind }
  await update($, logAtom, list => [...listOf<LogLine>(list), line].slice(-30))
}

async function whoIs($: EngineInterface, agentId: string | undefined) {
  if (!agentId) return 'main'
  const card = (await getCards($)).find(c => c.id === agentId)
  return card ? shorten(card.description || card.type, 12) : 'agent'
}

async function consultStarted($: EngineInterface, id: string, via: string) {
  const t = normalize(DEFAULT_TURN, await read($, turnAtom))
  const moment = momentOf(t)
  const at = await $.clock.now()
  await update($, architectAtom, a => startConsult(normalizeArchitect(a), { id, at, moment, via }))
  if (moment === 'before done') await update($, turnAtom, x => ({ ...normalize(DEFAULT_TURN, x), isReviewing: true }))
  await say($, 'architect', `${moment} · ${via}`, 'consult')
}

async function consultEnded($: EngineInterface, advice: string | null, id?: string) {
  const at = await $.clock.now()
  const text = advice ? adviceLine(advice) || null : null
  await update($, architectAtom, a => endConsult(normalizeArchitect(a), at, text, id))
  await update($, turnAtom, t => ({ ...normalize(DEFAULT_TURN, t), isReviewing: false }))
  await say($, 'architect', text ? `advice: ${shorten(text, 60)}` : 'advice returned', 'consult')
}

async function noteAdvice($: EngineInterface, advice: string) {
  await update($, architectAtom, x => ({ ...normalizeArchitect(x), lastAdvice: advice }))
  await say($, 'architect', `advice: ${shorten(advice, 60)}`, 'consult')
}

async function noteMode($: EngineInterface, mode: string | undefined) {
  if (!mode) return
  const m = normalize(DEFAULT_MAIN, await read($, mainAtom))
  if (m.mode !== mode) await update($, mainAtom, x => ({ ...normalize(DEFAULT_MAIN, x), mode }))
}

/** The session's cost read fresh: the turn receipt subtracts two of these. */
const costNow = async ($: EngineInterface) => (await $.session.usage().catch(() => null))?.cost?.usd ?? null

async function resetAll($: EngineInterface) {
  await update($, mainAtom, m => ({ ...DEFAULT_MAIN, mode: normalize(DEFAULT_MAIN, m).mode }))
  await update($, architectAtom, () => DEFAULT_ARCHITECT)
  await update($, gateAtom, () => DEFAULT_GATE)
  await update($, agentsAtom, () => [])
  await update($, loopsAtom, () => [])
  await update($, logAtom, () => [])
  await update($, turnAtom, () => DEFAULT_TURN)
  await update($, receiptAtom, () => null)
}

async function tick($: EngineInterface, ttlMs: number) {
  const now = await $.clock.now()
  const last = await read($, lastTurnAtom)
  const isWarm = last !== null && last !== undefined && now - last < ttlMs
  const minute = Math.floor(now / 60_000)
  // Turn and agent clocks run by the second even while the cache is cold.
  const isLive = isWorking || (await getCards($)).some(c => c.status === 'running')
  if (isWarm || isLive || minute !== lastMinute) {
    lastMinute = minute
    await update($, nowAtom, () => now)
  }
  if (isWorking) await update($, pulseAtom, p => !p)
}


export const register: Register = (on, options) => {
  const brand = opt(options, 'brand') || 'console-band'
  const ttlMs = (Number(opt(options, 'cacheTtlMinutes')) || 5) * 60_000
  const city = opt(options, 'city')
  const lat = opt(options, 'latitude')
  const lon = opt(options, 'longitude')

  on('session.start', async ($, e, next) => {
    for (const t of timers) t.cancel()
    await update($, nowAtom, () => Date.now())
    void refreshWeather($, lat, lon).catch(() => undefined)
    await Promise.all([refreshUsage($).catch(() => undefined), refreshGit($).catch(() => undefined)])
    timers = [
      $.clock.every(1000, () => void tick($, ttlMs).catch(() => undefined)),
      $.clock.every(30 * 60_000, () => void refreshWeather($, lat, lon).catch(() => undefined)),
    ]
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await refreshUsage($).catch(() => undefined)
    return next(e)
  })

  on('prompt.submit', (_$, e, next) => {
    isWorking = true
    return next(e)
  })

  on('session.end', async ($, e, next) => {
    if (e.reason === 'clear') await resetAll($)
    return next(e)
  })

  on('classic.UserPromptSubmit', async ($, e, next) => {
    await noteMode($, e.permission_mode)
    return next(e)
  })

  on('agent.offer', async ($, e, next) => {
    const offered = await next(e)
    if (ARCHITECT.test(e.agent)) {
      await update($, architectTypesAtom, r => {
        const x = listOf<string>(r)
        return x.includes(e.agent) ? x : [...x, e.agent].slice(-20)
      })
    }
    return offered
  })

  on('turn.start', async ($, e, next) => {
    if (e.agentId) return next(e)
    isWorking = true
    const [now, cost] = await Promise.all([$.clock.now(), costNow($)])
    await update($, turnAtom, () => ({ ...DEFAULT_TURN, startedAt: now, costAtStart: cost }))
    await update($, mainAtom, m => ({ ...normalize(DEFAULT_MAIN, m), isRunning: true }))
    // A background architect's report reaches the main loop as the text opening this turn.
    const back = e.text ? handbackOf(e.text) : null
    const a = back ? await getArchitect($) : null
    if (back && a && a.ids.includes(back.from)) {
      const advice = adviceLine(back.body)
      if (advice && advice !== a.lastAdvice) await noteAdvice($, advice)
    } else if (e.text) {
      const p = promptLine(e.text)
      await say($, p.who, p.text)
    }
    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    if (!e.agentId) {
      await update($, mainAtom, m => {
        const x = normalize(DEFAULT_MAIN, m)
        return { ...x, effort: String(e.effort ?? x.effort), steps: x.steps + 1 }
      })
      return yield* next(e)
    }
    const result = yield* next(e)
    const id = e.agentId
    const [cards, a] = await Promise.all([getCards($), getArchitect($)])
    if (cards.some(c => c.id === id)) {
      const step = { model: e.model, usage: result.usage, stopReason: result.stopReason }
      await update($, agentsAtom, list => listOf<AgentCard>(list).map(c => (c.id === id ? applyStep(newCard(c), step) : c)))
      if (result.stopReason === 'max_tokens') await say($, await whoIs($, id), 'hit max_tokens', 'error')
    } else if (!a.ids.includes(id)) {
      const now = await $.clock.now()
      await update($, loopsAtom, l => {
        const list = listOf<Loop>(l)
        const found = list.find(x => x.id === id)
        const updated = found
          ? list.map(x => (x === found ? { ...x, steps: x.steps + 1, lastAt: now } : x))
          : [...list, { id, steps: 1, firstAt: now, lastAt: now, isDone: false }]
        return updated.slice(-60)
      })
    }
    return result
  })

  on('session.compact', async ($, e, next) => {
    const done = await next(e)
    if (!e.agentId && e.trigger !== 'precompute') {
      await update($, mainAtom, m => {
        const x = normalize(DEFAULT_MAIN, m)
        return { ...x, compactions: x.compactions + 1 }
      })
      await say($, 'main', `context compacted (${e.trigger})`)
    }
    return done
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    const didRun = ran.deny === undefined
    // The gate tally reads what became of each call: it ran, or something refused it.
    if (String(e.tool) !== 'SubagentHandback') {
      const check: Check = {
        id: e.tool_use_id,
        tool: e.tool,
        bucket: bucketOf(e.tool),
        verdict: didRun ? 'rule' : 'deny',
        inSubagent: Boolean(e.agentId),
        detail: shorten(describeInput(e.tool, e), 90),
        at: await $.clock.now(),
      }
      await update($, gateAtom, g => recordCheck(normalizeGate(g), check))
      if (!didRun) await say($, 'gate', `denied · ${check.detail}`, 'error')
    }
    // A background agent hands its report back through this tool; an architect's report is its advice.
    if (String(e.tool) === 'SubagentHandback') {
      const message = (e as unknown as { message?: unknown }).message
      const a = e.agentId ? await getArchitect($) : null
      if (a && e.agentId && a.ids.includes(e.agentId) && typeof message === 'string') {
        const advice = adviceLine(message)
        if (advice && advice !== a.lastAdvice) await noteAdvice($, advice)
      }
      return ran
    }
    if (e.tool === 'Agent') return ran
    const hasFailed = didRun && ran.isError === true
    const isEdit = !hasFailed && didRun && EDIT_TOOLS.has(e.tool)
    const t0 = normalize(DEFAULT_TURN, await read($, turnAtom))
    if (isEdit || hasFailed || (!e.agentId && t0.errorStreak > 0)) {
      await update($, turnAtom, t => afterCall(normalize(DEFAULT_TURN, t), { inSubagent: Boolean(e.agentId), hasFailed, isEdit }))
    }
    // The log keeps what is worth a glance: refusals, errors and edits.
    const text = shorten(describeInput(e.tool, e), 64)
    if (!didRun) await say($, await whoIs($, e.agentId), `${text}  denied`, 'error')
    else if (hasFailed) await say($, await whoIs($, e.agentId), `${text}  ✗`, 'error')
    else if (isEdit) await say($, await whoIs($, e.agentId), text)
    return ran
  })

  // A server-side review tool (the advisor) never reaches tool.call: it shows only in the assistant's rows.
  on('session.append', async ($, e, next) => {
    if (!e.agentId && e.message.type === 'assistant') {
      const a = await getArchitect($)
      const opened = new Set<string>()
      for (const block of e.message.content as unknown as readonly ServerBlock[]) {
        if (block.type === 'server_tool_use' && block.name && block.id && ARCHITECT.test(block.name)) {
          if (a.seen.includes(block.id)) continue
          const id = block.id
          await update($, architectAtom, x => {
            const y = normalizeArchitect(x)
            return { ...y, seen: [...y.seen, id].slice(-60) }
          })
          opened.add(id)
          await consultStarted($, id, `${block.name} tool`)
        } else if (block.type.endsWith('_tool_result') && block.tool_use_id) {
          const id = block.tool_use_id
          const isOpen = opened.has(id) || (await getArchitect($)).consults.some(c => c.id === id && c.endAt === null)
          if (isOpen) await consultEnded($, null, id)
        }
      }
    }
    return next(e)
  })

  on('agent.spawn', async ($, e, next) => {
    const started = await next(e)
    if (!e.parentAgentId) await noteMode($, e.permissionMode)
    if (started.deny !== undefined || !started.agentId) return started
    const id = started.agentId
    const types = listOf<string>(await read($, architectTypesAtom))
    await update($, loopsAtom, l => listOf<Loop>(l).filter(x => x.id !== id))
    if (ARCHITECT.test(e.subagentType) || types.includes(e.subagentType)) {
      await update($, architectAtom, a => {
        const x = normalizeArchitect(a)
        return { ...x, ids: [...x.ids, id].slice(-40) }
      })
      await consultStarted($, id, e.subagentType.split(':').pop() ?? 'agent')
      return started
    }
    const card = newCard({ id, type: e.name ?? e.subagentType, model: started.model, description: e.description, spawnedAt: await $.clock.now() })
    await update($, agentsAtom, list => [...listOf<AgentCard>(list), card].slice(-24))
    await say($, shorten(card.description || card.type, 12), `spawned · ${card.type}`)
    return started
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    const id = e.agentId
    const now = await $.clock.now()
    if (!id) {
      isWorking = false
      const [t, cards, cost] = await Promise.all([read($, turnAtom), getCards($), costNow($)])
      const turn = normalize(DEFAULT_TURN, t)
      const r = receiptOf(turn, { durationMs: e.durationMs, agentsSince: cards.filter(c => c.spawnedAt >= turn.startedAt).length, costNow: cost, reason: e.reason })
      await update($, receiptAtom, () => r)
      await update($, mainAtom, m => ({ ...normalize(DEFAULT_MAIN, m), isRunning: false }))
      await update($, lastTurnAtom, () => now)
      await update($, pulseAtom, () => false)
      await Promise.all([refreshUsage($).catch(() => undefined), refreshGit($).catch(() => undefined)])
      return done
    }
    if ((await getArchitect($)).ids.includes(id)) {
      await consultEnded($, e.answer, id)
      return done
    }
    const cards = await getCards($)
    const card = cards.find(c => c.id === id)
    if (card) {
      const status = e.reason === 'answer' ? 'done' : e.reason === 'aborted' ? 'stopped' : 'failed'
      await update($, agentsAtom, list => listOf<AgentCard>(list).map(c => (c.id === id ? { ...newCard(c), status, endedAt: now } : c)))
      await say($, await whoIs($, id), status === 'done' ? `done · ${fmtSpan(now - card.spawnedAt)}` : status, status === 'done' ? 'done' : 'error')
    } else {
      await update($, loopsAtom, l => listOf<Loop>(l).map(x => (x.id === id ? { ...x, isDone: true, lastAt: now } : x)))
    }
    return done
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const [usage, git, weather, lastTurnAt, nowValue, pulse, mainValue, archValue, gateValue, cardsValue, loopsValue, logValue, turnValue, receipt] = await Promise.all([
      read($, usageAtom), read($, gitAtom), read($, weatherAtom),
      read($, lastTurnAtom), read($, nowAtom), read($, pulseAtom),
      read($, mainAtom), read($, architectAtom), read($, gateAtom), read($, agentsAtom),
      read($, loopsAtom), read($, logAtom), read($, turnAtom), read($, receiptAtom),
    ])
    const main = normalize(DEFAULT_MAIN, mainValue)
    const architect = normalizeArchitect(archValue)
    const gate = normalizeGate(gateValue)
    const cards = listOf<AgentCard>(cardsValue).map(c => newCard(c))
    const loops = listOf<Loop>(loopsValue)
    const log = listOf<LogLine>(logValue)
    const turn = normalize(DEFAULT_TURN, turnValue)
    const { Box, Text } = $.ui.resolve(e)
    const cols = Math.max(40, e.props.bodyColumns - 1)
    const isCompact = cols < COMPACT_BELOW
    const now = nowValue || Date.now()

    // Every row is cut to the band's width so a long one never wraps and pushes the rest down.
    const clip = (spans: Span[]): Span[] => {
      const out: Span[] = []
      let left = cols
      for (const s of spans) {
        if (left <= 0) break
        out.push(s.text.length > left ? { ...s, text: s.text.slice(0, left) } : s)
        left -= s.text.length
      }
      return out
    }
    const row = (key: string, spans: Span[]) => (
      <Box key={key} flexDirection="row">
        {clip(spans).map((s, i) => (
          <Text key={String(i)} color={s.color} bold={s.bold} wrap="truncate-end">{s.text}</Text>
        ))}
      </Box>
    )
    const label = (text: string): Span => ({ text: text.padEnd(LABEL), color: C.grey })
    const sep: Span = { text: '  │  ', color: C.dim }
    const rule = (n: number, color = C.dim): Span => ({ text: '─'.repeat(Math.max(0, n)), color })
    const fill = (n: number, color: string): Span => ({ text: '━'.repeat(Math.max(0, n)), color })
    const logo: Span[] = [{ text: '┃', color: C.teal, bold: true }, { text: '┃ ', color: C.orange, bold: true }]
    const brandSpans = (): Span[] => {
      const dot = brand.indexOf('.')
      return dot < 0
        ? [{ text: brand, color: C.teal, bold: true }]
        : [{ text: brand.slice(0, dot), color: C.teal, bold: true }, { text: brand.slice(dot), color: C.orange, bold: true }]
    }

    // CONTEXT: one coloured run per category, then the compaction reserve dashed at the end.
    const contextRow = (): Span[] => {
      const pct = usage?.percent
      const right = pct === null || pct === undefined ? '   --' : `${String(pct).padStart(4)}%`
      const w = cols - LABEL - right.length - 1
      const spans: Span[] = [label('CONTEXT')]
      if (!usage || usage.window <= 0) return [...spans, rule(w), { text: ` ${right}`, color: C.teal }]
      let used = 0
      for (const s of usage.segments) {
        const n = Math.min(w - used, Math.max(1, Math.round((s.tokens / usage.window) * w)))
        if (n <= 0) break
        spans.push(fill(n, s.color))
        used += n
      }
      const reserved = Math.min(w - used, Math.round((usage.reserved / usage.window) * w))
      spans.push(rule(w - used - reserved), { text: '-'.repeat(Math.max(0, reserved)), color: C.grey })
      spans.push({ text: ` ${right}`, color: C.teal, bold: true })
      return spans
    }

    const breakdownRow = (): Span[] => {
      if (!usage) return []
      const tooling = usage.segments.reduce((sum, s) => sum + s.tokens, 0) - usage.messages
      const spans: Span[] = [
        { text: ' '.repeat(LABEL) },
        { text: 'tooling ', color: C.grey },
        { text: fmtTokens(tooling), color: C.teal, bold: true },
        { text: ' · ', color: C.dim },
        { text: `${Math.round((tooling / usage.window) * 100)}%`, color: C.teal, bold: true },
        sep,
      ]
      for (const s of usage.segments) {
        spans.push({ text: '━ ', color: s.color }, { text: `${s.label} `, color: C.grey }, { text: `${fmtTokens(s.tokens)}  `, color: C.text })
      }
      return spans
    }

    // SESSION fills leftward from the centre, WEEKLY rightward. A blue ┃ marks where an even pace
    // would be now (the share of the window already passed); use past it is red, unused room up to
    // it is a blue ┄. The signed number beside each percent is use minus pace.
    type Cell = { ch: string; color: string }
    const side = (used: number | null, pace: number | null, w: number): Cell[] => {
      const n = used === null ? 0 : Math.round((Math.min(100, used) / 100) * w)
      const p = pace === null ? -1 : Math.min(w - 1, Math.round((pace / 100) * w))
      const lc = levelColor(used ?? 0)
      // Cells run outward from the centre.
      return Array.from({ length: Math.max(0, w) }, (_, i): Cell =>
        i === p ? { ch: '┃', color: C.blue }
          : i < n ? { ch: '━', color: p >= 0 && i > p ? C.red : lc }
          : p >= 0 && i < p ? { ch: '┄', color: C.blue }
          : { ch: '─', color: C.dim })
    }
    const runs = (cells: Cell[]): Span[] =>
      cells.reduce<Span[]>((out, c) => {
        const last = out[out.length - 1]
        if (last && last.color === c.color) last.text += c.ch
        else out.push({ text: c.ch, color: c.color })
        return out
      }, [])
    const delta = (used: number | null, pace: number | null) => {
      if (used === null || pace === null) return { text: '', color: C.grey }
      const d = Math.round(used - pace)
      const color = d <= 0 ? C.green : d <= 10 ? C.yellow : C.red
      return { text: d > 0 ? `+${d}` : d < 0 ? `−${-d}` : '±0', color }
    }
    const limitsRow = (): Span[] => {
      const s = usage?.session ?? null
      const wk = usage?.weekly ?? null
      const sp = pacePercent(usage?.sessionResetsAt ?? null, FIVE_HOUR_MS, now)
      const wp = pacePercent(usage?.weeklyResetsAt ?? null, SEVEN_DAY_MS, now)
      const sd = delta(s, sp)
      const wd = delta(wk, wp)
      const sPct = (s === null ? '--' : `${Math.round(s)}%`).padEnd(4)
      const wPct = wk === null ? '--' : `${Math.round(wk)}%`
      const sDelta = sd.text.padEnd(4)
      const wDelta = wd.text ? ` ${wd.text}` : ''
      const mid = cols - LABEL - sPct.length - sDelta.length - 1 - (2 + wPct.length + wDelta.length + 7)
      const half = Math.floor((mid - 1) / 2)
      const sc = levelColor(s ?? 0)
      const wc = levelColor(wk ?? 0)
      return [
        label('SESSION'),
        { text: sPct, color: sc, bold: true },
        { text: sDelta, color: sd.color },
        { text: ' ' },
        ...runs(side(s, sp, half).reverse()),
        { text: '◆', color: (s ?? 0) >= (wk ?? 0) ? sc : wc },
        ...runs(side(wk, wp, mid - 1 - half)),
        { text: '  ' },
        { text: wPct, color: wc, bold: true },
        { text: wDelta, color: wd.color },
        { text: ' WEEKLY', color: C.grey },
      ]
    }

    const cacheRow = (): Span[] => {
      const left = lastTurnAt === null || lastTurnAt === undefined ? 0 : ttlMs - (now - lastTurnAt)
      const isCold = left <= 0
      const right = isCold ? 'cold' : fmtClock(left)
      const w = cols - LABEL - 7
      const n = isCold ? 0 : Math.max(1, Math.round((left / ttlMs) * w))
      const color = isCold ? C.red : left / ttlMs < 0.2 ? C.red : left / ttlMs < 0.5 ? C.yellow : C.green
      return [label('CACHE'), fill(n, color), rule(w - n), { text: right.padStart(7), color, bold: true }]
    }

    const footer = (): Span[] => {
      const dir = git?.dir ?? ''
      if (isCompact) {
        return [{ text: '◆ ', color: C.teal }, { text: dir, color: C.text }, ...(git?.branch ? [{ text: ` (${git.branch})`, color: C.teal }] : [])]
      }
      const spans: Span[] = [{ text: '◆ ', color: C.teal }, { text: 'PWD ', color: C.grey }, { text: dir, color: C.text }]
      if (git?.branch) {
        spans.push(sep, { text: '⎇ ', color: C.grey }, { text: git.branch, color: C.teal })
        if (git.ageMinutes !== null) spans.push(sep, { text: 'Age ', color: C.grey }, { text: fmtDuration(git.ageMinutes * 60_000), color: C.green })
        spans.push(sep, { text: 'Mod ', color: C.grey }, { text: String(git.modified), color: C.text })
      }
      return spans
    }

    const model = usage?.model ?? ''
    const cost = usage?.costUsd === null || usage?.costUsd === undefined ? '' : `$${usage.costUsd.toFixed(2)}`
    const working = e.props.isWorking || main.isRunning

    // MAIN: the main loop's state, effort, permission mode and request count.
    const EFFORT = ['low', 'medium', 'high', 'xhigh']
    const mainRow = (): Span[] => {
      const spans: Span[] = [
        label('MAIN'),
        working ? { text: '● working', color: C.green, bold: true } : { text: '○ idle', color: C.grey },
      ]
      if (main.effort) {
        const lvl = main.effort === 'max' ? 4 : EFFORT.indexOf(main.effort) + 1
        spans.push(sep, { text: 'effort ', color: C.grey })
        if (lvl > 0) spans.push({ text: '▮'.repeat(lvl), color: C.orange }, { text: `${'▯'.repeat(Math.max(0, 4 - lvl))} `, color: C.dim })
        spans.push({ text: main.effort, color: C.text })
      }
      if (main.mode) spans.push(sep, { text: 'mode ', color: C.grey }, { text: main.mode, color: main.mode === 'bypassPermissions' ? C.red : C.text })
      spans.push(sep, { text: `${main.steps} req`, color: C.text })
      if (main.compactions > 0) spans.push(sep, { text: `⟲${main.compactions}`, color: C.yellow })
      return spans
    }

    // TURN: the live turn while it runs, its receipt once it is over.
    const turnRow = (): Span[] => {
      const spans: Span[] = [label('TURN')]
      if (working && turn.startedAt > 0) {
        spans.push({ text: `◐ turn ${fmtTimer(now - turn.startedAt)}`, color: C.orange, bold: true })
        if (turn.edits) spans.push({ text: ` · ${plural(turn.edits, 'edit')}`, color: C.text })
        if (turn.errors) spans.push({ text: ` · ${plural(turn.errors, 'error')}`, color: C.red })
        if (turn.isReviewing) spans.push({ text: ' · reviewing', color: C.purple })
        return spans
      }
      if (!receipt) return [...spans, { text: 'no turn yet', color: C.grey }]
      const isOk = receipt.reason === 'answer'
      spans.push({ text: `${isOk ? '✓' : '■'} last turn ${fmtSpan(receipt.durationMs)}`, color: isOk ? C.green : C.yellow })
      if (receipt.agents) spans.push({ text: ` · ${plural(receipt.agents, 'agent')}`, color: C.blue })
      if (receipt.edits) spans.push({ text: ` · ${plural(receipt.edits, 'edit')}`, color: C.text })
      if (receipt.errors) spans.push({ text: ` · ${plural(receipt.errors, 'error')}`, color: C.red })
      if (receipt.costDelta !== null) spans.push({ text: ` · +${fmtUsd(receipt.costDelta)}`, color: C.yellow })
      if (!isOk) spans.push({ text: ` · ${receipt.reason}`, color: C.grey })
      return spans
    }

    // GATE: a strip of the latest permission checks, then the tallies by verdict and by kind.
    const VERDICT: Record<Check['verdict'], [string, string]> = {
      rule: ['✓', C.green], cleared: ['✓', C.cleared], ask: ['?', C.yellow], deny: ['✗', C.red],
    }
    const gateRow = (): Span[] => {
      const sum = gateSummary(gate)
      const spans: Span[] = [label('GATE'), { text: `${plural(sum.total, 'check')} `, color: C.text }]
      const room = Math.max(0, Math.min(24, cols - 90))
      for (const c of room ? gate.recent.slice(-room) : []) spans.push({ text: VERDICT[c.verdict][0], color: VERDICT[c.verdict][1] })
      spans.push(sep, { text: `${sum.rule} allowed`, color: C.green })
      // In auto mode the classifier clears an ask; otherwise the person did.
      if (sum.cleared) spans.push({ text: ` · ${sum.cleared} ${main.mode === 'auto' ? 'classifier' : 'you'}`, color: C.cleared })
      if (sum.ask) spans.push({ text: ` · ${sum.ask} pending`, color: C.yellow })
      if (sum.deny) spans.push({ text: ` · ${sum.deny} denied`, color: C.red, bold: true })
      spans.push(sep)
      for (const k of ['file', 'shell', 'other'] as const) spans.push({ text: `${k} `, color: C.grey }, { text: `${bucketTotal(gate.totals[k])}  `, color: C.text })
      return spans
    }

    const archRow = (): Span[] => {
      const last = architect.consults[architect.consults.length - 1]
      const spans: Span[] = [
        label('ARCH'),
        isAdvising(architect) ? { text: '◆ advising', color: C.purple, bold: true } : { text: '◇ on call', color: C.grey },
        sep, { text: plural(architect.consults.length, 'consult'), color: C.text },
      ]
      if (last) spans.push(sep, { text: last.moment, color: C.blue })
      if (architect.lastAdvice) spans.push(sep, { text: `» ${architect.lastAdvice}`, color: C.text })
      return spans
    }

    const running = cards.filter(c => c.status === 'running')
    const shown = [...running, ...cards.filter(c => c.status !== 'running').reverse()].slice(0, AGENT_ROWS)
    const GLYPH: Record<string, [string, string]> = { running: ['●', C.green], done: ['✓', C.grey], stopped: ['■', C.yellow], failed: ['✗', C.red] }
    const agentsHead = (): Span[] => [
      label('AGENTS'),
      { text: `${running.length} running`, color: running.length ? C.green : C.grey },
      { text: ` · ${cards.length} total`, color: C.grey },
    ]
    const agentRow = (c: AgentCard): Span[] => {
      const [g, color] = GLYPH[c.status] ?? ['·', C.grey]
      return [
        { text: ' '.repeat(LABEL) },
        { text: `${g} `, color },
        { text: shorten(c.description || c.type, 34).padEnd(35), color: C.text },
        { text: `${shorten(c.type, 18)} · ${prettyModel(c.model)}`, color: C.blue },
        sep,
        { text: `ctx ${fmtTokens(c.ctx)} · out ${fmtTokens(c.out)} · ${c.steps} req`, color: C.grey },
        sep,
        { text: fmtTimer((c.endedAt ?? now) - c.spawnedAt), color: c.status === 'running' ? C.orange : C.grey },
      ]
    }

    const activeLoops = loops.filter(l => !l.isDone && now - l.lastAt < LOOP_ACTIVE_MS).length
    const loopsRow = (): Span[] => [
      label('LOOPS'),
      { text: `${loops.length} seen`, color: C.text },
      { text: ` · ${activeLoops} active`, color: activeLoops ? C.green : C.grey },
    ]

    const KIND: Record<LogLine['kind'], string> = { info: C.text, error: C.red, consult: C.purple, done: C.green }
    const logRow = (l: LogLine, i: number): Span[] => [
      i === 0 ? label('LOG') : { text: ' '.repeat(LABEL) },
      { text: `${fmtTime(l.at)} `, color: C.grey },
      { text: shorten(l.who, 12).padEnd(13), color: C.teal },
      { text: l.text, color: KIND[l.kind] ?? C.text },
    ]

    // Rows the band cannot fit drop by priority, lowest first, the rest keeping their order.
    type Line = { key: string; spans: Span[]; prio: number }
    const fit = (lines: Line[]) => {
      const max = Math.max(1, e.props.maxRows)
      const kept = [...lines]
      while (kept.length > max) {
        const low = kept.reduce((m, l, i) => (l.prio < kept[m]!.prio ? i : m), 0)
        kept.splice(low, 1)
      }
      return (
        <Box flexDirection="column">
          {kept.map(l => row(l.key, l.spans))}
        </Box>
      )
    }

    if (isCompact) {
      const sum = gateSummary(gate)
      const live: Span[] = [working ? { text: '● working', color: C.green } : { text: '○ idle', color: C.grey }]
      if (working && turn.startedAt > 0) live.push({ text: ` · turn ${fmtTimer(now - turn.startedAt)}`, color: C.orange })
      live.push({ text: ` · gate ${sum.total}`, color: C.text })
      if (sum.deny) live.push({ text: ` ✗${sum.deny}`, color: C.red })
      if (cards.length) live.push({ text: ` · agents ${running.length}/${cards.length}`, color: C.blue })
      if (isAdvising(architect)) live.push({ text: ' · advising', color: C.purple })
      return fit([
        { key: 'head', prio: 100, spans: [...logo, ...brandSpans(), sep, { text: model, color: C.teal }, ...(cost ? [sep, { text: cost, color: C.yellow }] : [])] },
        { key: 'live', prio: 90, spans: live },
        { key: 'ctx', prio: 95, spans: contextRow() },
        { key: 'lim', prio: 85, spans: limitsRow() },
        { key: 'cache', prio: 80, spans: cacheRow() },
        { key: 'foot', prio: 70, spans: footer() },
      ])
    }

    const brandText = brandSpans()
    const brandLen = brandText.reduce((n, s) => n + s.text.length, 0)
    const ruleColor = pulse ? C.orange : C.teal
    const date = new Date(now)
    const clock = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    const loc: Span[] = [label('LOC')]
    if (city) loc.push({ text: city, color: C.text }, sep)
    loc.push({ text: clock, color: C.teal })
    if (weather) loc.push(sep, { text: `${weather.tempC}°C ${weather.text}`, color: C.text })
    const env: Span[] = [label('ENV'), { text: 'CC ', color: C.grey }, { text: usage?.version ?? '', color: C.text }, sep, { text: model, color: C.teal, bold: true }]
    if (cost) env.push(sep, { text: cost, color: C.yellow })
    if (usage) env.push(sep, { text: fmtDuration(now - usage.startedAt), color: C.teal })

    const lines: Line[] = [
      { key: 'head', prio: 100, spans: [rule(2, ruleColor), { text: ' ' }, ...logo, ...brandText, { text: ' ' }, rule(cols - brandLen - 6, ruleColor)] },
      { key: 'loc', prio: 55, spans: loc },
      { key: 'env', prio: 80, spans: env },
      { key: 'main', prio: 90, spans: mainRow() },
      { key: 'turn', prio: 85, spans: turnRow() },
      { key: 'gate', prio: 75, spans: gateRow() },
    ]
    if (architect.consults.length || architect.ids.length) lines.push({ key: 'arch', prio: 40, spans: archRow() })
    if (cards.length) {
      lines.push({ key: 'agents', prio: 50, spans: agentsHead() })
      shown.forEach((c, i) => lines.push({ key: `agent${i}`, prio: 45 - i, spans: agentRow(c) }))
    }
    if (loops.length) lines.push({ key: 'loops', prio: 20, spans: loopsRow() })
    const tail = log.slice(-LOG_ROWS)
    tail.forEach((l, i) => lines.push({ key: `log${i}`, prio: 30 - (tail.length - i), spans: logRow(l, i) }))
    lines.push(
      { key: 'ctx', prio: 98, spans: contextRow() },
      { key: 'bd', prio: 52, spans: breakdownRow() },
      { key: 'lim', prio: 96, spans: limitsRow() },
      { key: 'cache', prio: 94, spans: cacheRow() },
      { key: 'foot', prio: 70, spans: footer() },
    )
    return fit(lines)
  })
}
