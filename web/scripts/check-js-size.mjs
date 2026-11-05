// Fails when the module JavaScript a first load of /en/ or /tr/ downloads exceeds the budget
// in docs/seo/landing.md (gzip, noModule polyfill excluded). Run after `npm run build`.
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const BUDGET_KB = 150;
const out = new URL("../out", import.meta.url).pathname;
let failed = false;

for (const locale of ["en", "tr"]) {
  const html = readFileSync(join(out, locale, "index.html"), "utf8");
  const srcs = new Set();
  for (const [tag] of html.matchAll(/<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*>/g)) {
    if (/\bnoModule\b/i.test(tag)) continue;
    srcs.add(/src="([^"]+)"/.exec(tag)[1]);
  }
  let bytes = 0;
  for (const src of srcs) bytes += gzipSync(readFileSync(join(out, src)), { level: 9 }).length;
  const kb = bytes / 1024;
  const ok = kb <= BUDGET_KB;
  failed ||= !ok;
  console.log(
    `/${locale}/ module JS ${kb.toFixed(1)} KB gzip (budget ${BUDGET_KB} KB) ${ok ? "ok" : "OVER"}`,
  );
}
process.exit(failed ? 1 : 0);
