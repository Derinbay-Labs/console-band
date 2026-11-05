// Minimal static file server for the exported site in out/ (`next start` does not serve an
// export). Mirrors Firebase Hosting: /dir/ -> /dir/index.html, unknown paths -> 404.html + 404.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "out");
const PORT = Number(
  process.env.PORT ?? process.argv.slice(2).find((a) => /^\d+$/.test(a)) ?? 3200,
);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^[\\/]+/, "");
  const target = join(ROOT, clean);
  if (!target.startsWith(ROOT)) return undefined;
  for (const c of [target, join(target, "index.html"), `${target}.html`]) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return undefined;
}

createServer((req, res) => {
  const file = resolveFile(req.url ?? "/");
  const send = file ?? join(ROOT, "404.html");
  res.writeHead(file ? 200 : 404, {
    "content-type": TYPES[extname(send)] ?? "application/octet-stream",
  });
  if (existsSync(send)) createReadStream(send).pipe(res);
  else res.end("not found");
}).listen(PORT, "127.0.0.1", () => console.log(`serving out/ on http://127.0.0.1:${PORT}`));
