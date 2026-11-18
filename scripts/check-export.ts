/**
 * Guards the static export in `out/`. Runs after `next build` and fails the
 * build when the output breaks one of the site's publishing rules:
 *
 *  - wording the site no longer uses, a price, or a bracketed placeholder;
 *  - a real person's handle or a test bot in any shipped file;
 *  - any link into Telegram;
 *  - a page that is not a configured route, or a configured route with no page;
 *  - early access markup that does not match `earlyAccess.state` in the site
 *    config: no form or field while on hold, the form on every early access
 *    spot while open;
 *  - a Content-Security-Policy in `vercel.json` that does not match the early
 *    access state;
 *  - an internal link or image that points at nothing, or a file in `public/`
 *    that nothing uses.
 *
 *   node --conditions=react-server scripts/check-export.ts
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { earlyAccessDestination, site } from "../src/config/site.ts";

const root = resolve(import.meta.dirname, "..");
const out = join(root, "out");
if (!existsSync(out)) throw new Error(`check-export: ${out} does not exist. Run "next build" first.`);

const BANNED_PHRASES = [
  "one jaw",
  "live 24/7",
  "lifetime access",
  "risk-free",
  "risk free",
  "guaranteed safety",
  "100x",
  "safe coins",
  "lorem ipsum",
  "try ripjaw",
  "got rugged",
  "pricing",
];
const BANNED_PATTERNS: { pattern: RegExp; what: string }[] = [
  { pattern: /\bbeta\b/i, what: 'the word "beta"' },
  { pattern: /(?<![\w.])\d+(?:\.\d+)?\s*SOL\b/, what: "an amount in SOL" },
];
/** Never allowed in any shipped file, scripts included. */
const BANNED_ANYWHERE = ["elonmusk", "ripjawtestbot"];
const TELEGRAM_LINK = /(?:https?:)?\/\/(?:www\.)?(?:t\.me|telegram\.me|telegram\.dog)\/|tg:\/\//i;
const PLACEHOLDER = /\[[A-Z][A-Za-z0-9 ,.'’/&:-]{2,80}\]/g;
const TEXT_EXTENSIONS = [".html", ".txt", ".js", ".css", ".xml", ".json", ".webmanifest", ".svg"];
/** Pages that carry an early access spot. */
const EARLY_ACCESS_PATHS = site.routes.filter((route) => route.footer !== "legal").map((route) => route.path);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** Text a visitor or crawler can read: element text plus alt, label, title and meta content. */
function readableText(html: string): string {
  const attributes = [...html.matchAll(/\s(?:alt|aria-label|title|content|placeholder)="([^"]*)"/g)].map((m) => m[1]);
  const body = html
    .replace(/<script\b[\s\S]*?<\/script>/g, " ")
    .replace(/<style\b[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ");
  return [body, ...attributes]
    .join(" ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ");
}

function resolvesToFile(urlPath: string): boolean {
  const clean = decodeURIComponent(urlPath.split("#")[0]!.split("?")[0]!);
  if (clean === "") return true;
  const target = join(out, clean);
  if (!existsSync(target)) return false;
  return statSync(target).isFile() || existsSync(join(target, "index.html"));
}

const files = walk(out);
const problems: string[] = [];
const shippedText = new Map<string, string>();

for (const file of files) {
  const name = relative(out, file).split(sep).join("/");
  const extension = extname(file);
  if (!TEXT_EXTENSIONS.includes(extension)) continue;
  const content = readFileSync(file, "utf8");
  shippedText.set(name, content);
  const lower = content.toLowerCase();

  for (const term of BANNED_ANYWHERE) {
    if (lower.includes(term)) problems.push(`${name}: contains "${term}"`);
  }
  if (TELEGRAM_LINK.test(content)) problems.push(`${name}: contains a link into Telegram`);

  if (extension !== ".html") continue;
  const text = readableText(content);
  const textLower = text.toLowerCase();

  for (const phrase of BANNED_PHRASES) {
    if (textLower.includes(phrase)) problems.push(`${name}: contains banned wording "${phrase}"`);
  }
  for (const { pattern, what } of BANNED_PATTERNS) {
    const match = text.match(pattern);
    if (match) problems.push(`${name}: contains ${what} ("${match[0]}")`);
  }
  for (const match of text.matchAll(PLACEHOLDER)) {
    problems.push(`${name}: contains a placeholder ${match[0]}`);
  }

  for (const [, href] of content.matchAll(/\shref="([^"]+)"/g)) {
    if (!href) continue;
    if (href.startsWith("/") && !href.startsWith("//") && !resolvesToFile(href)) {
      problems.push(`${name}: broken internal link ${href}`);
    }
  }
  for (const [, source] of content.matchAll(/\s(?:src|srcSet|srcset)="([^"]+)"/g)) {
    if (!source) continue;
    for (const candidate of source.split(",")) {
      const url = candidate.trim().split(/\s+/)[0]!;
      if (url.startsWith("/") && !resolvesToFile(url)) problems.push(`${name}: missing asset ${url}`);
    }
  }
}

/* Pages: exactly the configured routes, plus the 404 page. */
const pageFile = (path: string) => (path === "/" ? "index.html" : `${path.slice(1)}index.html`);
const expectedPages = new Set([...site.routes.map((route) => pageFile(route.path)), "404.html", "404/index.html"]);
const builtPages = [...shippedText.keys()].filter((name) => name.endsWith(".html"));
for (const name of builtPages) {
  if (!expectedPages.has(name)) problems.push(`${name}: page is not a route in the site config`);
}
for (const route of site.routes) {
  if (!shippedText.has(pageFile(route.path))) problems.push(`${route.path}: configured route has no page`);
}

/* Early access: the markup must match the configured state. */
const { state } = site.earlyAccess;
for (const name of builtPages) {
  const html = shippedText.get(name)!;
  const hasField = /<form\b|<input\b|<textarea\b|<select\b/i.test(html);
  const marks = [...html.matchAll(/data-early-access="([^"]*)"/g)].map((m) => m[1]);
  const wrongMark = marks.find((mark) => mark !== state);
  if (wrongMark) problems.push(`${name}: early access spot shows "${wrongMark}" but earlyAccess.state is "${state}"`);
  const path = site.routes.find((route) => pageFile(route.path) === name)?.path;
  const expectsSpot = path !== undefined && EARLY_ACCESS_PATHS.includes(path);
  if (expectsSpot && marks.length === 0) problems.push(`${name}: has no early access spot`);
  if (!expectsSpot && marks.length > 0) problems.push(`${name}: has an early access spot it should not have`);
  if (state === "on_hold") {
    if (hasField) problems.push(`${name}: has a form or field while earlyAccess.state is "on_hold"`);
    if (expectsSpot && !readableText(html).includes(site.earlyAccess.onHoldLine)) {
      problems.push(`${name}: does not show "${site.earlyAccess.onHoldLine}"`);
    }
  } else {
    if (expectsSpot && !/<form\b[^>]*data-signup=/.test(html)) problems.push(`${name}: has no sign-up form`);
    if (!expectsSpot && hasField) problems.push(`${name}: has a form or field outside an early access spot`);
    if (readableText(html).includes(site.earlyAccess.onHoldLine)) {
      problems.push(`${name}: shows "${site.earlyAccess.onHoldLine}" while earlyAccess.state is "open"`);
    }
  }
}

/* Content-Security-Policy: the browser may only talk to the sign-up destination, and only while open. */
type HeaderRule = { source: string; headers: { key: string; value: string }[] };
const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8")) as { headers?: HeaderRule[] };
const csp = vercel.headers
  ?.find((rule) => rule.source === "/(.*)")
  ?.headers.find((header) => header.key === "Content-Security-Policy")?.value;
if (!csp) {
  problems.push('vercel.json: no Content-Security-Policy header for "/(.*)"');
} else {
  const directive = csp
    .split(";")
    .map((part) => part.trim().split(/\s+/))
    .find(([name]) => name === "connect-src");
  if (!directive) {
    problems.push("vercel.json: Content-Security-Policy has no connect-src directive");
  } else {
    const sources = directive.slice(1);
    const expected = state === "open" ? ["'self'", new URL(earlyAccessDestination()).origin] : ["'self'"];
    if (sources.length !== expected.length || expected.some((source) => !sources.includes(source))) {
      problems.push(
        `vercel.json: Content-Security-Policy connect-src is "${sources.join(" ")}" but earlyAccess.state "${state}" needs "${expected.join(" ")}"`,
      );
    }
  }
}

/* Every file in public/ must be used by the built site. */
const publicDir = join(root, "public");
for (const file of walk(publicDir)) {
  const url = `/${relative(publicDir, file).split(sep).join("/")}`;
  const used = [...shippedText].some(([name, content]) => `/${name}` !== url && content.includes(url));
  if (!used) problems.push(`public${url}: nothing in the built site uses this file`);
}

if (problems.length > 0) {
  console.error(`check-export: ${problems.length} problem(s):\n  - ${problems.join("\n  - ")}`);
  process.exit(1);
}
console.log(`check-export: ${files.length} files checked, early access "${state}", no problems.`);
