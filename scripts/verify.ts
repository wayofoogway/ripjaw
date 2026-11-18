/**
 * The browser suite. Loads the production build in real Chrome and checks
 * every page at 390, 768, 1024 and 1440px, with and without reduced motion.
 *
 *   npm run verify -- --chrome <path to Chrome>
 *
 * The suite starts its own static server for `out/`, tests the early access
 * state set in the site config, then builds the other state in a temporary
 * copy of the project and tests that too. Both the on-hold line and the open
 * sign-up form stay covered, whichever one ships. The sign-up destination is
 * answered inside the browser; nothing is sent to a real address.
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import { parseArgs } from "node:util";
import { chromium, type Browser, type BrowserContext, type Page, type Route } from "playwright-core";
import {
  earlyAccessDestination,
  featureStatusMeta,
  getFeature,
  site,
  visibleFeatures,
  type EarlyAccessState,
} from "../src/config/site.ts";
import { signupCopy } from "../src/content/early-access.ts";
import { startServer } from "./serve.ts";

const root = resolve(import.meta.dirname, "..");
const { values: args } = parseArgs({
  options: {
    chrome: { type: "string" },
    /** Test this project's build only. Used for the temporary copy that holds the other state. */
    "this-build-only": { type: "boolean", default: false },
  },
});
if (!args.chrome) throw new Error("Missing --chrome <path to a Chrome or Chromium binary>");
const chromePath = args.chrome;

const state: EarlyAccessState = site.earlyAccess.state;
const destination = state === "open" ? earlyAccessDestination() : null;

const WIDTHS = [390, 768, 1024, 1440];
const HEIGHTS: Record<number, number> = { 390: 844, 768: 1024, 1024: 768, 1440: 900 };
/** How many early access spots each page carries. */
const EARLY_ACCESS_SPOTS: Record<string, number> = {
  "/": 2,
  "/features/": 1,
  "/safety/": 1,
  "/faq/": 1,
  "/docs/": 1,
  "/terms/": 0,
  "/privacy/": 0,
  "/risk/": 0,
};
const REMOVED_PATHS = ["/pricing/", "/meme-radar/"];
const MISSING_PATH = "/no-such-page/";
const NOT_FOUND_TITLE = "Page not found";
const RETIRED_WORDING = /\bbeta\b|pricing|got rugged|try ripjaw|(?<![\w.])\d+(?:\.\d+)?\s*SOL\b/i;
const TEST_DESTINATION = "https://early-access.invalid/signup";

/* ───────────────────────────── Results ───────────────────────────── */

const failures: string[] = [];
let passed = 0;

function check(name: string, ok: boolean, detail = ""): void {
  if (ok) passed += 1;
  else failures.push(detail ? `${name}: ${detail}` : name);
}

function equal<T>(name: string, actual: T, expected: T): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  check(name, a === e, `got ${a}, expected ${e}`);
}

const squash = (text: string) => text.replace(/\s+/g, " ").trim();

/** Runs one set of checks. A step that throws (a timeout, a missing element) is one failure, not the end of the run. */
async function group(name: string, run: () => Promise<void>): Promise<void> {
  try {
    await run();
    passed += 1;
  } catch (error) {
    failures.push(`${name}: stopped: ${error instanceof Error ? squash(error.message) : String(error)}`);
  }
}

/* ─────────────────── Functions that run in the page ─────────────────── */

function pageFacts() {
  const visible = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const text = (el: Element | null | undefined) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
  const meta = (selector: string) => document.querySelector(selector)?.getAttribute("content") ?? null;
  const main = document.querySelector("main");
  return {
    h1: [...document.querySelectorAll("h1")].map((el) => ({ text: text(el), visible: visible(el) })),
    mains: document.querySelectorAll("main").length,
    title: document.title,
    description: meta('meta[name="description"]'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
    robots: meta('meta[name="robots"]'),
    ogImage: meta('meta[property="og:image"]'),
    lang: document.documentElement.lang,
    banners: document.querySelectorAll('body > header, [role="banner"]').length,
    navs: [...document.querySelectorAll("nav")].map((nav) => ({
      label: nav.getAttribute("aria-label"),
      inFooter: nav.closest("footer") !== null,
    })),
    beforeMain: main
      ? [...document.querySelectorAll("a, button")]
          .filter((el) => (el.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0)
          .map((el) => el.getAttribute("aria-label") ?? text(el))
      : [],
    logo: (() => {
      const link = document.querySelector('body > div a[href="/"]');
      if (!link) return null;
      const r = link.getBoundingClientRect();
      return { top: r.top + window.scrollY, height: r.height, name: link.getAttribute("aria-label") };
    })(),
    h2: [...document.querySelectorAll("main h2")].map((el) => text(el)),
    images: [...document.images].map((img) => ({
      src: img.currentSrc,
      alt: img.alt,
      loaded: img.complete && img.naturalWidth > 0,
      inMain: img.closest("main") !== null,
    })),
    earlyAccess: [...document.querySelectorAll("[data-early-access]")].map((el) => {
      const section = el.closest("section");
      return {
        state: el.getAttribute("data-early-access"),
        text: text(el),
        visible: visible(el),
        heading: text(section?.querySelector("h2")),
        controls: section?.querySelectorAll("a, button, input, form").length ?? -1,
      };
    }),
    forms: document.querySelectorAll("form").length,
    fields: document.querySelectorAll("input, textarea, select").length,
    submits: document.querySelectorAll('button[type="submit"], input[type="submit"]').length,
    links: [...document.querySelectorAll<HTMLAnchorElement>("a[href]")].map((a) => ({
      href: a.href,
      raw: a.getAttribute("href") ?? "",
      target: a.target,
      rel: a.rel,
      text: a.getAttribute("aria-label") ?? text(a),
      /** For a link to a place on the same page: whether that place exists. */
      anchorExists: (a.getAttribute("href") ?? "").startsWith("#") ? document.getElementById((a.getAttribute("href") ?? "").slice(1)) !== null : null,
      inFooterNav: a.closest('footer nav[aria-label="Pages"]') !== null,
    })),
    mainText: text(main),
    footerText: text(document.querySelector("footer")),
    storage: { session: sessionStorage.length, local: localStorage.length, cookies: document.cookie },
  };
}

function fadeFacts() {
  return [...document.querySelectorAll("[data-fade]")].map((el) => ({
    state: el.getAttribute("data-fade"),
    opacity: getComputedStyle(el).opacity,
  }));
}

/** Layout rules: nothing wider than the viewport, nothing pinned, nothing that moves, no glows. */
function layoutFacts(reduced: boolean) {
  const describe = (el: Element) =>
    `<${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}> "${(el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40)}"`;
  /* Fades and hover colour only. The focus ring is not in the list: it must appear at once. */
  const ALLOWED_TRANSITIONS = new Set(["opacity", "color", "text-decoration-color"]);
  const width = document.documentElement.clientWidth;
  const problems: string[] = [];
  const sticky: string[] = [];
  if (document.documentElement.scrollWidth > width) {
    problems.push(`document is ${document.documentElement.scrollWidth}px wide in a ${width}px viewport`);
  }
  for (const el of document.body.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none") continue;
    const r = el.getBoundingClientRect();
    const rendered = r.width > 0 && r.height > 0;
    /* Elements parked entirely off the left edge (the honeypot) cannot cause scrolling. */
    if (rendered && r.right > 0 && (r.right > width + 1 || r.left < -1)) {
      problems.push(`${describe(el)} spans ${Math.round(r.left)}..${Math.round(r.right)}px in a ${width}px viewport`);
    }
    if (cs.transform !== "none" || cs.translate !== "none" || cs.rotate !== "none" || cs.scale !== "none") {
      problems.push(`${describe(el)} is transformed`);
    }
    if (cs.animationName !== "none") problems.push(`${describe(el)} runs the animation "${cs.animationName}"`);
    const durations = cs.transitionDuration.split(",").map((value) => parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1000));
    const properties = cs.transitionProperty.split(",").map((value) => value.trim());
    properties.forEach((property, index) => {
      const duration = durations[index % durations.length] ?? 0;
      if (duration === 0) return;
      if (reduced) problems.push(`${describe(el)} still transitions ${property} with reduced motion`);
      else if (!ALLOWED_TRANSITIONS.has(property)) {
        problems.push(`${describe(el)} transitions ${property}`);
      } else if (duration > 600) problems.push(`${describe(el)} transitions ${property} for ${duration}ms`);
    });
    if (cs.position === "fixed" && rendered) problems.push(`${describe(el)} is fixed to the viewport`);
    if (cs.position === "sticky" && rendered) sticky.push(el.getAttribute("aria-label") ?? describe(el));
    if (cs.backgroundImage !== "none" && !el.classList.contains("text-gradient")) {
      problems.push(`${describe(el)} has a background image or gradient`);
    }
    if (cs.boxShadow !== "none") problems.push(`${describe(el)} has a shadow or glow`);
    if (cs.filter !== "none" || cs.backdropFilter !== "none") problems.push(`${describe(el)} has a filter`);
  }
  return { problems, sticky };
}

/** Interactive elements under 44px. A link inside a sentence is exempt; a link that stands alone is not. */
function tapFacts() {
  const small: string[] = [];
  for (const el of document.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"]')) {
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1 || r.right <= 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden") continue;
    const parentText = (el.parentElement?.textContent ?? "").trim();
    const inSentence = cs.display === "inline" && parentText !== (el.textContent ?? "").trim();
    if (inSentence) continue;
    if (r.height < 44 || r.width < 44) {
      small.push(`"${(el.textContent ?? "").trim().slice(0, 30)}" is ${Math.round(r.width)}x${Math.round(r.height)}px`);
    }
  }
  return small;
}

/** Body copy and form fields under 16px. Labels and captions are small on purpose and are not body copy. */
function textSizeFacts() {
  const small: string[] = [];
  for (const el of document.querySelectorAll("main p, main li, main dd, main dt, main input")) {
    if (el.matches(".text-label, [data-signup-referral], figcaption") || el.closest("[aria-hidden='true']")) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 16) small.push(`"${(el.textContent ?? "").trim().slice(0, 30)}" is ${size}px`);
  }
  return small;
}

