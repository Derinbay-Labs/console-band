// Band engine: a port of the ui.render layout in the plugin's hooks/register.tsx, fed with
// synthetic sample sessions. Pure functions, no DOM, so the layout is unit-testable.

export type Tone = "t" | "o" | "gr" | "y" | "r" | "p" | "b" | "g" | "d" | "x" | "cl";
export interface Span {
  text: string;
  c: Tone;
  b: boolean;
}
export interface Row {
  k: string;
  hl: string;
  spans: Span[];
}
export type SceneName = "mid" | "agents" | "cool";
type AgentState = "running" | "done";
type AgentCard = [AgentState, string, string, string, number, number, number, string];
type LogLine = [string, string, string, Tone];
interface Gate {
  recent: string;
  rule: number;
  cleared: number;
  ask: number;
  deny: number;
  file: number;
  shell: number;
  other: number;
}
export interface Scene {
  working: boolean;
  effort: string;
  mode: string;
  req: number;
  turn?: string;
  edits?: number;
  errors?: number;
  receipt?: { dur: string; agents: number; edits: number; cost: string };
  gate: Gate;
  agents: AgentCard[];
  log: LogLine[];
  msgs: number;
  pct: number;
  s: number;
  sp: number;
  wk: number;
  wp: number;
  cache: number;
  ttl: number;
  cost: string;
  dur: string;
  clock: string;
  dir: string;
  branch: string;
  age: string;
  mod: number;
  city?: string;
  weather?: string;
}
export interface RowOptions {
  full?: boolean;
  city?: boolean;
  patch?: Partial<Scene>;
  keys?: readonly string[] | null;
}

export const LABEL = 9;
const sp = (text: string, c: Tone = "x", b = false): Span => ({ text, c, b });
const lab = (t: string) => sp(t.padEnd(LABEL), "g");
const SEP = () => sp("  │  ", "d");
const rule = (n: number, c: Tone = "d") => sp("─".repeat(Math.max(0, n)), c);
const fill = (n: number, c: Tone) => sp("━".repeat(Math.max(0, n)), c);
export const lvl = (p: number): Tone => (p >= 80 ? "r" : p >= 50 ? "y" : "gr");

export const fmtCount = (n: number): string =>
  n >= 1e6
    ? `${(n / 1e6).toFixed(1)}M`
    : n >= 1e4
      ? `${Math.round(n / 1000)}k`
      : n >= 1000
        ? `${(n / 1000).toFixed(1)}k`
        : String(Math.round(n));
export const fmtClock = (s: number): string =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

const SEGS: [string, Tone, number][] = [
  ["system", "g", 3100],
  ["tools", "x", 12400],
  ["mcp", "t", 4200],
  ["agents", "b", 2300],
  ["memory", "o", 3600],
  ["skills", "y", 1900],
];

