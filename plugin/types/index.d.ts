export type Segment = { label: string; tokens: number; color: string }

export type Usage = {
  model: string
  version: string
  startedAt: number
  costUsd: number | null
  window: number
  tokens: number | null
  percent: number | null
  segments: Segment[]
  messages: number
  reserved: number
  session: number | null
  weekly: number | null
  sessionResetsAt: number | null
  weeklyResetsAt: number | null
}

export type Git = { dir: string; branch: string | null; ageMinutes: number | null; modified: number }

export type Weather = { tempC: number; text: string }

export type Moment = 'before a plan' | 'error repeats' | 'before done'

export type Bucket = 'file' | 'shell' | 'other'

/** rule: settings allowed it. ask: put to the decider, outcome pending. cleared: asked, then ran. deny: refused. */
export type Verdict = 'rule' | 'ask' | 'cleared' | 'deny'

export type Main = { effort: string; mode: string; steps: number; isRunning: boolean; compactions: number }

export type Consult = { id: string; at: number; endAt: number | null; moment: Moment; via: string }

export type Architect = { consults: Consult[]; ids: string[]; seen: string[]; lastAdvice: string }

export type Check = { id: string; tool: string; bucket: Bucket; verdict: Verdict; inSubagent: boolean; detail: string; at: number }

export type Tally = { rule: number; ask: number; cleared: number; deny: number }

export type Gate = { recent: Check[]; totals: Record<Bucket, Tally> }

export type AgentCard = {
  id: string
  type: string
  model: string
  description: string
  status: string
  spawnedAt: number
  endedAt: number | null
  ctx: number
  out: number
  steps: number
  lastStop: string | null
}

/** A model loop whose id matches no card: a workflow agent, a compaction or a memory fork. */
export type Loop = { id: string; steps: number; firstAt: number; lastAt: number; isDone: boolean }

export type LogLine = { at: number; who: string; text: string; kind: 'info' | 'error' | 'consult' | 'done' }

export type Turn = { edits: number; errorStreak: number; errors: number; isReviewing: boolean; startedAt: number; costAtStart: number | null }

export type Receipt = { durationMs: number; agents: number; edits: number; errors: number; costDelta: number | null; reason: string }

declare module 'claude-code' {
  interface PluginState {
    'console-band': {
      usage: Usage | null
      git: Git | null
      weather: Weather | null
      lastTurnAt: number | null
      now: number
      pulse: boolean
      main: Main
      architect: Architect
      architectTypes: string[]
      gate: Gate
      agents: AgentCard[]
      loops: Loop[]
      log: LogLine[]
      turn: Turn
      receipt: Receipt | null
    }
  }
}