/**
 * WCAG AA contrast of everything a visitor reads: every visible text node
 * against the background behind it (4.5:1, or 3:1 for large text), each stop
 * of gradient text, icons, field borders (3:1) and placeholders (4.5:1).
 */
function contrastFacts() {
  type Rgba = [number, number, number, number];
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const failures: string[] = [];
  if (!ctx) return { pairs: 0, failures: ["no canvas to read colours with"] };

  const cache = new Map<string, Rgba>();
  const rgba = (color: string): Rgba => {
    const known = cache.get(color);
    if (known) return known;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    const value: Rgba = [d[0] ?? 0, d[1] ?? 0, d[2] ?? 0, (d[3] ?? 0) / 255];
    cache.set(color, value);
    return value;
  };
  const over = (top: Rgba, bottom: Rgba): Rgba => [
    top[0] * top[3] + bottom[0] * (1 - top[3]),
    top[1] * top[3] + bottom[1] * (1 - top[3]),
    top[2] * top[3] + bottom[2] * (1 - top[3]),
    1,
  ];
  const luminance = (c: Rgba) => {
    const channel = (v: number) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(c[0]) + 0.7152 * channel(c[1]) + 0.0722 * channel(c[2]);
  };
  const ratio = (a: Rgba, b: Rgba) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
    return (hi + 0.05) / (lo + 0.05);
  };
  /** The solid colour behind an element, or null when a layer cannot be read as a colour. */
  const backgroundOf = (start: Element | null): Rgba | null => {
    const layers: Rgba[] = [];
    for (let node = start; node; node = node.parentElement) {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage !== "none") return null;
      const color = rgba(cs.backgroundColor);
      if (color[3] === 0) continue;
      layers.push(color);
      if (color[3] === 1) break;
    }
    const base = layers.pop();
    if (!base || base[3] !== 1) return null;
    return layers.reduceRight((below, layer) => over(layer, below), base);
  };
  const opacityOf = (start: Element) => {
    let opacity = 1;
    for (let node: Element | null = start; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
    return opacity;
  };
  const seen = new Set<string>();
  const judge = (what: string, colors: string[], background: Rgba | null, opacity: number, required: number) => {
    if (!background) {
      failures.push(`${what}: the background behind it is not a plain colour`);
      return;
    }
    for (const color of colors) {
      const key = `${color}|${background.join(",")}|${opacity}|${required}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const fg = rgba(color);
      const actual = ratio(over([fg[0], fg[1], fg[2], fg[3] * opacity], background), background);
      if (actual < required) {
        failures.push(`${what}: ${color} on rgb(${background.slice(0, 3).map(Math.round).join(", ")}) is ${actual.toFixed(2)}:1, needs ${required}:1`);
      }
    }
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = (node.textContent ?? "").trim();
    const el = node.parentElement;
    if (text === "" || !el || el.closest("script, style, noscript, template")) continue;
    range.selectNodeContents(node);
    const r = range.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.right <= 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden") continue;
    let clipped = false;
    for (let a: Element | null = el; a && a !== document.body; a = a.parentElement) {
      const box = a.getBoundingClientRect();
      if (box.width <= 1 && box.height <= 1) clipped = true;
    }
    if (clipped) continue;
    /* Content that has not faded in yet is not on screen. The page check asserts every fade ends at 1. */
    const opacity = opacityOf(el);
    if (opacity === 0) continue;
    const size = parseFloat(cs.fontSize);
    const required = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700) ? 3 : 4.5;
    const what = `"${text.slice(0, 40)}"`;
    const gradientText = cs.backgroundClip === "text" && rgba(cs.color)[3] === 0;
    if (gradientText) {
      const stops = cs.backgroundImage.match(/rgba?\([^)]+\)/g);
      if (!stops) failures.push(`${what}: gradient text without readable colour stops`);
      else judge(what, stops, backgroundOf(el.parentElement), opacity, required);
    } else {
      judge(what, [cs.color], backgroundOf(el), opacity, required);
    }
  }

  for (const icon of document.querySelectorAll("svg")) {
    const r = icon.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.right <= 0 || opacityOf(icon) === 0) continue;
    judge(`icon in "${(icon.parentElement?.textContent ?? "").trim().slice(0, 30)}"`, [getComputedStyle(icon).color], backgroundOf(icon), opacityOf(icon), 3);
  }
  for (const field of document.querySelectorAll("input")) {
    const r = field.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.right <= 0 || opacityOf(field) === 0) continue;
    const cs = getComputedStyle(field);
    judge(`border of the ${field.name} field`, [cs.borderTopColor], backgroundOf(field.parentElement), opacityOf(field), 3);
    judge(`placeholder of the ${field.name} field`, [getComputedStyle(field, "::placeholder").color], backgroundOf(field), opacityOf(field), 4.5);
  }
  return { pairs: seen.size, failures };
}

function focusFacts() {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const all = [...document.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea, [tabindex]")].filter(
    (candidate) => candidate.tabIndex >= 0 && !(candidate as HTMLButtonElement).disabled && candidate.checkVisibility(),
  );
  return {
    index: all.indexOf(el as HTMLElement),
    total: all.length,
    name: (el.getAttribute("aria-label") ?? el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40) || el.tagName,
    outlineStyle: cs.outlineStyle,
    outlineWidth: parseFloat(cs.outlineWidth),
    outlineColor: cs.outlineColor,
    inViewport: r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= window.innerHeight + 1,
    inMain: el.closest("main") !== null,
    honeypot: el.closest("[aria-hidden='true']") !== null,
  };
}

/* ───────────────────────────── Harness ───────────────────────────── */

type Watch = { problems: string[] };

/** Records console errors, page errors, failed requests and requests that leave the site. */
function watch(page: Page, base: string, expected: (url: string) => boolean): Watch {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() !== "error" && message.type() !== "warning") return;
    if (expected(message.location().url)) return;
    problems.push(`console ${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`page error: ${error.message}`));
  page.on("requestfailed", (request) => {
    if (!expected(request.url())) problems.push(`request failed: ${request.url()} (${request.failure()?.errorText})`);
  });
  page.on("request", (request) => {
    const url = request.url();
    if (url.startsWith("data:") || url.startsWith(`${base}/`) || expected(url)) return;
    problems.push(`request left the site: ${url}`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400 && !expected(response.url())) {
      problems.push(`${response.status()} for ${response.url()}`);
    }
  });
  return { problems };
}

async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  /* The first fade turning "in" shows that the page has hydrated. */
  await page.waitForFunction(() => document.querySelector('[data-fade="in"]') !== null);
}

