/**
 * Serves the static export in `out/` the way a static host does, for checking
 * the production build locally.
 *
 *   node scripts/serve.ts --port 4173
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const { values } = parseArgs({ options: { port: { type: "string" } } });
if (!values.port) throw new Error("Missing --port <number>");

const out = resolve(dirname(fileURLToPath(import.meta.url)), "..", "out");
if (!existsSync(out)) throw new Error(`${out} does not exist. Run "npm run build" first.`);

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function fileFor(urlPath: string): string | null {
  const path = join(out, normalize(decodeURIComponent(urlPath)));
  if (!path.startsWith(out)) return null;
  if (existsSync(path) && statSync(path).isFile()) return path;
  const index = join(path, "index.html");
  return existsSync(index) ? index : null;
}

createServer((request, response) => {
  const { pathname } = new URL(request.url ?? "/", "http://localhost");
  const file = fileFor(pathname);
  const target = file ?? join(out, "404.html");
  const type = TYPES[extname(target)];
  if (!type) {
    response.writeHead(415, { "Content-Type": "text/plain" }).end(`serve: no content type for ${extname(target)}`);
    return;
  }
  response.writeHead(file ? 200 : 404, { "Content-Type": type });
  createReadStream(target).pipe(response);
}).listen(Number(values.port), () => {
  console.log(`Serving ${out} at http://localhost:${values.port}/`);
});
