/**
 * Guards the static export in `out/`. Runs after `next build` and fails the
 * build when the output breaks one of the site's publishing rules:
 *
 *  - wording the brief bans, the retired slogan, or a bracketed placeholder;
 *  - a real person's handle or a test bot in any shipped file;
 *  - unpublished speed fees or referral rewards, while they are still
 *    `pendingVerification` in the site config;
 *  - a Telegram link that is not the official bot;
 *  - an internal link or image that points at nothing.
 *
 * Routes that are in the config but have no page yet are listed as a notice.
 *
 *   node --conditions=react-server scripts/check-export.ts
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/config/site.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
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
];
/** Never allowed in any shipped file, scripts included. */
const BANNED_ANYWHERE = ["elonmusk", "ripjawtestbot"];
const PLACEHOLDER = /\[[A-Z][A-Za-z0-9 ,.'’/&:-]{2,80}\]/g;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** Text a visitor or crawler can read: element text plus alt, label, title and meta content. */
function readableText(html: string): string {
  const attributes = [...html.matchAll(/\s(?:alt|aria-label|title|content)="([^"]*)"/g)].map((m) => m[1]);
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

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Matches a number or amount only when it is not part of a longer number. */
const standalone = (value: string) => new RegExp(`(?<![\\d.])${escape(value)}(?![\\d])`, "i");

const unpublished: { pattern: RegExp; what: string }[] = [];
if (site.speedFees.pendingVerification) {
  for (const tier of site.speedFees.tiers) {
    unpublished.push({
      pattern: new RegExp(`(?<![\\d.])${escape(tier.feeSol)}\\s*SOL`, "i"),
      what: `unpublished ${tier.mode} speed fee (${tier.feeSol} SOL)`,
    });
  }
}
if (site.referrals.rewards.pendingVerification) {
  for (const item of site.referrals.rewards.items) {
    const amount = item.value.match(/^[\d.]+\s*(?:%|SOL)/)?.[0];
    if (!amount) throw new Error(`check-export: referral reward "${item.label}" has no leading amount to guard`);
    unpublished.push({ pattern: standalone(amount), what: `unpublished referral reward "${item.label}" (${amount})` });
  }
}

const files = walk(out);
const problems: string[] = [];
const unbuiltRoutes = new Set<string>();
const configuredRoutes = new Set(site.routes.map((route) => route.path));

function resolvesToFile(urlPath: string): boolean {
  const clean = decodeURIComponent(urlPath.split("#")[0]!.split("?")[0]!);
  if (clean === "") return true;
  const target = join(out, clean);
  if (!existsSync(target)) return false;
  return statSync(target).isFile() || existsSync(join(target, "index.html"));
}

for (const file of files) {
  const name = relative(out, file);
  const extension = extname(file);
  if (![".html", ".txt", ".js", ".css", ".xml", ".json", ".webmanifest", ".svg"].includes(extension)) continue;
  const content = readFileSync(file, "utf8");
  const lower = content.toLowerCase();

  for (const term of BANNED_ANYWHERE) {
    if (lower.includes(term)) problems.push(`${name}: contains "${term}"`);
  }

  if (extension !== ".html") continue;
  const text = readableText(content);
  const textLower = text.toLowerCase();

  for (const phrase of BANNED_PHRASES) {
    if (textLower.includes(phrase)) problems.push(`${name}: contains banned wording "${phrase}"`);
  }
  for (const match of text.matchAll(PLACEHOLDER)) {
    problems.push(`${name}: contains a placeholder ${match[0]}`);
  }
  for (const { pattern, what } of unpublished) {
    if (pattern.test(text)) problems.push(`${name}: shows ${what}`);
  }

  for (const [, href] of content.matchAll(/\shref="([^"]+)"/g)) {
    if (!href) continue;
    if (/^https?:\/\/(?:www\.)?(?:t\.me|telegram\.me)\//.test(href)) {
      if (href !== site.links.telegramBot && !href.startsWith(`${site.links.telegramBot}?`)) {
        problems.push(`${name}: Telegram link is not the official bot: ${href}`);
      }
    } else if (href.startsWith("/") && !href.startsWith("//") && !resolvesToFile(href)) {
      const path = href.split("#")[0]!;
      if (configuredRoutes.has(path)) unbuiltRoutes.add(path);
      else problems.push(`${name}: broken internal link ${href}`);
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

if (unbuiltRoutes.size > 0) {
  console.log(
    `check-export: notice: ${unbuiltRoutes.size} configured route(s) are linked but have no page yet: ${[...unbuiltRoutes].sort().join(", ")}`,
  );
}
if (problems.length > 0) {
  console.error(`check-export: ${problems.length} problem(s) in out/:\n  - ${problems.join("\n  - ")}`);
  process.exit(1);
}
console.log(`check-export: ${files.length} files checked, no problems.`);