export const SCENES: Record<SceneName, Scene> = {
  mid: {
    working: true,
    effort: "high",
    mode: "acceptEdits",
    req: 48,
    turn: "0:42",
    edits: 3,
    errors: 0,
    gate: {
      recent: "✓✓✓✓?✓✓✓✓✓✓✓✗✓✓✓✓✓✓✓✓✓✓✓",
      rule: 27,
      cleared: 2,
      ask: 1,
      deny: 1,
      file: 14,
      shell: 12,
      other: 5,
    },
    agents: [],
    log: [
      ["14:31:02", "main", "Edit api/limits.go", "x"],
      ["14:31:40", "main", "Bash go test ./...  ✗", "r"],
      ["14:32:05", "main", "Edit api/limits_test.go", "x"],
    ],
    msgs: 98000,
    pct: 62,
    s: 41,
    sp: 35,
    wk: 58,
    wp: 62,
    cache: 252,
    ttl: 300,
    cost: "$3.42",
    dur: "1h12m",
    clock: "14:32",
    dir: "api-gateway",
    branch: "feat/rate-limit",
    age: "18m",
    mod: 4,
  },
  agents: {
    working: true,
    effort: "high",
    mode: "acceptEdits",
    req: 61,
    turn: "2:06",
    edits: 7,
    errors: 0,
    gate: {
      recent: "✓✓✓✓✓✓✓✓✓✓✓✓✓✓?✓✓✓✓✓✓✓✓✓",
      rule: 38,
      cleared: 3,
      ask: 1,
      deny: 1,
      file: 22,
      shell: 15,
      other: 6,
    },
    agents: [
      ["running", "Map rate-limit middleware", "Explore", "Sonnet 5.5", 38000, 2100, 9, "1:14"],
      [
        "running",
        "Write tests for token bucket",
        "general-purpose",
        "Sonnet 5.5",
        22000,
        4800,
        12,
        "0:51",
      ],
      ["done", "Review limits.go diff", "code-reviewer", "Opus 5.5", 41000, 1600, 7, "1:52"],
    ],
    log: [
      ["14:40:11", "Map rate-li…", "spawned · Explore", "x"],
      ["14:40:30", "Write tests…", "spawned · general-purpose", "x"],
      ["14:41:02", "Review limi…", "done · 1m52s", "gr"],
    ],
    msgs: 112000,
    pct: 71,
    s: 52,
    sp: 44,
    wk: 60,
    wp: 62,
    cache: 280,
    ttl: 300,
    cost: "$4.10",
    dur: "1h21m",
    clock: "14:41",
    dir: "api-gateway",
    branch: "feat/rate-limit",
    age: "27m",
    mod: 6,
  },
  cool: {
    working: false,
    effort: "high",
    mode: "acceptEdits",
    req: 74,
    receipt: { dur: "3m14s", agents: 2, edits: 5, cost: "$0.84" },
    gate: {
      recent: "✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✗✓✓✓✓",
      rule: 44,
      cleared: 3,
      ask: 0,
      deny: 2,
      file: 25,
      shell: 18,
      other: 6,
    },
    agents: [
      ["done", "Map rate-limit middleware", "Explore", "Sonnet 5.5", 44000, 2600, 11, "6:10"],
      [
        "done",
        "Write tests for token bucket",
        "general-purpose",
        "Sonnet 5.5",
        31000,
        6200,
        15,
        "4:33",
      ],
    ],
    log: [
      ["14:49:27", "Map rate-li…", "done · 6m10s", "gr"],
      ["14:49:58", "main", "Edit api/limits.go", "x"],
      ["14:50:10", "gate", "denied · Bash git push", "r"],
    ],
    msgs: 121000,
    pct: 74,
    s: 82,
    sp: 63,
    wk: 64,
    wp: 63,
    cache: 41,
    ttl: 300,
    cost: "$4.94",
    dur: "1h32m",
    clock: "14:52",
    dir: "api-gateway",
    branch: "feat/rate-limit",
    age: "4m",
    mod: 2,
    city: "Istanbul",
    weather: "17°C partly cloudy",
  },
};

