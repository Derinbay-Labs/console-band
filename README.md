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

The only network call is the optional weather lookup. The band runs `git` in the session's
working directory to show branch, last-commit age and modified-file count. Tool inputs shown in
the log are redacted for common credential formats before they are stored.

## Development

```
claude --plugin-dir .
claude plugin validate .
claude plugin test .
```

## License

MIT. Portions adapted from [claude-flightdeck](https://github.com/scasella/claude-flightdeck)
by Stephen Casella, MIT License.
