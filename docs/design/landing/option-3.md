# Option 3: Width Sweep

Mockup: [mockups/option-3.html](mockups/option-3.html).

## Direction

Azure, and a headline that leads with the reason to install: "Stay ahead of the limit." The
headline and the install command sit on the left. On the right, a narrow terminal on its own
small sweep shows the compact band. The stage then demonstrates the plugin's adaptive layout. The
tabs set the terminal to 140, 104 or 72 columns, the window animates to that width, and the band
redraws: the gate strip appears past 90 columns, rows are clipped rather than wrapped, and below
100 columns the band goes compact. The close-ups explain how to read the pace marker, the cache
countdown, and the location and git rows.

## 1. User goal

The same as [Option 1](option-1.md#1-user-goal), with the stress on limits: a user who has hit a
usage limit and wants warning before the next one.

## 2. Entry points

The same as [Option 1](option-1.md#2-entry-points).

## 3. Flow

1. Read the headline.
2. Copy the command, which is beside the headline.
3. Switch widths and watch the band adapt. Notes explain each change.
4. Read the pace legend and the other close-ups.
5. Check the trust ledger.
6. Install from the final CTA.

## 4. Options

See [README.md](README.md). This option keeps the base's 6/5 hero head, puts a second, smaller
sweep around the hero terminal, and turns the stage tabs into a width control.

## 5. Screen states

| State | Behaviour |
|---|---|
| Empty | Not applicable. Static page with bundled sample data. |
| Loading | Fallback fonts first. The bands repaint once fonts are ready, and the column label updates. |
| Error | Clipboard refusal selects the command and announces the fallback instruction. |
| Partial data | Notes for rows absent at the chosen width are hidden. At 72 columns the notes describe the compact rows. |
| Offline | System font fallbacks. Nothing else needs the network. |

## 6. Components and tokens

| Token | Light | Dark |
|---|---|---|
| `--ground` | `#F6F8FE` | `#0B0E1A` |
| `--wall` | `#DCE5FB` | `#151D3A` |
| `--floor` | `#EEF2FD` | `#0F1529` |
| `--surface` | `#FFFFFF` | `#141A2E` |
| `--surface-2` | `#F1F4FD` | `#1B2340` |
| `--ink` | `#0F1630` | `#E7EAF7` |
| `--mut` | `#4A5272` | `#A6ADCB` |
| `--line` | `#D0D9F0` | `#283256` |
| `--accent` | `#2450C8` | `#9DB7FF` |
| `--accent-ink` | `#FFFFFF` | `#0A1433` |
| `--accent-soft` | `#E0E8FD` | `#1F2C58` |
| `--term` | `#0D1124` | `#080B18` |

Band colours are the same fixed `--k-*` set as in [Option 1](option-1.md#6-components-and-tokens).

New pattern: the **width window** (`.o3-win`). Its width is `--cols × 1ch` plus padding, and it
eases between widths in 0.6 s. The title bar shows the live column count. No base component
demonstrates responsive output, and that behaviour is the point here.

Close-ups:

1. The limits row at large size, with a four-item pace legend. Each item pairs the glyph with a
   sentence: the pace mark, use past it, room left, and the signed gap.
2. Four cache rows: 4:28 green, 1:58 amber, 0:41 red, then "cold".
3. The LOC row (clock, city, weather) and the folder and git row.

## Contrast (WCAG 2.2, measured)

| Pair | Light | Dark |
|---|---|---|
| ink on ground / surface / wall | 16.79 / 17.83 / 14.13 | 16.04 / 14.39 / 13.80 |
| mut on ground / surface / wall | 7.21 / 7.66 / 6.07 | 8.66 / 7.77 / 7.46 |
| mut on accent-soft | 6.25 | 6.07 |
| accent-ink on accent | 6.87 | 9.18 |
| accent on wall | 5.45 | 8.40 |
| lowest band colour (red) on term | 5.02 | 5.27 |

## 7. Copy (EN / TR)

| Key | EN | TR |
|---|---|---|
| H1 | Stay ahead of the limit. | Limitin önünde kalın. |
| Tabs | 140 columns; 104 columns; 72 columns | 140 sütun; 104 sütun; 72 sütun |
| Pace legend | where even use would be now; use past that point; room left before the pace mark; points ahead of pace (− means behind) | eşit kullanımda şu an olmanız gereken yer; o noktayı aşan kullanım; tempo işaretine kadar kalan pay; temponun puan olarak önünde (− geride demek) |

## 8. Accessibility acceptance criteria

The same as [Option 1](option-1.md#8-accessibility-acceptance-criteria), plus:

- On narrow screens the width window's body scrolls sideways. It is a focusable region
  (`tabindex="0"`, `role="region"`) labelled "Band preview, scrolls sideways on narrow screens",
  so keyboard users can scroll it with the arrow keys.
- The width animation is off under `prefers-reduced-motion`.
- The pace legend is a labelled list. Every glyph has a sentence, so no meaning rests on colour or
  shape alone.

## 9. Platform notes

- Desktop shows the true widths. On a 390 px phone a 140-column band cannot fit, so the band
  draws at full width inside a sideways scroll, and the hero's compact terminal carries the
  phone story.

## 10. Open questions

- Leading with limits puts one feature ahead of the others. Is that the product's main promise?
  Who decides: product-manager.
- See also the shared list in [README.md](README.md).

## Trade-offs

- **For:** it shows behaviour no screenshot can show, and the limits story is the sharpest
  install reason.
- **Against:** it narrows the pitch to limits. The stage is the most interactive and so the most
  work to build. On phones the stage relies on sideways scrolling.