export function rowsFor(name: SceneName, cols: number, opt: RowOptions = {}): Row[] {
  const s: Scene = { ...SCENES[name], ...(opt.patch ?? {}) };
  const compact = !opt.full && cols < 100;
  const segs: [string, Tone, number][] = [...SEGS, ["msgs", "p", s.msgs]];
  const win = 200000;
  const reserved = 33000;
  const R: Row[] = [];
  const add = (k: string, hl: string, spans: Span[]) => R.push({ k, hl, spans });
  const logo2 = [sp("┃", "t", true), sp("┃ ", "o", true)];

  const ctx = (): Span[] => {
    const right = `${String(s.pct).padStart(4)}%`;
    const w = cols - LABEL - right.length - 1;
    const out = [lab("CONTEXT")];
    let used = 0;
    for (const [, c, tok] of segs) {
      const n = Math.min(w - used, Math.max(1, Math.round((tok / win) * w)));
      if (n <= 0) break;
      out.push(fill(n, c));
      used += n;
    }
    const rs = Math.min(w - used, Math.round((reserved / win) * w));
    out.push(
      rule(w - used - rs),
      sp("-".repeat(Math.max(0, rs)), "g"),
      sp(` ${right}`, "t", true),
    );
    return out;
  };
  const bd = (): Span[] => {
    const tooling = segs.reduce((a, x) => a + x[2], 0) - s.msgs;
    const out = [
      sp(" ".repeat(LABEL)),
      sp("tooling ", "g"),
      sp(fmtCount(tooling), "t", true),
      sp(" · ", "d"),
      sp(`${Math.round((tooling / win) * 100)}%`, "t", true),
      SEP(),
    ];
    for (const [l, c, tok] of segs)
      out.push(sp("━ ", c), sp(`${l} `, "g"), sp(`${fmtCount(tok)}  `));
    return out;
  };
  const side = (used: number, pace: number, w: number): [string, Tone][] => {
    const n = Math.round((Math.min(100, used) / 100) * w);
    const p = Math.min(w - 1, Math.round((pace / 100) * w));
    const lc = lvl(used);
    return Array.from({ length: Math.max(0, w) }, (_, i): [string, Tone] =>
      i === p ? ["┃", "b"] : i < n ? ["━", i > p ? "r" : lc] : i < p ? ["┄", "b"] : ["─", "d"],
    );
  };
  const runs = (cells: [string, Tone][]): Span[] =>
    cells.reduce<Span[]>((o, [ch, c]) => {
      const l = o[o.length - 1];
      if (l && l.c === c) l.text += ch;
      else o.push(sp(ch, c));
      return o;
    }, []);
  const delta = (u: number, p: number): Span => {
    const d = Math.round(u - p);
    return sp(d > 0 ? `+${d}` : d < 0 ? `−${-d}` : "±0", d <= 0 ? "gr" : d <= 10 ? "y" : "r");
  };
  const lim = (): Span[] => {
    const sPct = `${s.s}%`.padEnd(4);
    const wPct = `${s.wk}%`;
    const sd = delta(s.s, s.sp);
    const wd = delta(s.wk, s.wp);
    const sDelta = sd.text.padEnd(4);
    const wDelta = ` ${wd.text}`;
    const mid =
      cols - LABEL - sPct.length - sDelta.length - 1 - (2 + wPct.length + wDelta.length + 7);
    const half = Math.floor((mid - 1) / 2);
    return [
      lab("SESSION"),
      sp(sPct, lvl(s.s), true),
      sp(sDelta, sd.c),
      sp(" "),
      ...runs(side(s.s, s.sp, half).reverse()),
      sp("◆", s.s >= s.wk ? lvl(s.s) : lvl(s.wk)),
      ...runs(side(s.wk, s.wp, mid - 1 - half)),
      sp("  "),
      sp(wPct, lvl(s.wk), true),
      sp(wDelta, wd.c),
      sp(" WEEKLY", "g"),
    ];
  };
  const cache = (): Span[] => {
    const cold = s.cache <= 0;
    const right = cold ? "cold" : fmtClock(s.cache);
    const w = cols - LABEL - 7;
    const n = cold ? 0 : Math.max(1, Math.round((s.cache / s.ttl) * w));
    const c: Tone = cold
      ? "r"
      : s.cache / s.ttl < 0.2
        ? "r"
        : s.cache / s.ttl < 0.5
          ? "y"
          : "gr";
    return [lab("CACHE"), fill(n, c), rule(w - n), sp(right.padStart(7), c, true)];
  };
  const foot = (): Span[] =>
    compact
      ? [sp("◆ ", "t"), sp(s.dir), sp(` (${s.branch})`, "t")]
      : [
          sp("◆ ", "t"),
          sp("PWD ", "g"),
          sp(s.dir),
          SEP(),
          sp("⎇ ", "g"),
          sp(s.branch, "t"),
          SEP(),
          sp("Age ", "g"),
          sp(s.age, "gr"),
          SEP(),
          sp("Mod ", "g"),
          sp(String(s.mod)),
        ];

  const g = s.gate;
  const total = g.rule + g.cleared + g.ask + g.deny;
  const running = s.agents.filter((a) => a[0] === "running");

  if (compact) {
    const live = [s.working ? sp("● working", "gr") : sp("○ idle", "g")];
    if (s.working) live.push(sp(` · turn ${s.turn ?? ""}`, "o"));
    live.push(sp(` · gate ${total}`));
    if (g.deny) live.push(sp(` ✗${g.deny}`, "r"));
    if (s.agents.length) live.push(sp(` · agents ${running.length}/${s.agents.length}`, "b"));
    add("head", "env", [
      ...logo2,
      sp("console-band", "t", true),
      SEP(),
      sp("Opus 5.5", "t"),
      SEP(),
      sp(s.cost, "y"),
    ]);
    add("live", "main", live);
    add("ctx", "ctx", ctx());
    add("lim", "lim", lim());
    add("cache", "cache", cache());
    add("foot", "foot", foot());
  } else {
    add("head", "head", [
      rule(2, "t"),
      sp(" "),
      ...logo2,
      sp("console-band", "t", true),
      sp(" "),
      rule(cols - 12 - 6, "t"),
    ]);
    const loc = [lab("LOC")];
    if (s.city && opt.city) loc.push(sp(s.city), SEP());
    loc.push(sp(s.clock, "t"));
    if (s.weather && opt.city) loc.push(SEP(), sp(s.weather));
    add("loc", "loc", loc);
    add("env", "env", [
      lab("ENV"),
      sp("CC ", "g"),
      sp("2.4.1"),
      SEP(),
      sp("Opus 5.5", "t", true),
      SEP(),
      sp(s.cost, "y"),
      SEP(),
      sp(s.dur, "t"),
    ]);
    add("main", "main", [
      lab("MAIN"),
      s.working ? sp("● working", "gr", true) : sp("○ idle", "g"),
      SEP(),
      sp("effort ", "g"),
      sp("▮▮▮", "o"),
      sp("▯ ", "d"),
      sp(s.effort),
      SEP(),
      sp("mode ", "g"),
      sp(s.mode),
      SEP(),
      sp(`${s.req} req`),
    ]);
    const turn = [lab("TURN")];
    if (s.working) {
      turn.push(sp(`◐ turn ${s.turn ?? ""}`, "o", true));
      if (s.edits) turn.push(sp(` · ${plural(s.edits, "edit")}`));
      if (s.errors) turn.push(sp(` · ${plural(s.errors, "error")}`, "r"));
    } else if (s.receipt) {
      const r = s.receipt;
      turn.push(
        sp(`✓ last turn ${r.dur}`, "gr"),
        sp(` · ${plural(r.agents, "agent")}`, "b"),
        sp(` · ${plural(r.edits, "edit")}`),
        sp(` · +${r.cost}`, "y"),
      );
    }
    add("turn", "turn", turn);
    const gate = [lab("GATE"), sp(`${plural(total, "check")} `)];
    const room = Math.max(0, Math.min(24, cols - 90));
    for (const ch of room ? [...g.recent].slice(-room) : [])
      gate.push(sp(ch, ch === "✓" ? "gr" : ch === "?" ? "y" : "r"));
    gate.push(SEP(), sp(`${g.rule} allowed`, "gr"));
    if (g.cleared) gate.push(sp(` · ${g.cleared} you`, "cl"));
    if (g.ask) gate.push(sp(` · ${g.ask} pending`, "y"));
    if (g.deny) gate.push(sp(` · ${g.deny} denied`, "r", true));
    gate.push(SEP());
    for (const k of ["file", "shell", "other"] as const)
      gate.push(sp(`${k} `, "g"), sp(`${g[k]}  `));
    add("gate", "gate", gate);
    if (s.agents.length) {
      add("agents", "agents", [
        lab("AGENTS"),
        sp(`${running.length} running`, running.length ? "gr" : "g"),
        sp(` · ${s.agents.length} total`, "g"),
      ]);
      const GL: Record<AgentState, [string, Tone]> = { running: ["●", "gr"], done: ["✓", "g"] };
      [...running, ...s.agents.filter((a) => a[0] !== "running")]
        .slice(0, 3)
        .forEach(([st, desc, type, model, c, o, req, t], i) => {
          const [glyph, tone] = GL[st];
          add(`agent${i}`, "agents", [
            sp(" ".repeat(LABEL)),
            sp(`${glyph} `, tone),
            sp(desc.padEnd(35)),
            sp(`${type} · ${model}`, "b"),
            SEP(),
            sp(`ctx ${fmtCount(c)} · out ${fmtCount(o)} · ${req} req`, "g"),
            SEP(),
            sp(t, st === "running" ? "o" : "g"),
          ]);
        });
    }
    s.log.forEach(([t, who, text, k], i) =>
      add(`log${i}`, "log", [
        i ? sp(" ".repeat(LABEL)) : lab("LOG"),
        sp(`${t} `, "g"),
        sp(who.padEnd(13), "t"),
        sp(text, k),
      ]),
    );
    add("ctx", "ctx", ctx());
    add("bd", "ctx", bd());
    add("lim", "lim", lim());
    add("cache", "cache", cache());
    add("foot", "foot", foot());
  }
  const keys = opt.keys;
  return keys ? R.filter((r) => keys.includes(r.k)) : R;
}

