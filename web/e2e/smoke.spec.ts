import { expect, test } from "@playwright/test";

const INSTALL = "/plugin install console-band --marketplace Derinbay-Labs/console-band";

test.describe("landing smoke", () => {
  for (const [locale, h1] of [
    ["en", "Everything above the prompt."],
    ["tr", /.+/],
  ] as const) {
    test(`/${locale}/ renders the page`, async ({ page }) => {
      await page.goto(`/${locale}/`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
      await expect(page.locator(".band").first()).toContainText("console-band");
    });
  }

  test("copy button copies the install command", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/en/");
    const button = page.locator(".cmd-term").getByRole("button");
    await button.click();
    await expect(button).toContainText("Copied");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(INSTALL);
  });

  test("language switch goes to the other locale", async ({ page }) => {
    await page.goto("/en/");
    await page.locator(".lang").getByRole("link", { name: "TR" }).click();
    await expect(page).toHaveURL(/\/tr\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.locator(".lang a[aria-current='true']")).toHaveText("TR");
  });

  test("follows the system colour scheme", async ({ page }) => {
    const ground = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/en/");
    const light = await ground();
    await page.emulateMedia({ colorScheme: "dark" });
    const dark = await ground();
    expect(light).not.toBe(dark);
  });

  test("scene tabs move with the keyboard and notes light rows", async ({ page }) => {
    await page.goto("/en/");
    const first = page.getByRole("tab").first();
    await first.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true");
    await page.locator(".note-btn").first().click();
    await expect(page.locator(".device .band .is-lit").first()).toBeVisible();
  });

  for (const locale of ["en", "tr"] as const) {
    test(`/${locale}/ footer links to the Labs page`, async ({ page }) => {
      await page.goto(`/${locale}/`);
      const labs = page.locator("footer a.labs");
      await expect(labs).toHaveAttribute("href", `https://derinbay.com/${locale}/labs/`);
      await expect(labs).toHaveAttribute("hreflang", locale);
      await expect(page.locator("header a.labs, main a.labs")).toHaveCount(0);
    });
  }

  test("root offers both languages in its static HTML", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).toMatch(/href="\/en\/"/);
    expect(html).toMatch(/href="\/tr\/"/);
  });

  test("makes no third-party request and sets no cookie", async ({ page, context }) => {
    const external: string[] = [];
    page.on("request", (req) => {
      const url = new URL(req.url());
      if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1")
        external.push(req.url());
    });
    await page.goto("/en/");
    await page.waitForLoadState("networkidle");
    expect(external).toEqual([]);
    expect(await context.cookies()).toEqual([]);
  });

  test("mobile layout shift stays within budget", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile-390", "layout shift budget is asserted at 390x844");
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as unknown as {
          value: number;
          hadRecentInput: boolean;
        }[])
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/en/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(cls).toBeLessThanOrEqual(0.1);
  });
});
