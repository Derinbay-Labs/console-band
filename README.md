# console-band

A multi-line console band above the Claude Code prompt: model and environment, a context-window
breakdown by category, session and weekly rate-limit usage with pace, a prompt-cache countdown,
git state, running subagents, permission-gate tallies and a short activity log. It collapses to a
compact row on narrow terminals.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install console-band --marketplace Derinbay-Labs/console-band
```

Answer `y` to add the marketplace, then choose a scope (user scope loads it in every session).

From a shell:

```
claude plugin install console-band --marketplace Derinbay-Labs/console-band
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins,
Add marketplace with `Derinbay-Labs/console-band`, then Add plugin.

Update later with `/plugin update console-band`.

## Options

Set on install, or later from `/plugin`:

| Option | Default | Meaning |
|---|---|---|
| `brand` | `console-band` | Name drawn in the header rule |
| `cacheTtlMinutes` | `5` | Prompt-cache lifetime after a turn; use `60` with a 1-hour cache |
| `city` | empty | Shown on the LOC row; empty hides it |
| `latitude`, `longitude` | empty | Both set enables current weather from open-meteo.com |

## What it runs, reads and sends

- **Programs:** only `git`, with three fixed read-only commands in the session's working
  directory — `git rev-parse --abbrev-ref HEAD`, `git log -1 --format=%ct` and
  `git status --porcelain` — for the branch, last-commit age and modified-file count. It runs
  nothing else and never runs a command it receives from anywhere.
- **Network:** only `https://api.open-meteo.com/v1/forecast`, and only when both `latitude` and
  `longitude` are set. The request carries those two coordinates and nothing else, every 30
  minutes. With either option empty the mod makes no network request at all. No conversation
  content, tool input, usage figure or file content is ever sent.
- **Session data it reads:** model, Claude Code version, context-window breakdown, rate-limit
  percentages and reset times, session cost, and the working directory's name. These are drawn
  in the band and kept only in the session's own plugin state; nothing is written to disk or
  sent anywhere.
- **Credentials:** it reads none. Tool inputs shown in the activity log are passed through a
  redaction step for common credential formats before they are kept in state.

## What each hook does

Every hook observes and passes its event on unchanged with `next(e)`; none blocks, rewrites or
answers for the engine.

| Hook | What it does |
|---|---|
| `tool.call` | After the call settles, records whether it ran or was refused (the gate tally), and counts edits and errors for the turn receipt. The call and its result pass through unchanged; the mod takes no part in permission decisions. |
| `prompt.submit` | Marks the session as working so the band animates. |
| `classic.UserPromptSubmit` | Reads the current permission mode to show on the band. |
| `agent.offer` | Notes which advisor or architect agent types exist, to label their consults. |
| `agent.spawn`, `turn.start`, `turn.step`, `turn.complete` | Track subagent cards, steps, tokens and the turn receipt. |
| `session.start`, `session.measure`, `session.compact`, `session.append`, `session.end` | Refresh usage and git, log compactions and hand-backs, reset state on `/clear`. |
| `ui.render` (`AbovePrompt`) | Draws the band. |

## Development

```
claude --plugin-dir .
claude plugin validate .
claude plugin test .
```

## License

MIT. Portions adapted from [claude-flightdeck](https://github.com/scasella/claude-flightdeck)
by Stephen Casella, MIT License.