/** Cuts a row to `cols` characters, like a terminal would. */
export function clip(spans: Span[], cols: number): Span[] {
  const out: Span[] = [];
  let left = cols;
  for (const x of spans) {
    if (left <= 0) break;
    out.push(x.text.length > left ? { ...x, text: x.text.slice(0, left) } : x);
    left -= x.text.length;
  }
  return out;
}

/** Columns that fit a container: whole characters minus one, within [min, max]. */
export function fitCols(innerWidth: number, charWidth: number, min = 30, max = 999): number {
  const avail = Math.floor(innerWidth / charWidth) - 1;
  return Math.max(min, Math.min(max, avail));
}

/** Screen-reader summary of a band scene (the drawn band itself is aria-hidden). */
export function srBand(name: SceneName, lang: "en" | "tr"): string[] {
  const s = SCENES[name];
  const tr = lang === "tr";
  const g = s.gate;
  const total = g.rule + g.cleared + g.ask + g.deny;
  const d = (u: number, p: number): string => {
    const x = u - p;
    return tr
      ? x > 0
        ? `temponun ${x} puan önünde`
        : x < 0
          ? `temponun ${-x} puan gerisinde`
          : "tempoda"
      : x > 0
        ? `${x} points ahead of pace`
        : x < 0
          ? `${-x} points behind pace`
          : "on pace";
  };
  const lastTurn = s.receipt?.dur ?? "";
  const nRunning = s.agents.filter((a) => a[0] === "running").length;
  return tr
    ? [
        `Model Opus 5.5, oturum maliyeti ${s.cost}`,
        s.working
          ? `Ana döngü çalışıyor, tur ${s.turn ?? ""}`
          : `Ana döngü boşta, son tur ${lastTurn}`,
        `Bağlam yüzde ${s.pct} dolu`,
        `Oturum limiti yüzde ${s.s}, ${d(s.s, s.sp)}; haftalık yüzde ${s.wk}, ${d(s.wk, s.wp)}`,
        `Önbellek: ${s.cache > 0 ? `${fmtClock(s.cache)} kaldı` : "soğudu"}`,
        `${total} izin kontrolü, ${g.deny} reddedildi`,
        s.agents.length ? `${nRunning} alt ajan çalışıyor` : "Alt ajan yok",
        `Dal ${s.branch}, ${s.mod} değişmiş dosya`,
      ]
    : [
        `Model Opus 5.5, session cost ${s.cost}`,
        s.working
          ? `Main loop working, turn ${s.turn ?? ""}`
          : `Main loop idle, last turn ${lastTurn}`,
        `Context ${s.pct}% used`,
        `Session limit ${s.s}%, ${d(s.s, s.sp)}; weekly ${s.wk}%, ${d(s.wk, s.wp)}`,
        `Prompt cache: ${s.cache > 0 ? `${fmtClock(s.cache)} left` : "cold"}`,
        `${total} permission checks, ${g.deny} denied`,
        s.agents.length ? `${nRunning} subagents running` : "No subagents",
        `Branch ${s.branch}, ${s.mod} modified files`,
      ];
}
