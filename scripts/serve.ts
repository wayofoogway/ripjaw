/**
 * Serves the static export in `out/` the way the static host does, including
 * the response headers from `vercel.json`, for checking the production build
 * locally.
 *
 *   node scripts/serve.ts --port 4173
 */
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { extname, join, normalize, resolve } from "node:path";
import { parseArgs } from "node:util";

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

type HeaderRule = { source: string; headers: { key: string; value: string }[] };

export type StaticServer = { url: string; close: () => Promise<void> };

/** Serves `<projectRoot>/out`. Port 0 picks a free port. */
export function startServer(projectRoot: string, port: number): Promise<StaticServer> {
  const out = join(projectRoot, "out");
  if (!existsSync(out)) throw new Error(`${out} does not exist. Run "npm run build" first.`);

  const config = JSON.parse(readFileSync(join(projectRoot, "vercel.json"), "utf8")) as { headers?: HeaderRule[] };
  if (!config.headers) throw new Error("vercel.json has no headers");
  const rules = config.headers.map((rule) => ({ pattern: new RegExp(`^${rule.source}$`), headers: rule.headers }));

  const fileFor = (urlPath: string): string | null => {
    const path = join(out, normalize(decodeURIComponent(urlPath)));
    if (!path.startsWith(out)) return null;
    if (existsSync(path) && statSync(path).isFile()) return path;
    const index = join(path, "index.html");
    return existsSync(index) ? index : null;
  };

  const server = createServer((request, response) => {
    const { pathname } = new URL(request.url ?? "/", "http://localhost");
    const file = fileFor(pathname);
    const target = file ?? join(out, "404.html");
    const type = TYPES[extname(target)];
    if (!type) {
      response.writeHead(415, { "Content-Type": "text/plain" }).end(`serve: no content type for ${extname(target)}`);
      return;
    }
    for (const rule of rules) {
      if (!rule.pattern.test(pathname)) continue;
      for (const header of rule.headers) response.setHeader(header.key, header.value);
    }
    response.writeHead(file ? 200 : 404, { "Content-Type": type });
    createReadStream(target).pipe(response);
  });

  return new Promise((done, fail) => {
    server.once("error", fail);
    server.listen(port, "127.0.0.1", () => {
      const address = server.address() as AddressInfo;
      done({
        url: `http://127.0.0.1:${address.port}`,
        close: () =>
          new Promise<void>((closed, failed) => {
            server.close((error) => (error ? failed(error) : closed()));
            server.closeAllConnections();
          }),
      });
    });
  });
}

if (import.meta.main) {
  const { values } = parseArgs({ options: { port: { type: "string" } } });
  if (!values.port) throw new Error("Missing --port <number>");
  const server = await startServer(resolve(import.meta.dirname, ".."), Number(values.port));
  console.log(`Serving out/ at ${server.url}/`);
}
