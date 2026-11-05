// Renders public/og/<locale>.png (1200x630) from the built page, per docs/seo/landing.md §6.
// Run once after `npm run build` and commit the PNGs; nothing renders at request time.
// Uses the page's own stylesheet, fonts, H1 and hero terminal (bundled sample data), dark theme.
import { spawn } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const WEB = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 3299;
const BASE = `http://127.0.0.1:${PORT}`;
const MAX_BYTES = 150 * 1024;

const server = spawn(process.execPath, [join(WEB, "scripts", "serve-out.mjs"), String(PORT)], {
  stdio: "ignore",
});
await new Promise((r) => setTimeout(r, 600));

const browser = await chromium.launch();
let failed = false;
try {
  mkdirSync(join(WEB, "public", "og"), { recursive: true });
  for (const locale of ["en", "tr"]) {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
      colorScheme: "dark",
      reducedMotion: "reduce",
    });
    await page.goto(`${BASE}/${locale}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      const h1 = document.querySelector("#h1")?.textContent ?? "";
      const brand = document.querySelector(".brand")?.cloneNode(true);
      const term = document.querySelector(".o2-term")?.cloneNode(true);
      if (!(brand instanceof HTMLElement) || !(term instanceof HTMLElement)) {
        throw new Error("hero markup not found");
      }
      term.querySelector(".cmd-term .btn")?.remove();
      // The install command wraps where a terminal would: before the marketplace flag.
      const code = term.querySelector(".cmd-term code");
      if (code?.textContent) {
        const [cmd, flag] = code.textContent.split(" --");
        code.innerHTML = "";
        for (const part of [cmd, `--${flag}`]) {
          const line = document.createElement("span");
          line.className = "og-line";
          line.textContent = part;
          code.append(line);
        }
      }
      document.body.innerHTML = "";
      const style = document.createElement("style");
      style.textContent = `
        html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
        body { background: linear-gradient(180deg, #08131a 0%, #08131a 34%, #0f2733 100%); }
        .og { box-sizing: border-box; width: 1200px; height: 630px; padding: 44px 60px 0;
              display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .og .brand { font-size: 30px; color: var(--ink); pointer-events: none; }
        .og .brand svg { width: 36px; height: 36px; }
        .og h1 { font-family: var(--font-display); font-size: 60px; line-height: 1.05;
                 letter-spacing: -0.035em; font-weight: 700; color: var(--ink);
                 text-align: center; margin: 4px 0 6px; white-space: nowrap; }
        .og .o2-term { width: 1080px; border-radius: 16px 16px 0 0; flex: 1;
                       box-shadow: 0 -10px 60px rgb(0 0 0 / 0.5); overflow: hidden; }
        .og .term-body { --band-fs: 9.6px; padding: 14px 22px; }
        .og .cmd-term { min-height: 0; padding: 10px 16px; margin-top: 12px; }
        .og .cmd-term code { font-size: 28px; line-height: 1.3; color: var(--term-accent);
                             white-space: normal; }
        .og .og-line + .og-line { display: block; padding-left: 1.2em; }
      `;
      const wrap = document.createElement("div");
      wrap.className = "og";
      const heading = document.createElement("h1");
      heading.textContent = h1;
      wrap.append(brand, heading, term);
      document.head.append(style);
      document.body.append(wrap);
    });
    await page.evaluate(() => document.fonts.ready);
    const out = join(WEB, "public", "og", `${locale}.png`);
    await page.screenshot({ path: out, type: "png" });
    const bytes = statSync(out).size;
    const ok = bytes <= MAX_BYTES;
    failed ||= !ok;
    console.log(
      `og/${locale}.png ${(bytes / 1024).toFixed(1)} KB ${ok ? "ok" : "OVER 150 KB"}`,
    );
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
process.exit(failed ? 1 : 0);