/** Waits until every fade that has started has finished, so colours can be measured at rest. */
function fadesFinished(page: Page): Promise<boolean> {
  return page
    .waitForFunction(() => [...document.querySelectorAll('[data-fade="in"]')].every((el) => getComputedStyle(el).opacity === "1"), null, { timeout: 5000 })
    .then(
      () => true,
      () => false,
    );
}

async function scrollThrough(page: Page): Promise<void> {
  const { total, step } = await page.evaluate(() => ({
    total: document.documentElement.scrollHeight,
    step: Math.round(window.innerHeight * 0.5),
  }));
  for (let y = 0; y <= total; y += step) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(60);
  }
  await page.waitForFunction(() => [...document.images].every((img) => img.complete));
}

type Mode = { width: number; reduced: boolean };
const modeLabel = (mode: Mode) => `${mode.width}px${mode.reduced ? " reduced motion" : ""}`;

function newContext(browser: Browser, mode: Mode, mobile: boolean): Promise<BrowserContext> {
  const height = HEIGHTS[mode.width];
  if (!height) throw new Error(`verify: no viewport height for ${mode.width}px`);
  return browser.newContext({
    viewport: { width: mode.width, height },
    reducedMotion: mode.reduced ? "reduce" : "no-preference",
    isMobile: mobile,
    hasTouch: mobile,
  });
}

/* ─────────────────────── Every page, every viewport ─────────────────────── */

