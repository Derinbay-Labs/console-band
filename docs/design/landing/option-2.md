# Option 2: Prompt Line

Mockup: [mockups/option-2.html](mockups/option-2.html).

## Direction

Ocean blues and a centred headline: "Everything above the prompt." Hero and stage become one
picture. A wide terminal on the sweep shows the full band, and directly beneath it, on the
terminal's own prompt line, sits the install command with its copy button. The stage tabs are an
anatomy of the band in four groups: session, usage, work and place. Choosing a group lights its
rows. The close-ups move past the usual context and limits to what makes console-band unusual:
subagent cards, the permission gate and the activity log.

## 1. User goal

The same as [Option 1](option-1.md#1-user-goal).

## 2. Entry points

The same as [Option 1](option-1.md#2-entry-points).

## 3. Flow

1. Read the headline.
2. See the band and the command in one frame, and copy the command from the prompt line.
3. Optionally switch anatomy tabs, which light row groups, and press notes for single rows.
4. Read the close-ups.
5. Check the trust ledger.
6. Install from the final CTA.

## 4. Options

See [README.md](README.md). This option departs from the base in the hero. The headline is
centred, the base's light command block moves into the terminal as a dark prompt-line CTA, and
the tabs sit below the device instead of above it.

## 5. Screen states

| State | Behaviour |
|---|---|
| Empty | Not applicable. Static page with bundled sample data. |
| Loading | Fallback fonts first. The bands repaint once fonts are ready. |
| Error | If the clipboard is refused, the command text is selected and "Select the command to copy it" is announced. |
| Partial data | Below 100 columns the band is compact. Each anatomy tab lights whichever of its rows exist, and notes for absent rows are hidden. |
| Offline | System font fallbacks. Nothing else needs the network. |

## 6. Components and tokens

| Token | Light | Dark |
|---|---|---|
| `--ground` | `#F2F7FA` | `#08131A` |
| `--wall` | `#CFE3EE` | `#0F2733` |
| `--floor` | `#E6F0F6` | `#0B1C26` |
| `--surface` | `#FFFFFF` | `#10222D` |
| `--surface-2` | `#EAF3F8` | `#163040` |
| `--ink` | `#0B1D29` | `#E2EFF6` |
| `--mut` | `#3F5A6B` | `#96B6C8` |
| `--line` | `#C4D8E4` | `#23404F` |
| `--accent` | `#0B5F86` | `#5FC1EC` |
| `--accent-ink` | `#FFFFFF` | `#04202E` |
| `--accent-soft` | `#D3E8F3` | `#11374A` |
| `--term` | `#08171F` | `#051017` |
| `--term-accent` (new) | `#5FC1EC` | `#5FC1EC` |
| `--term-accent-ink` (new) | `#04202E` | `#04202E` |

Band colours are the same fixed `--k-*` set as in [Option 1](option-1.md#6-components-and-tokens).

New pattern: the **prompt-line CTA** (`.cmd-term`). The base command block is light, and inside a
dark terminal it would break the picture. So this variant has a transparent field, band-text ink
and the `--term-accent` button. The terminal is dark in both themes, so `--term-accent` is one
value.

Close-ups:

1. Turn and agents rows with three subagent cards.
2. The gate row, with a glyph key: allowed, cleared by you, pending, denied. Each glyph is
   labelled in words.
3. The three-line activity log.

## Contrast (WCAG 2.2, measured)

| Pair | Light | Dark |
|---|---|---|
| ink on ground / surface / wall | 15.92 / 17.19 / 12.99 | 16.02 / 13.90 / 13.19 |
| mut on ground / surface / wall | 6.74 / 7.28 / 5.50 | 8.78 / 7.62 / 7.23 |
| mut on accent-soft | 5.75 | 5.88 |
| accent-ink on accent | 7.01 | 8.25 |
| accent on wall | 5.30 | 7.60 |
| term-accent-ink on term-accent (prompt CTA) | 8.25 | 8.25 |
| command text `#d8dee9` on term | 13.49 | 13.49 |
| lowest band colour (red) on term | 4.89 | 5.16 |

The prompt-line field border (`#3a3f47` on term, 1.72:1) is decorative. The control is the copy
button, which meets 3:1 on its own.

## 7. Copy (EN / TR)

| Key | EN | TR |
|---|---|---|
| H1 | Everything above the prompt. | İstemin üstünde, her şey. |
| Tabs | Session; Usage; Work; Place | Oturum; Kullanım; İş; Konum |
| Features heading | Close up: the work in flight. | Yakından: süren iş. |

## 8. Accessibility acceptance criteria

The same as [Option 1](option-1.md#8-accessibility-acceptance-criteria), plus:

- **Focus order in the hero:**
  1. headline (not focusable)
  2. device panel
  3. prompt-line copy button
  4. GitHub
  5. anatomy tabs
  6. notes
- Focus rings inside the terminal use `--term-accent` (8.96:1 on term), not `--accent`, because
  the light-theme accent fails on the dark terminal.
- Each tab lights several rows at once. Lighting is visual only, and the screen-reader list of
  the scene is unchanged.

## 9. Platform notes

- At 1100 px and wider the band text grows to 14.5 px so the hero terminal fills the width.
- Below 860 px the four tabs form a 2 × 2 grid. Below 100 columns the band is compact, so the
  anatomy demo shows fewer rows on phones.

## 10. Open questions

- Putting the CTA inside the terminal changes the base's command block. Is that within "hero
  treatment", or is it a base change? Who decides: CEO, by picking or rejecting this option.
- See also the shared list in [README.md](README.md).

## Trade-offs

- **For:** the most product-specific hero. You see the band and how to get it in one frame, and
  the close-ups show features other status lines lack.
- **Against:**
  - It changes the base's command block more than the other options do.
  - On phones the hero band is compact and the anatomy demo loses rows.
  - Context, limits and cache move out of the close-ups and into the `.also` list.
