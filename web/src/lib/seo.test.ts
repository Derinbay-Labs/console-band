import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { copyFor } from "@/content";
import { LOCALES } from "./locale";
import { hreflangs, jsonLdFor, jsonLdScript, metadataFor, pageUrl, pluginVersion } from "./seo";

const HOST = "https://console-band.derinbay.com";

function manifestDir(body: string): string {
  const root = mkdtempSync(join(tmpdir(), "cb-seo-"));
  mkdirSync(join(root, ".claude-plugin"));
  writeFileSync(join(root, ".claude-plugin", "plugin.json"), body);
  return root;
}

describe("hreflangs", () => {
  it("lists en, tr and an English x-default as absolute URLs", () => {
    expect(hreflangs()).toEqual({
      en: `${HOST}/en/`,
      tr: `${HOST}/tr/`,
      "x-default": `${HOST}/en/`,
    });
  });
});

describe("metadataFor", () => {
  for (const locale of LOCALES) {
    it(`/${locale}/ has a self canonical, OG and a large Twitter card`, () => {
      const t = copyFor(locale);
      const m = metadataFor(locale);
      expect(m.title).toBe(t.title);
      expect(m.description).toBe(t.description);
      expect(m.alternates?.canonical).toBe(`${HOST}/${locale}/`);
      expect(m.alternates?.languages).toEqual(hreflangs());
      expect(m.openGraph).toMatchObject({
        title: `console-band: ${t.h1}`,
        url: `${HOST}/${locale}/`,
        siteName: "console-band",
        locale: locale === "en" ? "en_US" : "tr_TR",
        alternateLocale: locale === "en" ? "tr_TR" : "en_US",
        images: [
          {
            url: `${HOST}/og/${locale}.png`,
            width: 1200,
            height: 630,
            type: "image/png",
            alt: t.ogAlt,
          },
        ],
      });
      expect(m.twitter).toMatchObject({
        card: "summary_large_image",
        title: `console-band: ${t.h1}`,
        images: [{ url: `${HOST}/og/${locale}.png`, alt: t.ogAlt }],
      });
    });
  }
});

describe("jsonLdFor", () => {
  it("builds the WebPage and SoftwareApplication graph with the Labs publisher", () => {
    const ld = jsonLdFor("tr", "9.9.9");
    const [page, app] = ld["@graph"];
    expect(page).toMatchObject({
      "@type": "WebPage",
      "@id": `${HOST}/tr/#webpage`,
      inLanguage: "tr",
      about: { "@id": `${HOST}/#app` },
      publisher: { "@id": "https://derinbay.com/#labs" },
    });
    expect(app).toMatchObject({
      "@type": "SoftwareApplication",
      "@id": `${HOST}/#app`,
      description: copyFor("tr").description,
      url: pageUrl("tr"),
      softwareVersion: "9.9.9",
      image: `${HOST}/og/tr.png`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: "Derinbay Labs" },
    });
    expect(app).not.toHaveProperty("aggregateRating");
  });

  it("reads the version from the repo's plugin manifest by default", () => {
    expect(jsonLdFor("en")["@graph"][1]?.softwareVersion).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe("pluginVersion", () => {
  it("returns the manifest version", () => {
    expect(pluginVersion(manifestDir('{"version":"1.2.3"}'))).toBe("1.2.3");
  });
  it("fails the build when the version is missing", () => {
    expect(() => pluginVersion(manifestDir("{}"))).toThrow(/no version/);
  });
});

describe("jsonLdScript", () => {
  it("escapes < so the data cannot close its script tag", () => {
    expect(jsonLdScript({ a: "</script>" })).toBe('{"a":"\\u003c/script>"}');
  });
});

describe("sitemap", () => {
  it("lists only the locale pages, each with the full alternate set", () => {
    expect(sitemap()).toEqual(
      LOCALES.map((l) => ({ url: `${HOST}/${l}/`, alternates: { languages: hreflangs() } })),
    );
  });
});
