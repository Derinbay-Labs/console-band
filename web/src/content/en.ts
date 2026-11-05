import type { Copy } from "./types";

export const en: Copy = {
  lang: "en",
  nav: [
    ["#features", "Features"],
    ["#privacy", "Privacy"],
    ["#faq", "FAQ"],
  ],
  navcta: "Install",
  gh: "GitHub",
  cmdLabel: "Install command for the Claude Code prompt",
  copy: "Copy",
  copied: "Copied",
  copyFail: "Select the command to copy it",
  cmdNote: "Run it at the Claude Code prompt. Free, MIT licensed.",
  ghBtn: "View on GitHub",
  synthetic: "Sample session shown.",
  srBand: "What the band shows in this sample",
  scenesLabel: "Parts of the band",
  specH: "Facts",
  spec: [
    ["Runs", "Only git, read-only"],
    ["Network", "None by default"],
    ["Narrow terminals", "Compact below 100 columns"],
    ["Licence", "MIT, open source"],
  ],
  featH: "Close up: the work in flight.",
  featP:
    "Context, limits and cache sit in the band above. These rows show who is working and what they were allowed to do.",
  also: [
    [
      "cols",
      "Context by category",
      "System, tools, MCP, agents, memory, skills and messages, reserve dashed.",
    ],
    [
      "play",
      "Limits with pace",
      "Session and weekly use against an even pace, the gap signed.",
    ],
    ["log", "Cache countdown", "Green, amber, red, then cold. 5 or 60 minutes."],
  ],
  howH: "Installed in under a minute.",
  howP: "Three steps at the Claude Code prompt. The desktop app has its own route in the FAQ.",
  steps: [
    ["Run the install command", "Paste it at the prompt of a Claude Code terminal session."],
    [
      "Add the marketplace, pick a scope",
      "Answer y, then choose user scope to load the band in every session.",
    ],
    ["Keep working", "The band draws above the prompt. Update later with one command."],
  ],
  stepChips: [
    "/plugin install console-band --marketplace Derinbay-Labs/console-band",
    "y  ›  user scope",
    "/plugin update console-band",
  ],
  trustH: "It reads your session. It sends nothing.",
  trustP:
    "console-band only observes. Every hook passes its event on unchanged; none blocks, rewrites or answers for Claude Code.",
  ledger: [
    [
      "terminal",
      "Runs",
      "Only git, with three fixed read-only commands in the working directory. Nothing else, and never a command it receives.",
    ],
    [
      "globe",
      "Network",
      "None by default. Set both latitude and longitude and it asks open-meteo.com for the weather every 30 minutes, sending only those two numbers.",
    ],
    [
      "eye",
      "Reads",
      "Model, version, context breakdown, rate limits, session cost and the folder name. Kept in the session’s plugin state, never written to disk.",
    ],
    [
      "key",
      "Credentials",
      "None read. Tool inputs in the activity log pass a redaction step for common credential formats first.",
    ],
  ],
  faqH: "Questions",
  faq: [
    [
      "Does it work in the desktop app?",
      "Yes. /plugin does not run there: click + next to the prompt box, then Plugins, Add marketplace with `Derinbay-Labs/console-band`, then Add plugin.",
    ],
    [
      "What happens in a narrow terminal?",
      "Below 100 columns the band collapses to six compact rows: model and cost, live state, context, limits, cache and folder.",
    ],
    [
      "Can I install it from a shell?",
      "Yes: `claude plugin install console-band --marketplace Derinbay-Labs/console-band`",
    ],
    [
      "Can it block or change what Claude Code does?",
      "No. Every hook passes its event on unchanged, and the band takes no part in permission decisions.",
    ],
    [
      "What can I configure?",
      "`brand` sets the name in the header rule, `cacheTtlMinutes` matches a 5- or 60-minute cache, `city` adds a LOC row, and latitude with longitude add the weather.",
    ],
  ],
  finalH: "Put the band above your prompt.",
  finalP:
    "One command at the Claude Code prompt. Update it later with /plugin update console-band.",
  footTag: "A live status band above the Claude Code prompt.",
  footLinks: [
    ["GitHub", "https://github.com/Derinbay-Labs/console-band"],
    ["Privacy", "#privacy"],
    ["Contact", "https://github.com/Derinbay-Labs/console-band/issues"],
    ["MIT licence", "https://github.com/Derinbay-Labs/console-band/blob/main/LICENSE"],
  ],
  labs: "A Derinbay Labs project",
  labsSmall: "Derinbay Labs builds small software that does one job well.",
  copyright: "© 2026 Derinbay Labs",
  footNote: "Portions adapted from claude-flightdeck (MIT).",
  footNav: "Footer",
  title: "console-band: Claude Code status line | Derinbay Labs",
  ogAlt:
    "The console-band status band above a Claude Code prompt, with the install command on the prompt line.",
  h1: "Everything above the prompt.",
  lead: "A multi-line band that shows what your Claude Code session is using, how fast, and what is running, right where you type.",
  scenes: [
    ["session", "Session", "Model, loop, turn"],
    ["usage", "Usage", "Context, limits, cache"],
    ["work", "Work", "Gate, agents, log"],
    ["place", "Place", "Clock, folder, git"],
  ],
  notes: {
    session: [
      ["env", "ENV", "Claude Code version, model, session cost and time."],
      ["main", "MAIN", "Working or idle, effort, permission mode and requests."],
      ["turn main", "TURN", "The live turn, then its receipt when it ends."],
    ],
    usage: [
      ["ctx", "CONTEXT", "The context window by category, reserve dashed."],
      ["lim", "SESSION · WEEKLY", "Both limits against an even pace, the gap signed."],
      ["cache", "CACHE", "Time left before the prompt cache goes cold."],
    ],
    work: [
      ["gate", "GATE", "Permission checks by verdict and by kind."],
      ["agents", "AGENTS", "Up to three subagent cards, running ones first."],
      ["log", "LOG", "The last three events, timed to the second."],
    ],
    place: [
      ["loc", "LOC", "The clock, plus city and weather if you set them."],
      ["foot", "PWD", "Folder, branch, last-commit age and modified files."],
    ],
  },
  feats: [
    [
      "Watch subagents while they work",
      "Each subagent gets a card: task, type and model, context and output tokens, requests and elapsed time. Running ones come first.",
    ],
    [
      "Tally every permission check",
      "A strip of the latest verdicts on wide terminals, then allowed, cleared by you, pending and denied, with totals for file, shell and other.",
    ],
    [
      "Read the last three events",
      "Spawns, hand-backs, edits, errors and refusals, timed to the second and tagged with who did it.",
    ],
  ],
  gl: [
    ["✓", "k-gr", "allowed"],
    ["✓", "k-cl", "cleared by you"],
    ["?", "k-y", "pending"],
    ["✗", "k-r", "denied"],
  ],
  skip: "Skip to content",
  description:
    "A Claude Code plugin that adds a multi-line band above the prompt: context breakdown, session and weekly limits with pace, cache countdown, git.",
};