async function checkPage(context: BrowserContext, base: string, mode: Mode, path: string): Promise<void> {
  const route = site.routes.find((entry) => entry.path === path);
  const label = `${path} at ${modeLabel(mode)}`;
  const page = await context.newPage();
  const url = `${base}${path}`;
  const watcher = watch(page, base, (seen) => !route && seen === url);
  try {
    const response = await page.goto(url, { waitUntil: "load" });
    equal(`${label}: status`, response?.status(), route ? 200 : 404);
    if (mode.reduced) {
      const before = await page.evaluate(fadeFacts);
      check(`${label}: with reduced motion everything is visible from the start`, before.every((fade) => fade.opacity === "1"));
    }
    await settle(page);
    await scrollThrough(page);
    const allIn = await page
      .waitForFunction(() => [...document.querySelectorAll("[data-fade]")].every((el) => el.getAttribute("data-fade") === "in"), null, { timeout: 5000 })
      .then(() => true, () => false);
    check(`${label}: every fade has played after scrolling the page`, allIn);
    check(`${label}: fades finish`, await fadesFinished(page));
    const fades = await page.evaluate(fadeFacts);
    check(`${label}: has fades`, fades.length > 0);
    check(`${label}: faded content ends fully visible`, fades.every((fade) => fade.opacity === "1"), JSON.stringify(fades));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));

    const facts = await page.evaluate(pageFacts);
    equal(`${label}: one h1`, facts.h1.length, 1);
    check(`${label}: the h1 is visible and has text`, facts.h1.every((h1) => h1.visible && h1.text !== ""));
    equal(`${label}: one main`, facts.mains, 1);
    equal(`${label}: lang`, facts.lang, "en");
    equal(`${label}: no header bar`, facts.banners, 0);
    check(
      `${label}: the only navigation is the footer and a page's own contents list`,
      facts.navs.every((nav) => (nav.label === "Pages" && nav.inFooter) || nav.label === "On this page"),
      JSON.stringify(facts.navs),
    );
    equal(`${label}: above the content there is only the skip link and the logo`, facts.beforeMain, ["Skip to content", `${site.name} home`]);
    check(`${label}: small logo at the top`, facts.logo !== null && facts.logo.top < 80 && facts.logo.height <= 48, JSON.stringify(facts.logo));

    const layout = await page.evaluate(layoutFacts, mode.reduced);
    equal(`${label}: no overflow, pinned bars, movement, glows or boxes`, layout.problems, []);
    check(
      `${label}: nothing sticks except a contents list`,
      layout.sticky.every((name) => name === "On this page"),
      layout.sticky.join(", "),
    );

    if (mode.width <= 768) equal(`${label}: tap targets are at least 44px`, await page.evaluate(tapFacts), []);
    if (mode.width === 390) equal(`${label}: body copy is at least 16px`, await page.evaluate(textSizeFacts), []);
    const contrast = await page.evaluate(contrastFacts);
    check(`${label}: contrast was measured`, contrast.pairs > 0);
    equal(`${label}: WCAG AA contrast`, contrast.failures, []);

    check(`${label}: images loaded`, facts.images.every((img) => img.loaded), JSON.stringify(facts.images.filter((img) => !img.loaded)));
    check(`${label}: images have alt text`, facts.images.every((img) => img.alt.trim() !== ""));
    check(`${label}: no retired wording`, !RETIRED_WORDING.test(`${facts.mainText} ${facts.footerText}`), (`${facts.mainText} ${facts.footerText}`.match(RETIRED_WORDING) ?? [""])[0]);

    for (const link of facts.links) {
      const target = new URL(link.href);
      if (link.anchorExists !== null) {
        check(`${label}: link "${link.text}" points at a place on the page`, link.anchorExists, link.raw);
      } else if (target.origin === base) {
        const known = site.routes.some((entry) => entry.path === target.pathname);
        check(`${label}: link "${link.text}" goes to a page of this site`, known, link.raw);
      } else {
        equal(`${label}: the only outside link is the X account ("${link.text}")`, link.href.replace(/\/$/, ""), site.links.x.replace(/\/$/, ""));
        check(`${label}: outside link "${link.text}" opens safely in a new tab`, link.target === "_blank" && link.rel.includes("noopener"));
      }
      check(`${label}: link "${link.text}" does not go to Telegram`, !/t\.me|telegram/i.test(link.href));
    }
    equal(
      `${label}: footer page links`,
      facts.links.filter((link) => link.inFooterNav).map((link) => link.raw),
      [...site.routes.filter((entry) => entry.footer !== "none").map((entry) => entry.path), site.links.x],
    );
    check(`${label}: footer carries the notices`, [site.legal.antiImpersonation, site.legal.shortDisclaimer, site.legal.nonAffiliation].every((line) => facts.footerText.includes(line)));

    /* Early access: the markup must match the state in the config. */
    const spots = route ? EARLY_ACCESS_SPOTS[path] : 0;
    if (spots === undefined) throw new Error(`verify: no early access expectation for ${path}`);
    equal(`${label}: early access spots`, facts.earlyAccess.length, spots);
    check(`${label}: every early access spot is "${state}" and visible`, facts.earlyAccess.every((spot) => spot.state === state && spot.visible));
    check(`${label}: every early access spot sits under its heading`, facts.earlyAccess.every((spot) => spot.heading === site.earlyAccess.heading));
    if (state === "on_hold") {
      check(`${label}: on hold, each spot is the one plain line`, facts.earlyAccess.every((spot) => spot.text === site.earlyAccess.onHoldLine && spot.controls === 0), JSON.stringify(facts.earlyAccess));
      equal(`${label}: on hold, no form, field or submit button`, [facts.forms, facts.fields, facts.submits], [0, 0, 0]);
      equal(`${label}: on hold, nothing is stored in the browser`, facts.storage, { session: 0, local: 0, cookies: "" });
    } else {
      check(`${label}: open, each spot shows the line and no "opens soon"`, facts.earlyAccess.every((spot) => spot.text.includes(site.earlyAccess.openLine) && !spot.text.includes(site.earlyAccess.onHoldLine)));
      equal(`${label}: open, one form with one email field and a hidden trap per spot`, [facts.forms, facts.fields, facts.submits], [spots, spots * 2, spots]);
      equal(`${label}: open, no cookies`, facts.storage.cookies, "");
    }

    if (route) {
      equal(`${label}: title`, facts.title, route.title);
      equal(`${label}: description`, facts.description, route.description);
      equal(`${label}: canonical`, facts.canonical, new URL(path, site.url).toString());
      check(`${label}: social image`, facts.ogImage !== null && facts.ogImage.endsWith(site.seo.ogImage.path), String(facts.ogImage));
    } else {
      equal(`${label}: 404 headline`, facts.h1[0]?.text, NOT_FOUND_TITLE);
      check(`${label}: 404 is not indexed`, facts.robots !== null && facts.robots.includes("noindex"), String(facts.robots));
    }
    equal(`${label}: no console errors, failed requests or outside requests`, watcher.problems, []);
  } finally {
    await page.close();
  }
}

async function checkAllPages(browser: Browser, base: string): Promise<void> {
  const paths = [...site.routes.map((route) => route.path), ...REMOVED_PATHS, MISSING_PATH];
  const modes: Mode[] = WIDTHS.flatMap((width) => [false, true].map((reduced) => ({ width, reduced })));
  await Promise.all(
    modes.map(async (mode) => {
      const context = await newContext(browser, mode, mode.width < 600);
      try {
        for (const path of paths) await group(`${path} at ${modeLabel(mode)}`, () => checkPage(context, base, mode, path));
      } finally {
        await context.close();
      }
    }),
  );
}

/* ───────────────────────── Content and metadata ───────────────────────── */

