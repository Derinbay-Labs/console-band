import { expect, test } from "@playwright/test";

// The SEO surfaces of the exported HTML (docs/seo/landing.md §3–§7). Built with the default
// SITE_URL, so every absolute URL points at the canonical host.
const HOST = "https://console-band.derinbay.com";
const ALTERNATES = { en: `${HOST}/en/`, tr: `${HOST}/tr/`, "x-default": `${HOST}/en/` };

test.describe("seo", () => {
  test.beforeEach(({ browserName: _b }, info) => {
    test.skip(info.project.name !== "desktop", "markup is viewport-independent");
  });

  for (const locale of ["en", "tr"] as const) {
    test(`/${locale}/ carries canonical, hreflang, OG, Twitter and JSON-LD`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      const head = page.locator("head");
      const content = (sel: string) => head.locator(sel).getAttribute("content");

      await expect(page).toHaveTitle(/^console-band: Claude Code .+ \| Derinbay Labs$/);
      expect((await page.title()).length).toBeLessThanOrEqual(60);
      expect((await content('meta[name="description"]'))!.length).toBeLessThanOrEqual(155);
      await expect(head.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(head.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${HOST}/${locale}/`,
      );
      for (const [lang, href] of Object.entries(ALTERNATES)) {
        await expect(head.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute(
          "href",
          href,
        );
      }

      expect(await content('meta[property="og:url"]')).toBe(`${HOST}/${locale}/`);
      expect(await content('meta[property="og:image"]')).toBe(`${HOST}/og/${locale}.png`);
      expect(await content('meta[property="og:image:width"]')).toBe("1200");
      expect(await content('meta[property="og:image:height"]')).toBe("630");
      expect(await content('meta[property="og:locale"]')).toBe(
        locale === "en" ? "en_US" : "tr_TR",
      );
      expect(await content('meta[name="twitter:card"]')).toBe("summary_large_image");
      expect(await content('meta[name="twitter:image"]')).toBe(`${HOST}/og/${locale}.png`);
      await expect(
        head.locator('meta[name="keywords"], meta[name="twitter:site"]'),
      ).toHaveCount(0);

      const ld = page.locator('script[type="application/ld+json"]');
      await expect(ld).toHaveCount(1);
      const graph = JSON.parse((await ld.textContent())!)["@graph"];
      expect(graph.map((n: { "@type": string }) => n["@type"])).toEqual([
        "WebPage",
        "SoftwareApplication",
      ]);
      expect(graph[1].inLanguage).toBe(locale);
      expect(graph[1].publisher.name).toBe("Derinbay Labs");
    });

    test(`/og/${locale}.png is a 1200x630 PNG under 150 KB`, async ({ request }) => {
      const res = await request.get(`/og/${locale}.png`);
      expect(res.status()).toBe(200);
      const png = await res.body();
      expect(png.length).toBeLessThanOrEqual(150 * 1024);
      expect(png.subarray(1, 4).toString()).toBe("PNG");
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
    });
  }

  test("root is noindex, follow with no canonical or hreflang", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('<meta name="robots" content="noindex, follow"/>');
    expect(html).not.toMatch(/rel="(canonical|alternate)"/);
  });

  test("robots.txt and sitemap.xml match the spec; unknown paths are 404", async ({
    request,
  }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain(`Sitemap: ${HOST}/sitemap.xml`);

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(sitemap.headers()["content-type"]).toContain("application/xml");
    const xml = await sitemap.text();
    expect(xml.match(/<loc>[^<]+<\/loc>/g)).toEqual([
      `<loc>${HOST}/en/</loc>`,
      `<loc>${HOST}/tr/</loc>`,
    ]);
    expect(xml.match(/hreflang="x-default" href="[^"]+"/g)).toEqual([
      `hreflang="x-default" href="${HOST}/en/"`,
      `hreflang="x-default" href="${HOST}/en/"`,
    ]);
    expect(xml).not.toMatch(/lastmod|changefreq|priority/);

    expect((await request.get("/no-such-page/")).status()).toBe(404);
  });
});
