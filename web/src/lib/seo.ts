import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { REPO_URL, copyFor } from "@/content";
import { LOCALES, SITE_URL, otherLocale, pathFor, type Locale } from "./locale";

/** The Derinbay Labs organization node, shared with derinbay.com by `@id`. */
const LABS = {
  "@type": "Organization",
  "@id": "https://derinbay.com/#labs",
  name: "Derinbay Labs",
  url: "https://derinbay.com/en/labs/",
} as const;

const OG_LOCALE: Record<Locale, string> = { en: "en_US", tr: "tr_TR" };

/** Absolute URL of a locale page, e.g. `https://console-band.derinbay.com/en/`. */
export function pageUrl(locale: Locale): string {
  return `${SITE_URL}${pathFor(locale)}`;
}

/** Absolute URL of the locale's 1200x630 OG image (`public/og/<locale>.png`). */
export function ogImageUrl(locale: Locale): string {
  return `${SITE_URL}/og/${locale}.png`;
}

/** `en`, `tr` and `x-default` (English) alternates for a locale page or the sitemap. */
export function hreflangs(): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((l) => [l, pageUrl(l)]),
  );
  languages["x-default"] = pageUrl("en");
  return languages;
}

/** The plugin's released version, read from `plugin/.claude-plugin/plugin.json` at build time. */
export function pluginVersion(root: string = join(process.cwd(), "..")): string {
  const manifest = JSON.parse(
    readFileSync(join(root, "plugin", ".claude-plugin", "plugin.json"), "utf8"),
  ) as { version?: unknown };
  if (typeof manifest.version !== "string" || manifest.version === "") {
    throw new Error("plugin/.claude-plugin/plugin.json has no version");
  }
  return manifest.version;
}

/** Title, description, canonical, hreflang, Open Graph and Twitter tags (docs/seo/landing.md §3–§4). */
export function metadataFor(locale: Locale): Metadata {
  const t = copyFor(locale);
  const ogTitle = `console-band: ${t.h1}`;
  const image = {
    url: ogImageUrl(locale),
    width: 1200,
    height: 630,
    type: "image/png",
    alt: t.ogAlt,
  };
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: pageUrl(locale), languages: hreflangs() },
    openGraph: {
      title: ogTitle,
      description: t.description,
      url: pageUrl(locale),
      siteName: "console-band",
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[otherLocale(locale)],
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: t.description,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}

/** The `WebPage` + `SoftwareApplication` graph for a locale page (docs/seo/landing.md §5). */
export function jsonLdFor(locale: Locale, version: string = pluginVersion()) {
  const t = copyFor(locale);
  const url = pageUrl(locale);
  const image = ogImageUrl(locale);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: t.title,
        inLanguage: locale,
        about: { "@id": `${SITE_URL}/#app` },
        primaryImageOfPage: image,
        publisher: { "@id": LABS["@id"] },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#app`,
        name: "console-band",
        description: t.description,
        url,
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: "Claude Code plugin",
        operatingSystem: "Claude Code",
        softwareVersion: version,
        license: `${REPO_URL}/blob/main/LICENSE`,
        isAccessibleForFree: true,
        installUrl: `${REPO_URL}#install`,
        sameAs: [REPO_URL],
        image,
        inLanguage: locale,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: LABS,
      },
    ],
  };
}

/** Serialises JSON-LD for an inline `<script>`; `<` is escaped so the data cannot close the tag. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "console-band",
};