async function checkContent(browser: Browser, base: string): Promise<void> {
  const context = await newContext(browser, { width: 1440, reduced: false }, false);
  const page = await context.newPage();
  const open = async (path: string) => {
    await page.goto(`${base}${path}`, { waitUntil: "load" });
    await settle(page);
    return page.evaluate(pageFacts);
  };
  try {
    /* Home: five short sections, one screenshot, Meme Radar in one line, web later in one line. */
    const home = await open("/");
    equal("home: headline is the tagline", home.h1[0]?.text.replace(/\s+/g, ""), site.tagline.replace(/\s+/g, ""));
    equal("home: section headings", home.h2, [site.earlyAccess.heading, "What it does", "A check, not a guarantee.", site.platform.headline, site.earlyAccess.heading]);
    equal("home: one screenshot", home.images.filter((img) => img.inMain).length, 1);
    const radar = getFeature("meme-radar");
    equal("config: Meme Radar is in development", radar.status, "in_development");
    const radarLine = `${radar.title} is ${featureStatusMeta[radar.status].label.toLowerCase()}.`;
    check("home: says Meme Radar is in development", home.mainText.includes(radarLine));
    equal("home: mentions Meme Radar once", home.mainText.split(radar.title).length - 1, 1);
    check("home: says Telegram first, web later", home.mainText.includes(site.platform.line));
    check("home: no date for the web version", !/\b20\d\d\b|\bQ[1-4]\b/.test(site.platform.line));
    equal("home: titles are unique", new Set(site.routes.map((route) => route.title)).size, site.routes.length);

    /* Features: one row per feature, each with its status from the config. */
    const features = await open("/features/");
    equal("features: one screenshot", features.images.filter((img) => img.inMain).length, 1);
    const rows = await page.evaluate(() =>
      [...document.querySelectorAll("main [data-status]")].map((el) => {
        const row = el.closest("[id]");
        return { id: row?.id ?? "", status: el.getAttribute("data-status"), label: (el.textContent ?? "").trim(), title: (row?.querySelector("dt")?.textContent ?? "").trim() };
      }),
    );
    equal(
      "features: rows match the config",
      [...rows].sort((a, b) => a.id.localeCompare(b.id)),
      visibleFeatures()
        .map((feature) => ({ id: feature.id, status: feature.status, label: featureStatusMeta[feature.status].label, title: feature.title }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    );
    check("features: Meme Radar has a row", rows.some((row) => row.id === "meme-radar" && row.status === "in_development"));

    /* Safety: one screenshot. */
    const safety = await open("/safety/");
    equal("safety: one screenshot", safety.images.filter((img) => img.inMain).length, 1);

    /* FAQ: structured data says exactly what the page shows. */
    await open("/faq/");
    const faq = await page.evaluate(() => {
      const data = [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((script) => JSON.parse(script.textContent ?? "null") as { "@type"?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] })
        .find((entry) => entry["@type"] === "FAQPage");
      const shown = [...document.querySelectorAll<HTMLButtonElement>("main button[aria-controls]")].map((button) => ({
        question: (button.textContent ?? "").trim(),
        answer: (document.getElementById(button.getAttribute("aria-controls") ?? "")?.querySelector("p")?.textContent ?? "").trim(),
      }));
      return { structured: (data?.mainEntity ?? []).map((entry) => ({ question: entry.name, answer: entry.acceptedAnswer.text })), shown };
    });
    check("faq: has questions", faq.shown.length > 0);
    equal("faq: structured data equals the visible questions and answers", faq.structured, faq.shown);
    const allAnswers = faq.shown.map((entry) => `${entry.question} ${entry.answer}`).join(" ");
    check("faq: no cost or referral questions", !/cost|price|fee|referral|refund/i.test(faq.shown.map((entry) => entry.question).join(" ")));
    equal(`faq: answers say sign-up ${state === "on_hold" ? "opens soon" : "is the form"}`, allAnswers.includes(site.earlyAccess.onHoldLine), state === "on_hold");

    /* Docs: no Meme Radar commands. */
    const docs = await open("/docs/");
    check("docs: no Meme Radar section", !docs.h2.some((heading) => heading.includes(radar.title)));

    /* Legal pages are marked as drafts until reviewed. */
    for (const path of ["/terms/", "/privacy/", "/risk/"]) {
      const legal = await open(path);
      equal(`${path}: draft notice shown while not reviewed`, legal.mainText.includes(site.legal.draftNotice), !site.legal.reviewed);
    }
    await open("/privacy/");
    const signup = squash(await page.locator("#early-access").innerText());
    if (state === "on_hold") {
      check("privacy: on hold, says no email addresses are collected", signup.includes("collects no email addresses") && signup.includes("not open yet"), signup);
    } else {
      check("privacy: open, says the form collects an email address and where it goes", signup.includes("email address") && signup.includes(new URL(earlyAccessDestination()).host) && !signup.includes("not open yet"), signup);
    }

    /* Sitemap and robots. */
    const sitemap = await (await context.request.get(`${base}/sitemap.xml`)).text();
    equal(
      "sitemap: lists exactly the configured routes",
      [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort(),
      site.routes.map((route) => new URL(route.path, site.url).toString()).sort(),
    );
    const robots = await (await context.request.get(`${base}/robots.txt`)).text();
    check("robots.txt: points at the sitemap", robots.includes(`${site.url}/sitemap.xml`), robots);

    /* A referral link does nothing while there is no form to use it. */
    if (state === "on_hold") {
      const withCode = await open(`/?${site.referral.queryParam}=ABC123`);
      equal("on hold: a referral link stores nothing", withCode.storage, { session: 0, local: 0, cookies: "" });
    }
  } finally {
    await context.close();
  }

  /* Without script the content is still there. */
  const noScript = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  try {
    const plain = await noScript.newPage();
    for (const route of site.routes) {
      await plain.goto(`${base}${route.path}`, { waitUntil: "load" });
      const fades = await plain.locator("[data-fade]").evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).opacity));
      check(`${route.path} without script: content is visible`, fades.length > 0 && fades.every((opacity) => opacity === "1"));
      equal(`${route.path} without script: one h1`, await plain.locator("h1").count(), 1);
    }
    if (state === "open") {
      await plain.goto(`${base}/`, { waitUntil: "load" });
      check("home without script: says sign-up needs JavaScript", (await plain.locator("main").innerText()).includes(signupCopy.noScript));
    }
  } finally {
    await noScript.close();
  }
}

/* ───────────────────────────── Keyboard ───────────────────────────── */

