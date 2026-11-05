# Option 1: Control Room

Mockup: [mockups/option-1.html](mockups/option-1.html). Recommended default.

## Direction

A calm slate palette sets the plugin up as an instrument panel. The hero leads with the promise,
"Your Claude Code session, at a glance." The install command sits beside it, and below them the
stage shows a full terminal window on the sweep: a transcript line, the band, then the prompt.
The tabs switch between three moments in a session. The close-ups cover the three readings
people install a status line for: context, limits and cache.

## 1. User goal

A Claude Code user wants to know what the band shows and whether it is safe. They install it
with one command.

## 2. Entry points

- The GitHub README.
- The Claude Code plugin marketplace.
- The Derinbay Labs index at `derinbay.com/<lang>/labs/`.
- Links shared by other users.

## 3. Flow

1. Read the hero.
2. Copy the install command, or open GitHub.
3. Optionally switch stage scenes and press notes to light up band rows.
4. Read the close-ups.
5. Check the trust ledger.
6. Install from the final CTA.

## 4. Options

See [README.md](README.md). This option keeps the base layout unchanged: a 7/5 hero head, the
stage with tabs above the device, and notes in three columns under it.

## 5. Screen states

| State | Behaviour |
|---|---|
| Empty | Not applicable. The page is static, and every band uses bundled sample data. |
| Loading | Text renders in fallback fonts. Once the fonts load, every band is repainted at the new column count, so nothing shifts afterwards. |
| Error | The copy button falls back to selecting the command text if the clipboard API is refused, and announces "Select the command to copy it" through `aria-live`. |
| Partial data | A note whose band row is absent at the current width, such as GATE in compact mode, is hidden. The other notes stay. |
| Offline | Fonts fall back to the system sans and mono stacks. Nothing else needs the network. |

## 6. Components and tokens

Product token set (the `--lab-*` family tokens are unchanged):

| Token | Light | Dark |
|---|---|---|
| `--ground` | `#F5F7FA` | `#0E1116` |
| `--wall` | `#DDE3EB` | `#18202B` |
| `--floor` | `#EEF1F5` | `#12171F` |
| `--surface` | `#FFFFFF` | `#161B23` |
| `--surface-2` | `#F0F3F7` | `#1D232D` |
| `--ink` | `#10161F` | `#E6EBF1` |
| `--mut` | `#4A5565` | `#A3ADBB` |
| `--line` | `#CDD5DF` | `#2C3440` |
| `--accent` | `#2D5A88` | `#93B6DC` |
| `--accent-ink` | `#FFFFFF` | `#0B1A2A` |
| `--accent-soft` | `#DEE7F1` | `#1E2C3D` |
| `--term` | `#10151D` | `#0A0E14` |

Band colours (`--k-*`, fixed by the plugin, both themes): teal `#4aa3b8`, orange `#e8734a`,
green `#3ec28f`, yellow `#e5c07b`, red `#e05561`, purple `#b48ead`, blue `#8fb3e8`, grey
`#9aa0a6`, text `#d8dee9`, cleared `#7f8cff`, dim `#3a3f47` (decorative track only).

Components reused from the base:

- shell bar, nav, command block with copy button
- stage, scene tabs, device and notes
- spec plate, plinth close-ups, steps, ledger, FAQ, final and footer plate

New components and why the base has none:

- **terminal window** (`.term`): the product's real surface. The band only reads correctly on a
  dark terminal.
- **band tile** (`.tile`): a cropped run of band rows for a close-up.
- **legend**: a colour key that always carries a text label.

Close-ups:

1. Context row and breakdown, with a category legend.
2. Two limits rows, behind pace and ahead of pace, each with its signed gap.
3. Three cache rows: warm, cooling and cold.

## Contrast (WCAG 2.2, measured)

| Pair | Light | Dark |
|---|---|---|
| ink on ground / surface / wall | 16.92 / 18.16 / 14.06 | 15.78 / 14.42 / 13.68 |
| mut on ground / surface / wall | 7.04 / 7.56 / 5.85 | 8.33 / 7.61 / 7.23 |
| mut on accent-soft | 6.05 | 6.24 |
| accent-ink on accent (buttons) | 7.17 | 8.34 |
| accent on surface (links, focus ring) | 7.17 | 8.20 |
| lowest band colour (red) on term | 4.92 | 5.20 |

`--line` on surface is about 1.4:1. It is decorative only, and every boundary it draws is also
carried by a fill or a label.

## 7. Copy (EN / TR)

| Key | EN | TR |
|---|---|---|
| H1 | Your Claude Code session, at a glance. | Claude Code oturumunuz, tek bakışta. |
| Scenes | Mid-turn; Agents at work; Between turns | Tur ortası; Ajanlar işte; Turlar arası |
| Features heading | Six readings, one glance. | Altı gösterge, tek bakış. |
| Final CTA | Put the band above your prompt. | Bandı isteminizin üstüne koyun. |

The full strings are in the mockup. Final copy is for product-manager.

## 8. Accessibility acceptance criteria

- Every interactive control has a target of at least 44 × 44 px. This covers theme, language, nav,
  copy, tabs, notes and FAQ summaries.
- Focus order:
  1. skip link
  2. theme switcher
  3. brand
  4. nav links
  5. EN/TR
  6. GitHub
  7. Install
  8. hero command copy
  9. GitHub button
  10. scene tabs (one tab stop; arrow keys, Home and End move within the tablist)
  11. device panel
  12. notes
  13. close-ups (not focusable)
  14. FAQ summaries
  15. final copy
  16. footer links
  17. Labs plate
- Focus is visible as a 2 px `--accent` outline with a 2 px offset, at 3:1 or better against
  every surface.
- Screen-reader labels:
  - The tablist has an `aria-label`. Each tab uses `aria-selected` and `aria-controls`.
  - Each note uses `aria-pressed`.
  - The copy button announces "Copied" through a polite live region.
  - The drawn band is `aria-hidden`. A visually hidden list reads out each scene, for example
    "Context 62% full; session 41%, 6 points ahead of pace".
- Gain and loss are never carried by colour alone. Pace gaps are signed (`+6`, `−12`, `±0`), and
  the cache shows its time left or the word "cold".
- `prefers-reduced-motion` turns off the caret blink, the stage transitions and smooth scroll.
- All figures are set in JetBrains Mono, so they align.
- `lang` on `<html>` follows the toggle, so TR is read with Turkish rules.

## 9. Platform notes

- Web only. The landing is a static TR/EN page at `console-band.derinbay.com`. Hosting is #3.
- The band must be rendered as text, never as an image, so it stays sharp and repaints at the
  real column count.
- Between 860 and 520 px the hero stacks. Below 520 px the band text drops to 11 px and the band
  goes compact, as the real plugin does.

## 10. Open questions

See the shared list in [README.md](README.md). Nothing is specific to this option.

## Trade-offs

- **For:** the lowest risk, the closest to the base, and the most honest picture of daily use.
- **Against:** the most conventional of the three. The hero picture arrives only after the
  headline block.
