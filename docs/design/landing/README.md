# console-band landing: three designs on Studio Sweep

**Chosen: Option 2, Prompt Line** (CEO, 2026-11-06, #2). The landing (#4) is built from
[option-2.md](option-2.md) and [mockups/option-2.html](mockups/option-2.html).

Design sub-issue of #1 (#2). Each option takes the CEO-chosen Labs landing base, Studio Sweep
(company `docs/design/labs-landing-base/option-2.md`), and customises it for console-band. The
CEO picked Option 2.

## What every option shares (fixed by the base)

- Type: Funnel Display for headings, Funnel Sans for text, JetBrains Mono for code and the band.
- The `--lab-*` family tokens, the sweep (wall to floor to ground) and the section order: hero,
  stage, spec plate, close-ups on plinths, install steps, trust ledger, FAQ, final CTA with a
  peek, and the footer.
- The Labs nameplate appears only in the footer, as the large variant (CEO decision, company
  #539). Nothing in the hero carries it.
- Palettes stay in the blue family. The terminal stays dark in both themes because console-band's
  own band colours are fixed: they come from the plugin's `plugin/hooks/register.tsx` and are drawn
  as-is.
- The band is rendered from a port of the plugin's layout logic, with synthetic sample data, at
  the column count that fits its container. So on a phone it goes compact, just as the real band
  does below 100 columns.
- Each mockup has an EN/TR toggle and an Auto/Light/Dark toggle. URL parameters
  `?lang=tr&theme=dark` exist for review.
- Every control is at least 44 px. The drawn band is `aria-hidden`, and a screen-reader list
  summarises each scene.

The options differ only in the product token set, the stage scene, the hero treatment and the
close-ups.

## Comparison

| | [Option 1: Control Room](option-1.md) | [Option 2: Prompt Line](option-2.md) | [Option 3: Width Sweep](option-3.md) |
|---|---|---|---|
| Palette | Slate, accent `#2D5A88` / `#93B6DC` | Ocean, accent `#0B5F86` / `#5FC1EC` | Azure, accent `#2450C8` / `#9DB7FF` |
| Hero | Headline left, install command right, the full terminal on the stage below | Centred headline; the band and the install command share one terminal, with the command on the prompt line | Headline and command left; a narrow terminal with the compact band right |
| Stage tabs | Session moments: mid-turn, agents at work, between turns | Band anatomy: session, usage, work, place | Terminal width: 140, 104, 72 columns |
| Close-ups | Context breakdown, limits against pace, cache countdown | Subagent cards, permission gate, activity log | Reading the pace, cache sequence, location and git |
| Message | "Your Claude Code session, at a glance." | "Everything above the prompt." | "Stay ahead of the limit." |
| Strength | Closest to the base; shows the whole band in a real session | The most product-specific hero; the install is part of the picture | Shows the plugin's adaptive layout, its least obvious feature |
| Risk | The most conventional of the three | Band rows go compact and less legible on phones; the dark CTA inside the terminal departs from the base's light command block | Leads with limits; the wide terminal scrolls sideways on phones |

## Designer's recommendation before the pick: Option 1, Control Room

It changes the base least and so carries the least risk. It shows the real band in a believable
session, with the transcript above it and the prompt below. Its three close-ups cover the
questions people install a status line for: context, limits and cache. Options 2 and 3 are
stronger statements, but each gives up some legibility on phones.

## Files

- [option-1.md](option-1.md), [mockups/option-1.html](mockups/option-1.html)
- [option-2.md](option-2.md), [mockups/option-2.html](mockups/option-2.html)
- [option-3.md](option-3.md), [mockups/option-3.html](mockups/option-3.html)

The mockups are self-contained static HTML. The only network request is Google Fonts, and there
are no other external assets. They illustrate the specification and are never shipped.

## Shared open questions

1. **Hero nameplate conflict.** Company `skills/landing-page/references/labs-identity.md`
   says the Labs nameplate goes in the hero and the footer. The CEO decision on #539 says
   footer only, so these mockups follow the decision. The handbook text should be updated.
   Who decides: CEO, through acting-ceo for the company repo edit.
2. **Copy.** Headlines and body copy are design drafts taken from the console-band README. The
   final EN and TR copy is for product-manager.
3. **Privacy page.** The footer links "Privacy" to the in-page trust section (`#privacy`). Whether
   a separate privacy page is needed is for product-manager. Hosting is the architect's (#3).
4. **Sample data.** All band figures are synthetic and labelled "Sample session shown." If real
   screenshots are preferred, product-manager supplies them.
5. **Tabular numerals.** Funnel Sans has no tabular figures. Every figure on the page that has to
   line up is set in JetBrains Mono, which is monospaced. Who decides: none needed unless the CEO
   wants Funnel figures in tables.
6. **impeccable setup.** The `impeccable` skill asks for a PRODUCT.md through `impeccable init`.
   This run was a subagent working from a pinned brief, so init was skipped and the brief stood
   in for it. The detector found one warning per mockup: the review-only option switcher bar is
   flagged for cramped padding. That bar is not part of the landing. Who decides: ux-designer,
   when the chosen option goes to implementation.