async function checkKeyboard(browser: Browser, base: string, width: number): Promise<void> {
  const at = `keyboard at ${width}px`;
  const context = await newContext(browser, { width, reduced: false }, false);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const page = await context.newPage();
  const open = async (path: string) => {
    await page.goto(`${base}${path}`, { waitUntil: "load" });
    await settle(page);
  };
  const focused = () => page.evaluate(focusFacts);
  try {
    /* Skip link. */
    await open("/");
    await page.keyboard.press("Tab");
    const skip = await focused();
    equal(`${at}: first Tab lands on the skip link`, skip?.name, "Skip to content");
    check(`${at}: the skip link is visible when focused`, skip?.inViewport === true);
    check(`${at}: fades finish`, await fadesFinished(page));
    equal(`${at}: the focused skip link passes contrast`, (await page.evaluate(contrastFacts)).failures, []);
    await page.keyboard.press("Enter");
    equal(`${at}: the skip link jumps to the content`, new URL(page.url()).hash, "#main");
    await page.keyboard.press("Tab");
    check(`${at}: after the skip link, Tab continues inside the content`, (await focused())?.inMain === true);

    /* Every focusable element, in order, with a visible focus ring. */
    for (const path of [...site.routes.map((route) => route.path), MISSING_PATH]) {
      await open(path);
      await page.keyboard.press("Tab");
      const first = await focused();
      if (!first) {
        check(`${at} ${path}: Tab focuses something`, false);
        continue;
      }
      const stops = [first];
      for (let i = 1; i < first.total; i += 1) {
        await page.keyboard.press("Tab");
        const stop = await focused();
        if (!stop) break;
        stops.push(stop);
      }
      equal(`${at} ${path}: Tab reaches every control in page order`, stops.map((stop) => stop.index), stops.map((_, index) => index));
      equal(`${at} ${path}: Tab reaches all ${first.total} controls`, stops.length, first.total);
      const noRing = stops.filter((stop) => stop.outlineStyle === "none" || stop.outlineWidth < 2 || stop.outlineColor !== "rgb(245, 246, 250)");
      equal(`${at} ${path}: every focused control shows the focus ring`, noRing.map((stop) => stop.name), []);
      equal(`${at} ${path}: every focused control is scrolled into view`, stops.filter((stop) => !stop.inViewport).map((stop) => stop.name), []);
      check(`${at} ${path}: Tab never lands on the hidden trap field`, stops.every((stop) => !stop.honeypot));
    }

    /* 404: the link home works. */
    await open(MISSING_PATH);
    await page.getByRole("link", { name: "Back to the home page" }).focus();
    await page.keyboard.press("Enter");
    await page.waitForURL(`${base}/`);
    check(`${at}: the 404 page links home`, true);

    /* FAQ accordion. */
    await open("/faq/");
    const triggers = page.locator("main button[aria-controls]");
    const count = await triggers.count();
    check(`${at} faq: has questions`, count > 2);
    const expanded = () => triggers.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("aria-expanded")));
    equal(`${at} faq: only the first answer starts open`, await expanded(), ["true", ...Array<string>(count - 1).fill("false")]);
    const panel = (index: number) => triggers.nth(index).evaluate((node) => document.getElementById(node.getAttribute("aria-controls") ?? "")?.checkVisibility() ?? false);
    equal(`${at} faq: closed answers are hidden`, await panel(1), false);
    await triggers.nth(1).click();
    equal(`${at} faq: a click opens an answer`, [(await expanded())[1], await panel(1)], ["true", true]);
    equal(`${at} faq: other answers stay as they were`, (await expanded())[0], "true");
    await triggers.nth(1).focus();
    await page.keyboard.press("Enter");
    equal(`${at} faq: Enter closes it`, [(await expanded())[1], await panel(1)], ["false", false]);
    await page.keyboard.press("Space");
    equal(`${at} faq: Space opens it`, (await expanded())[1], "true");
    const focusIndex = () => triggers.evaluateAll((nodes) => nodes.indexOf(document.activeElement as HTMLElement));
    await page.keyboard.press("ArrowDown");
    equal(`${at} faq: Down moves to the next question`, await focusIndex(), 2);
    await page.keyboard.press("End");
    equal(`${at} faq: End moves to the last question`, await focusIndex(), count - 1);
    await page.keyboard.press("ArrowDown");
    equal(`${at} faq: Down wraps to the first question`, await focusIndex(), 0);
    await page.keyboard.press("ArrowUp");
    equal(`${at} faq: Up wraps to the last question`, await focusIndex(), count - 1);
    await page.keyboard.press("Home");
    equal(`${at} faq: Home moves to the first question`, await focusIndex(), 0);

    /* Docs: contents list and copy buttons. */
    await open("/docs/");
    const contents = page.locator('nav[aria-label="On this page"] a');
    const targets = await contents.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href") ?? ""));
    check(`${at} docs: has a contents list`, targets.length > 2);
    for (const [index, target] of targets.entries()) {
      await contents.nth(index).focus();
      await page.keyboard.press("Enter");
      /* Polls instead of sleeping a fixed time, so a slow machine cannot read the position too early. */
      const arrived = await page
        .waitForFunction(
          (hash) => {
            const section = document.querySelector(hash);
            if (!section || window.location.hash !== hash) return false;
            const top = section.getBoundingClientRect().top;
            const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
            return (top >= -2 && top <= 200) || atEnd;
          },
          target,
          { timeout: 5000 },
        )
        .then(
          () => true,
          () => false,
        );
      check(`${at} docs: contents link ${target} jumps to its section`, arrived);
    }
    const copy = page.locator("main button[data-copy-state]");
    check(`${at} docs: has copy buttons`, (await copy.count()) > 5);
    const command = squash(await copy.first().locator("xpath=..").locator("code").innerText());
    check(`${at} docs: commands start with a slash`, command.startsWith("/"), command);
    await copy.first().focus();
    await page.keyboard.press("Enter");
    await page.waitForSelector('main button[data-copy-state="done"]');
    equal(`${at} docs: the copy button puts the command on the clipboard`, await page.evaluate(() => navigator.clipboard.readText()), command);
    await page.waitForSelector('main button[data-copy-state="done"]', { state: "detached", timeout: 5000 });
    equal(`${at} docs: the copy button resets`, await copy.first().getAttribute("data-copy-state"), "idle");
  } finally {
    await context.close();
  }

  /* A browser that refuses clipboard access gets told so, not a false "Copied". */
  const refusing = await newContext(browser, { width, reduced: false }, false);
  await refusing.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "clipboard", {
      get: () => ({ writeText: () => Promise.reject(new DOMException("refused", "NotAllowedError")) }),
    });
  });
  try {
    const page = await refusing.newPage();
    await page.goto(`${base}/docs/`, { waitUntil: "load" });
    await settle(page);
    const copy = page.locator("main button[data-copy-state]").first();
    await copy.click();
    await page.waitForSelector('main button[data-copy-state="failed"]');
    check(`${at} docs: a refused copy is reported as failed`, (await page.locator('main button[data-copy-state="done"]').count()) === 0);
  } finally {
    await refusing.close();
  }
}

/* ─────────────────────── Early access form (open) ─────────────────────── */

type Reply = "ok" | "refused-by-cors" | "server-error" | "network-failure" | "hold";
type Post = { method: string; contentType: string; fields: Record<string, string> };

