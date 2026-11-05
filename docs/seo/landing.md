# console-band landing: SEO spec

Spec for issue #5, written before the landing build (#4) per the company `landing-page` skill
(`references/seo.md`). The `seo-developer` implements the SEO surfaces after the #4 PR merges
and runs the pre-launch audit below. A failed audit blocks launch.

Inputs: [README.md](../../README.md) (product truth),
[Option 2, Prompt Line](../design/landing/option-2.md) (the CEO pick, #2) and
[ADR 0001](../adr/0001-host-the-landing-as-a-static-export-on-firebase-hosting-spark.md)
(static export on Firebase Hosting).

## 1. Site and pages

| Path | Role | Indexed | Status |
|---|---|---|---|
| `https://console-band.derinbay.com/en/` | EN landing, primary and `x-default` | yes | 200 |
| `https://console-band.derinbay.com/tr/` | TR landing | yes | 200 |
| `https://console-band.derinbay.com/` | Locale chooser (section 4) | no | 200 |
| `/robots.txt`, `/sitemap.xml` | Crawl files | n/a | 200 |
| Any other path | `404.html` | no | 404 |

No other indexable pages. The "Privacy" footer link is the in-page `#privacy` section, not a page.

## 2. Target queries and intent

One primary intent for both pages: a Claude Code user looking for a richer status line,
deciding whether to install it. Every claim on the page and in the metadata must be backed by
the README; nothing below names a feature the README does not list.

| Locale | Primary query | Secondary queries |
|---|---|---|
| EN | claude code status line | claude code statusline plugin; claude code plugin; claude code context window usage; claude code rate limit usage; claude code weekly limit; claude code prompt cache timer; console-band |
| TR | claude code durum satırı | claude code eklentisi; claude code bağlam penceresi; claude code kullanım limiti; claude code haftalık limit; console-band |

Turkish developers often search in English, so the TR page also carries the English product
terms "Claude Code", "plugin" and "status line" where the copy already uses them; no keyword
stuffing beyond the approved copy.

## 3. Titles, descriptions and social tags

Lengths are counted in characters; limits are title ≤ 60 and description ≤ 155.

| Field | EN (`/en/`) | TR (`/tr/`) |
|---|---|---|
| `<title>` (53 / 54) | console-band: Claude Code status line \| Derinbay Labs | console-band: Claude Code durum satırı \| Derinbay Labs |
| `meta description` | A Claude Code plugin that adds a multi-line band above the prompt: context breakdown, session and weekly limits with pace, cache countdown, git. | Claude Code eklentisi: istemin üstünde çok satırlı bant. Bağlam dökümü, oturum ve haftalık limitler, önbellek geri sayımı, git ve alt ajanlar. |
| `og:title`, `twitter:title` | console-band: Everything above the prompt. | console-band: İstemin üstünde, her şey. |
| `og:description`, `twitter:description` | Same as meta description | Same as meta description |
| `og:url` | `https://console-band.derinbay.com/en/` | `https://console-band.derinbay.com/tr/` |
| `og:locale` / `og:locale:alternate` | `en_US` / `tr_TR` | `tr_TR` / `en_US` |
| `og:image` | `https://console-band.derinbay.com/og/en.png` | `https://console-band.derinbay.com/og/tr.png` |
| `og:image:alt`, `twitter:image:alt` | The console-band status band above a Claude Code prompt, with the install command on the prompt line. | Claude Code isteminin üstünde console-band durum bandı ve istem satırında kurulum komutu. |

Shared on both pages: `og:type` `website`, `og:site_name` `console-band`, `og:image:width`
`1200`, `og:image:height` `630`, `og:image:type` `image/png`, `twitter:card`
`summary_large_image`. No `twitter:site` (there is no account). No `meta keywords`.

## 4. Canonical, hreflang and the root

- Each locale page has a self-referencing absolute canonical with the trailing slash
  (`trailingSlash: true`): `/en/` → `https://console-band.derinbay.com/en/`, `/tr/` →
  `https://console-band.derinbay.com/tr/`.
- Both locale pages carry the same reciprocal set:

  ```html
  <link rel="alternate" hreflang="en" href="https://console-band.derinbay.com/en/">
  <link rel="alternate" hreflang="tr" href="https://console-band.derinbay.com/tr/">
  <link rel="alternate" hreflang="x-default" href="https://console-band.derinbay.com/en/">
  ```

- `<html lang>` is `en` on `/en/` and `tr` on `/tr/`. The EN/TR switch links to the other
  locale's canonical URL with `hreflang` and `lang` attributes.
- `/` chooses a locale without cookies (ADR 0001): a minimal static page with
  `<meta name="robots" content="noindex, follow">`, no canonical, plain links to `/en/` and
  `/tr/`, and a same-origin script file (CSP `default-src 'self'` blocks inline script) that
  calls `location.replace('/tr/')` when the first entry of `navigator.languages` starts with
  `tr`, otherwise `location.replace('/en/')`. `/` is not in the sitemap.
- Host duplicates: the Firebase default hosts (`console-band-derinbay.web.app`,
  `console-band-derinbay.firebaseapp.com`) and the `preview` channel serve the same build as
  live, because live is cloned from preview. They cannot carry a different `robots.txt` or
  header, so the absolute canonical to `console-band.derinbay.com` is the de-duplication
  signal, preview channels expire in 7 days and their URLs are never published.

## 5. Structured data (JSON-LD)

One `<script type="application/ld+json">` per locale page, with an `@graph` of a `WebPage` and a
`SoftwareApplication`. EN shown; the TR page swaps `@id`/`url` to `/tr/`, `inLanguage` to `tr`
and `description` to the TR meta description.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://console-band.derinbay.com/en/#webpage",
      "url": "https://console-band.derinbay.com/en/",
      "name": "console-band: Claude Code status line | Derinbay Labs",
      "inLanguage": "en",
      "about": { "@id": "https://console-band.derinbay.com/#app" },
      "primaryImageOfPage": "https://console-band.derinbay.com/og/en.png",
      "publisher": { "@id": "https://derinbay.com/#labs" }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://console-band.derinbay.com/#app",
      "name": "console-band",
      "description": "<EN meta description>",
      "url": "https://console-band.derinbay.com/en/",
      "applicationCategory": "DeveloperApplication",
      "applicationSubCategory": "Claude Code plugin",
      "operatingSystem": "Claude Code",
      "softwareVersion": "<version from .claude-plugin/plugin.json>",
      "license": "https://github.com/Derinbay-Labs/console-band/blob/main/LICENSE",
      "isAccessibleForFree": true,
      "installUrl": "https://github.com/Derinbay-Labs/console-band#install",
      "sameAs": ["https://github.com/Derinbay-Labs/console-band"],
      "image": "https://console-band.derinbay.com/og/en.png",
      "inLanguage": "en",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "publisher": {
        "@type": "Organization",
        "@id": "https://derinbay.com/#labs",
        "name": "Derinbay Labs",
        "url": "https://derinbay.com/en/labs/"
      }
    }
  ]
}
```

- `softwareVersion` is read from `.claude-plugin/plugin.json` at build time, never typed by
  hand, so the page cannot drift from the release.
- No `aggregateRating` or `review`: there are none, and inventing them breaks Google's
  structured-data policy. Google's Rich Results Test therefore reports the `SoftwareApplication`
  as not eligible for a rich result; that is expected and is not an audit failure. The audit
  requires zero errors and zero warnings in the Schema Markup Validator and zero parse errors
  in the Rich Results Test (section 8).
- No store links: the product is installed from the GitHub marketplace, not a store.

## 6. OG image

- Two files, `web/public/og/en.png` and `web/public/og/tr.png`, 1200 × 630 PNG, each ≤ 150 KB
  (assets ship inside every plugin install, ADR 0001).
- Content from the chosen design, dark theme: the ocean sweep (`--ground` `#08131A`, `--wall`
  `#0F2733`), the locale's H1 centred ("Everything above the prompt." / "İstemin üstünde, her
  şey."), the terminal with the full band below it, and the install command on the prompt
  line in `--term-accent` `#5FC1EC`. The wordmark "console-band" is in the image; the Labs
  nameplate is not (footer only, CEO decision on company#539).
- Text stays inside a 1080 × 510 safe area centred in the frame, no text smaller than 28 px,
  so crops to 1.91:1 and 2:1 keep the headline.
- Rendered once from the built page with the bundled sample data and committed as static
  files; no runtime image generation.

## 7. Sitemap and robots

`web/public/robots.txt`:

```text
User-agent: *
Allow: /

Sitemap: https://console-band.derinbay.com/sitemap.xml
```

`web/public/sitemap.xml` lists only the two locale pages, each with the full alternate set:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://console-band.derinbay.com/en/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://console-band.derinbay.com/en/"/>
    <xhtml:link rel="alternate" hreflang="tr" href="https://console-band.derinbay.com/tr/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://console-band.derinbay.com/en/"/>
  </url>
  <url>
    <loc>https://console-band.derinbay.com/tr/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://console-band.derinbay.com/en/"/>
    <xhtml:link rel="alternate" hreflang="tr" href="https://console-band.derinbay.com/tr/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://console-band.derinbay.com/en/"/>
  </url>
</urlset>
```

No `lastmod`, `changefreq` or `priority`; Google ignores the last two and a build-time
`lastmod` would claim changes that did not happen. `sitemap.xml` is served as
`application/xml`.

## 8. Performance budget

Mobile, Lighthouse default throttling, on each locale page:

| Metric | Budget |
|---|---|
| LCP | ≤ 2.5 s |
| CLS | ≤ 0.1 |
| TBT | ≤ 200 ms |
| JavaScript, first load, compressed | ≤ 120 KB |
| Fonts, total, WOFF2, self-hosted | ≤ 150 KB, Latin plus Turkish glyphs only |
| Total transfer, first load | ≤ 500 KB |
| Third-party requests | 0 |

Build requirements that keep the budget:

- The H1 is the LCP element and renders as text without waiting for JavaScript or fonts.
- The hero terminal reserves its final size before fonts load (fixed rows and columns, a
  fallback monospace with `size-adjust` metrics), so the font repaint the design specifies
  causes no layout shift.
- `font-display: swap`; preload at most the one font file used by the H1.
- Images below the fold are lazy-loaded with explicit `width` and `height`.

## 9. Pre-launch audit

Run against the `preview` channel, then again on live after promotion. Scores go into the
launch PR. Any failure blocks launch.

- [ ] Lighthouse mobile on `/en/` and `/tr/`: SEO 100, accessibility ≥ 95, performance ≥ 90.
- [ ] Core Web Vitals lab data within section 8 on both pages.
- [ ] Schema Markup Validator: 0 errors, 0 warnings on both pages; Rich Results Test: JSON-LD
      parses, no errors (non-eligibility for lack of ratings is expected, section 5).
- [ ] `/en/`, `/tr/`, `/`, `/robots.txt`, `/sitemap.xml` return 200; an unknown path returns
      404.
- [ ] Canonical and `hreflang` on both pages match section 4 and are reciprocal; sitemap
      alternates match the page tags.
- [ ] `/` carries `noindex, follow` and sends a `tr` browser to `/tr/` and others to `/en/`;
      no `noindex` on `/en/` or `/tr/` on live.
- [ ] Titles and descriptions match section 3 and fit the limits; one H1 per page.
- [ ] OG and Twitter tags render with the right locale image in a card preview.
- [ ] Network log on both pages shows no third-party request and no `Set-Cookie`.
- [ ] Every claim in the metadata and JSON-LD is in the README.