async function checkForm(browser: Browser, base: string, to: string, width: number): Promise<void> {
  const at = `form at ${width}px`;
  const emailLabel = signupCopy.emailLabel;
  const sample = "name@example.com";

  /** A fresh browser session on `path`, with the sign-up destination answered here. */
  const session = async (path: string) => {
    const context = await newContext(browser, { width, reduced: false }, false);
    const posts: Post[] = [];
    const control: { reply: Reply; release: () => void } = { reply: "ok", release: () => {} };
    const cors = { "access-control-allow-origin": "*" };
    await context.route(to, async (route: Route) => {
      const request = route.request();
      posts.push({
        method: request.method(),
        contentType: request.headers()["content-type"] ?? "",
        fields: Object.fromEntries(new URLSearchParams(request.postData() ?? "")),
      });
      switch (control.reply) {
        case "ok":
          return route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: '{"ok":true}' });
        case "refused-by-cors":
          /* The destination saved the address but does not let this site read the answer. */
          return route.fulfill({ status: 200, headers: { "access-control-allow-origin": "https://another-site.invalid" }, contentType: "application/json", body: '{"ok":true}' });
        case "server-error":
          return route.fulfill({ status: 500, headers: cors, contentType: "application/json", body: '{"ok":false}' });
        case "network-failure":
          return route.abort("failed");
        case "hold":
          await new Promise<void>((release) => {
            control.release = release;
          });
          return route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: '{"ok":true}' });
      }
    });
    const page = await context.newPage();
    const watcher = watch(page, base, (url) => url === to);
    const goto = async (target: string) => {
      await page.goto(`${base}${target}`, { waitUntil: "load" });
      await settle(page);
    };
    await goto(path);
    const form = page.locator('[data-early-access="open"] form').first();
    return {
      page,
      posts,
      control,
      watcher,
      goto,
      form,
      email: form.getByLabel(emailLabel),
      submit: form.getByRole("button"),
      alert: form.getByRole("alert"),
      done: page.locator('[data-signup="done"]'),
      referral: form.locator("[data-signup-referral]"),
      close: () => context.close(),
    };
  };

  /* Structure and labels. */
  await group(`${at}: structure`, async () => {
    const s = await session("/");
    try {
      equal(`${at}: the field is an email field named by its label`, await s.email.evaluate((node: HTMLInputElement) => [node.type, node.name, node.autocomplete, node.getAttribute("aria-invalid")]), ["email", "email", "email", "false"]);
      equal(`${at}: the button is named`, squash(await s.submit.innerText()), site.earlyAccess.submitLabel);
      equal(`${at}: one visible field per form`, await s.form.locator("input:visible").evaluateAll((nodes) => nodes.filter((node) => node.getBoundingClientRect().right > 0).length), 1);
      const trap = await s.form.locator('input[name="website"]').evaluate((node: HTMLInputElement) => ({
        offScreen: node.getBoundingClientRect().right <= 0,
        hiddenFromAssistiveTech: node.closest("[aria-hidden='true']") !== null,
        tabIndex: node.tabIndex,
      }));
      equal(`${at}: the trap field is off screen, hidden from assistive tech and out of the tab order`, trap, { offScreen: true, hiddenFromAssistiveTech: true, tabIndex: -1 });
      const sizes = await s.form.evaluate((node) => {
        const box = (selector: string) => {
          const r = node.querySelector(selector)?.getBoundingClientRect();
          return r ? { width: Math.round(r.width), height: Math.round(r.height) } : null;
        };
        return { field: box('input[name="email"]'), button: box("button"), viewport: document.documentElement.clientWidth };
      });
      check(`${at}: field and button are big enough to use`, sizes.field !== null && sizes.button !== null && sizes.field.height >= 44 && sizes.button.height >= 44 && sizes.field.width >= Math.min(260, sizes.viewport - 48), JSON.stringify(sizes));
      equal(`${at}: no referral line without a code`, await s.referral.count(), 0);
      equal(`${at}: no problems on load`, s.watcher.problems, []);
    } finally {
      await s.close();
    }
  });

  /* Validation: nothing is sent for an empty or malformed address. */
  await group(`${at}: validation`, async () => {
    const s = await session("/faq/");
    try {
      await s.submit.click();
      equal(`${at}: empty address is refused`, squash(await s.alert.innerText()), signupCopy.errors.empty);
      const wiring = await s.email.evaluate((node: HTMLInputElement) => ({
        invalid: node.getAttribute("aria-invalid"),
        describedByTheError: document.getElementById(node.getAttribute("aria-describedby") ?? "")?.getAttribute("role") === "alert",
        focused: document.activeElement === node,
      }));
      equal(`${at}: the error is tied to the field and the field takes focus`, wiring, { invalid: "true", describedByTheError: true, focused: true });
      check(`${at}: fades finish`, await fadesFinished(s.page));
      equal(`${at}: an error passes contrast`, (await s.page.evaluate(contrastFacts)).failures, []);
      for (const bad of ["plainaddress", "name@", "@example.com", "name@example", "na me@example.com"]) {
        await s.email.fill(bad);
        await s.email.press("Enter");
        equal(`${at}: "${bad}" is refused`, squash(await s.alert.innerText()), signupCopy.errors.invalid);
      }
      equal(`${at}: nothing was sent for refused addresses`, s.posts.length, 0);
      equal(`${at}: no success message for refused addresses`, await s.done.count(), 0);
      equal(`${at}: validation causes no console errors`, s.watcher.problems, []);
    } finally {
      await s.close();
    }
  });

  /* Success only after the destination has answered. */
  await group(`${at}: success`, async () => {
    const s = await session("/");
    try {
      s.control.reply = "hold";
      await s.email.fill(sample);
      await s.submit.click();
      await s.page.waitForFunction(() => document.querySelector('form[data-signup="sending"]') !== null);
      equal(`${at}: while sending, the button is disabled and says so`, [await s.submit.isDisabled(), squash(await s.submit.innerText()), await s.form.getAttribute("aria-busy")], [true, signupCopy.sending, "true"]);
      equal(`${at}: no success message before the destination answers`, await s.done.count(), 0);
      await s.email.press("Enter");
      await s.page.waitForTimeout(300);
      equal(`${at}: a second submit while sending sends nothing more`, s.posts.length, 1);
      equal(`${at}: still no success message`, await s.done.count(), 0);
      s.control.release();
      await s.done.waitFor();
      equal(`${at}: success message after a successful answer`, squash(await s.done.innerText()), signupCopy.success);
      equal(`${at}: the success message is announced and focused`, await s.done.evaluate((node) => [node.getAttribute("role"), document.activeElement === node]), ["status", true]);
      equal(`${at}: the request is a form-encoded POST with the email only`, [s.posts[0]?.method, s.posts[0]?.contentType.split(";")[0], s.posts[0]?.fields], ["POST", "application/x-www-form-urlencoded", { email: sample }]);
      equal(`${at}: the other form on the page is untouched`, await s.page.locator('form[data-signup="idle"]').count(), 1);
      equal(`${at}: a successful sign-up causes no console errors`, s.watcher.problems, []);
    } finally {
      await s.close();
    }
  });

  /* Failures are reported as failures, and never as success. */
  for (const reply of ["server-error", "network-failure", "refused-by-cors"] as const) {
    await group(`${at} ${reply}`, async () => {
      const s = await session("/features/");
      try {
        s.control.reply = reply;
        await s.email.fill(sample);
        await s.submit.click();
        await s.alert.waitFor();
        equal(`${at} ${reply}: reported as a failure`, squash(await s.alert.innerText()), signupCopy.errors.failed);
        equal(`${at} ${reply}: no success message`, await s.done.count(), 0);
        equal(`${at} ${reply}: the address is kept and the form can be sent again`, [await s.email.inputValue(), await s.email.getAttribute("aria-invalid"), await s.submit.isDisabled()], [sample, "false", false]);
        s.control.reply = "ok";
        await s.submit.click();
        await s.done.waitFor();
        equal(`${at} ${reply}: a retry that succeeds shows success`, [squash(await s.done.innerText()), s.posts.length], [signupCopy.success, 2]);
      } finally {
        await s.close();
      }
    });
  }

  /* The trap field: a filled trap sends nothing. */
  await group(`${at}: trap field`, async () => {
    const s = await session("/safety/");
    try {
      await s.form.locator('input[name="website"]').evaluate((node: HTMLInputElement) => {
        node.value = "https://spam.example";
      });
      await s.email.fill(sample);
      await s.submit.click();
      await s.alert.waitFor();
      equal(`${at}: a filled trap field sends nothing and shows no success`, [s.posts.length, await s.done.count(), squash(await s.alert.innerText())], [0, 0, signupCopy.errors.failed]);
    } finally {
      await s.close();
    }
  });

  /* Referral codes: 3 to 20 letters or digits are sent, anything else is ignored. */
  const param = site.referral.queryParam;
  const codes: { query: string; sent: string | null }[] = [
    { query: `?${param}=ABC123`, sent: "ABC123" },
    { query: `?${param}=abc`, sent: "abc" },
    { query: `?${param}=${"A1".repeat(10)}`, sent: "A1".repeat(10) },
    { query: `?${param}=ab`, sent: null },
    { query: `?${param}=${"A".repeat(21)}`, sent: null },
    { query: `?${param}=abc-123`, sent: null },
    { query: `?${param}=${encodeURIComponent("<script>alert(1)</script>")}`, sent: null },
    { query: `?${param}=`, sent: null },
    { query: "", sent: null },
  ];
  for (const { query, sent } of codes) {
    const name = `${at} referral "${query}"`;
    await group(name, async () => {
      const s = await session(`/${query}`);
      try {
        equal(`${name}: code shown`, (await s.referral.count()) === 1 ? squash(await s.referral.innerText()) : null, sent === null ? null : `${signupCopy.referral}: ${sent}`);
        await s.email.fill(sample);
        await s.submit.click();
        await s.done.waitFor();
        equal(`${name}: fields sent`, s.posts[0]?.fields, sent === null ? { email: sample } : { email: sample, [param]: sent });
        equal(`${name}: no console errors`, s.watcher.problems, []);
      } finally {
        await s.close();
      }
    });
  }

  /* A code survives moving between pages, and a later bad code does not replace it. */
  await group(`${at}: kept referral code`, async () => {
    const s = await session(`/?${param}=ABC123`);
    try {
      await s.page.locator('footer nav a[href="/faq/"]').click();
      await s.page.waitForURL(`${base}/faq/`);
      await s.referral.waitFor();
      equal(`${at}: the code is kept on the next page`, squash(await s.referral.innerText()), `${signupCopy.referral}: ABC123`);
      await s.goto(`/docs/?${param}=${encodeURIComponent("!!")}`);
      await s.referral.waitFor();
      equal(`${at}: a malformed code does not replace a kept one`, squash(await s.referral.innerText()), `${signupCopy.referral}: ABC123`);
      await s.email.fill(sample);
      await s.submit.click();
      await s.done.waitFor();
      equal(`${at}: the kept code is sent`, s.posts[0]?.fields, { email: sample, [param]: "ABC123" });
    } finally {
      await s.close();
    }
  });
}

/* ───────────────────────── The other state ───────────────────────── */

function replaceOnce(file: string, pattern: RegExp, replacement: string): void {
  const before = readFileSync(file, "utf8");
  const matches = before.match(new RegExp(pattern.source, `${pattern.flags}g`));
  if (matches?.length !== 1) throw new Error(`verify: expected one ${pattern} in ${file}, found ${matches?.length ?? 0}`);
  writeFileSync(file, before.replace(pattern, replacement));
}

/** Copies the project, switches the early access state, builds it and runs this suite on the copy. */
function checkOtherState(): boolean {
  const other: EarlyAccessState = state === "on_hold" ? "open" : "on_hold";
  const copy = mkdtempSync(join(tmpdir(), "ripjaw-verify-"));
  const skipped = new Set(["node_modules", ".next", "out", ".git", ".capture", "tsconfig.tsbuildinfo"]);
  try {
    cpSync(root, copy, { recursive: true, filter: (source) => !skipped.has(relative(root, source).split(sep)[0] ?? "") });
    symlinkSync(join(root, "node_modules"), join(copy, "node_modules"), "dir");
    const config = join(copy, "src/config/site.ts");
    const hosting = join(copy, "vercel.json");
    if (other === "open") {
      replaceOnce(config, /^(\s*)state: "on_hold",$/m, `$1state: "open",\n$1destination: "${TEST_DESTINATION}",`);
      replaceOnce(hosting, /connect-src 'self';/, `connect-src 'self' ${new URL(TEST_DESTINATION).origin};`);
    } else {
      replaceOnce(config, /^(\s*)state: "open",$/m, `$1state: "on_hold",`);
      replaceOnce(hosting, /connect-src 'self' [^;]+;/, "connect-src 'self';");
    }
    console.log(`\nverify: building early access "${other}" in ${copy}`);
    for (const command of [["run", "build"], ["run", "verify:this-build", "--", "--chrome", chromePath]]) {
      const result = spawnSync("npm", command, { cwd: copy, stdio: "inherit" });
      if (result.status !== 0) return false;
    }
    return true;
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
}

/* ───────────────────────────── Run ───────────────────────────── */

if (!existsSync(join(root, "out"))) throw new Error('verify: out/ does not exist. Run "npm run build" first.');

const server = await startServer(root, 0);
const browser = await chromium.launch({ executablePath: chromePath, args: ["--no-sandbox"] });
try {
  console.log(`verify: early access "${state}", serving ${root}/out at ${server.url}`);
  const base = server.url;
  await checkAllPages(browser, base);
  await group("content", () => checkContent(browser, base));
  for (const width of [1440, 390]) await group(`keyboard at ${width}px`, () => checkKeyboard(browser, base, width));
  if (destination !== null) {
    for (const width of [390, 1440]) await checkForm(browser, base, destination, width);
  }
} finally {
  await browser.close();
  await server.close();
}

if (failures.length > 0) {
  console.error(`verify: early access "${state}": ${failures.length} check(s) failed, ${passed} passed:\n  - ${failures.join("\n  - ")}`);
  process.exit(1);
}
console.log(`verify: early access "${state}": ${passed} checks passed.`);

if (!args["this-build-only"] && !checkOtherState()) {
  console.error("verify: the other early access state failed. See the output above.");
  process.exit(1);
}
