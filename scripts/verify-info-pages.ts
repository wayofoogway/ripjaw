/**
 * Browser checks for the information pages (/pricing/, /faq/, /docs/, /terms/,
 * /privacy/, /risk/ and the 404 page) against a served production build, with
 * the home page included as a regression check.
 *
 *   npm run build && npm run serve
 *   node --conditions=react-server scripts/verify-info-pages.ts \
 *     --chrome <path to Chrome> --url http://localhost:4173
 *
 * Every check prints one line. The script exits with 1 when any check fails.
 */
import { parseArgs } from "node:util";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright-core";
import { site } from "../src/config/site.ts";

const { values } = parseArgs({ options: { chrome: { type: "string" }, url: { type: "string" } } });
if (!values.chrome) throw new Error("Missing --chrome <path to a Chrome or Chromium binary>");
if (!values.url) throw new Error("Missing --url <origin of the served build>");
const origin = values.url.replace(/\/$/, "");

const INFO_ROUTES = ["/pricing/", "/faq/", "/docs/", "/terms/", "/privacy/", "/risk/"];
const LEGAL_ROUTES = ["/terms/", "/privacy/", "/risk/"];
const LONG_FORM_ROUTES = ["/docs/", ...LEGAL_ROUTES];
const UNKNOWN_PATH = "/this-page-does-not-exist/";
const NOT_FOUND_TITLE = "This page got rugged.";
const PAGES = ["/", ...INFO_ROUTES, UNKNOWN_PATH];
const WIDTHS = [390, 768, 1024, 1440];
const HEIGHTS: Record<number, number> = { 390: 844, 768: 1024, 1024: 768, 1440: 900 };
const MIN_TAP = 44;
const MIN_BODY_PX = 16;

let passed = 0;
const failures: string[] = [];

function check(name: string, ok: boolean, detail = ""): void {
  if (ok) {
    passed += 1;
    console.log(`PASS  ${name}`);
  } else {
    failures.push(name);
    console.log(`FAIL  ${name}${detail ? `\n      ${detail}` : ""}`);
  }
}

function heightFor(width: number): number {
  const height = HEIGHTS[width];
  if (height === undefined) throw new Error(`No viewport height for width ${width}`);
  return height;
}

/** Configured routes that the served build does not have yet. Their link prefetches fail, which is expected. */
async function findUnbuiltRoutes(): Promise<string[]> {
  const unbuilt: string[] = [];
  for (const route of site.routes) {
    const response = await fetch(origin + route.path);
    if (response.status === 404) unbuilt.push(route.path);
  }
  return unbuilt;
}

type Session = { context: BrowserContext; page: Page; errors: string[] };

async function open(
  browser: Browser,
  width: number,
  options: { reducedMotion?: boolean; clipboard?: boolean; unbuilt: string[] },
): Promise<Session> {
  const context = await browser.newContext({
    viewport: { width, height: heightFor(width) },
    reducedMotion: options.reducedMotion ? "reduce" : "no-preference",
    isMobile: width < 600,
    hasTouch: width < 600,
    permissions: options.clipboard ? ["clipboard-read", "clipboard-write"] : [],
  });
  const page = await context.newPage();
  const errors: string[] = [];
  const expected = (url: string) => {
    const { pathname } = new URL(url);
    return pathname === UNKNOWN_PATH || options.unbuilt.some((path) => pathname.startsWith(path));
  };
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const { url } = message.location();
    if (url && expected(url)) return;
    errors.push(`console: ${message.text()} (${url})`);
  });
  return { context, page, errors };
}

async function visit(page: Page, path: string): Promise<number> {
  const response = await page.goto(origin + path, { waitUntil: "networkidle" });
  if (!response) throw new Error(`No response for ${path}`);
  await page.evaluate(() => document.fonts.ready);
  return response.status();
}

async function scrollThrough(page: Page): Promise<void> {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.round(page.viewportSize()!.height * 0.7);
  for (let y = 0; y <= total; y += step) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(900);
}

/**
 * Runs in the page. The transform a parallax layer applies to the page's grid
 * backdrop: "none" when it is still, null when the page has no such backdrop.
 */
function farPlaneTransform(): string | null {
  let node = document.querySelector<HTMLElement>("main .fine-grid");
  if (node === null) return null;
  for (; node !== null && node.tagName !== "MAIN"; node = node.parentElement) {
    const { transform } = getComputedStyle(node);
    if (transform !== "none") return transform;
  }
  return "none";
}

/* ── Layout, structure and motion at every width ─────────────────────────── */

async function checkLayout(browser: Browser, unbuilt: string[]): Promise<void> {
  const titles = new Map<string, string>();

  for (const reducedMotion of [false, true]) {
    for (const width of WIDTHS) {
      for (const path of PAGES) {
        const label = `${path} @${width}${reducedMotion ? " reduced-motion" : ""}`;
        const { context, page, errors } = await open(browser, width, { reducedMotion, unbuilt });
        try {
          const status = await visit(page, path);
          const isUnknown = path === UNKNOWN_PATH;
          check(`${label}: status ${isUnknown ? 404 : 200}`, status === (isUnknown ? 404 : 200), `got ${status}`);

          const head = await page.evaluate(() => ({
            h1: [...document.querySelectorAll("h1")].map((h) => h.textContent ?? ""),
            title: document.title,
            canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
            robots: document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content ?? null,
            description: document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? "",
            fields: document.querySelectorAll("form, input, textarea, select").length,
            main: document.querySelectorAll("main").length,
          }));
          check(`${label}: one h1`, head.h1.length === 1 && head.h1[0]!.trim() !== "", JSON.stringify(head.h1));
          check(`${label}: one main landmark`, head.main === 1, `found ${head.main}`);
          check(`${label}: no forms or inputs`, head.fields === 0, `found ${head.fields}`);
          check(`${label}: has a description`, head.description.length > 40, head.description);

          if (isUnknown) {
            check(`${label}: 404 headline`, head.h1[0] === NOT_FOUND_TITLE, JSON.stringify(head.h1));
            check(`${label}: noindex`, head.robots !== null && head.robots.includes("noindex"), String(head.robots));
          } else {
            check(
              `${label}: canonical`,
              head.canonical === new URL(path, site.url).toString(),
              String(head.canonical),
            );
            check(`${label}: indexable`, head.robots === null || !head.robots.includes("noindex"), String(head.robots));
          }
          if (width === 1440 && !reducedMotion) {
            const clash = titles.get(head.title);
            check(`${label}: unique title "${head.title}"`, head.title !== "" && clash === undefined, `same as ${clash}`);
            titles.set(head.title, path);
          }

          await scrollThrough(page);
          const layout = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth - window.innerWidth,
            hiddenReveals: [...document.querySelectorAll<HTMLElement>("[data-reveal]")].filter(
              (el) => Number(getComputedStyle(el).opacity) < 0.99,
            ).length,
            reveals: document.querySelectorAll("[data-reveal]").length,
          }));
          check(`${label}: no horizontal overflow`, layout.overflow <= 0, `${layout.overflow}px wider than the viewport`);
          check(
            `${label}: scroll reveals end visible`,
            layout.hiddenReveals === 0,
            `${layout.hiddenReveals} of ${layout.reveals} still hidden`,
          );
          const farPlane = await page.evaluate(farPlaneTransform);
          if (reducedMotion && farPlane !== null) {
            check(`${label}: parallax layer is static`, farPlane === "none", farPlane);
          }

          if (width <= 768) {
            const small = await page.evaluate(
              ({ minTap }) => {
                const problems: string[] = [];
                for (const el of document.querySelectorAll<HTMLElement>("a[href], button")) {
                  const style = getComputedStyle(el);
                  if (style.display === "inline" || style.visibility === "hidden") continue;
                  if (el.closest("[inert]")) continue;
                  let rect = el.getBoundingClientRect();
                  if (rect.width <= 1 || rect.height <= 1) continue;
                  if (rect.width >= minTap && rect.height >= minTap) continue;
                  el.scrollIntoView({ block: "center", behavior: "instant" });
                  rect = el.getBoundingClientRect();
                  const cx = rect.left + rect.width / 2;
                  const cy = rect.top + rect.height / 2;
                  const reach = minTap / 2 - 1;
                  const hits = (x: number, y: number) => {
                    const hit = document.elementFromPoint(x, y);
                    return hit !== null && (hit === el || el.contains(hit));
                  };
                  const wide = rect.width >= minTap || (hits(cx - reach, cy) && hits(cx + reach, cy));
                  const tall = rect.height >= minTap || (hits(cx, cy - reach) && hits(cx, cy + reach));
                  if (!wide || !tall) {
                    const name = (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 40);
                    problems.push(`${el.tagName.toLowerCase()} "${name}" ${Math.round(rect.width)}x${Math.round(rect.height)}`);
                  }
                }
                return problems;
              },
              { minTap: MIN_TAP },
            );
            check(`${label}: tap targets at least ${MIN_TAP}px`, small.length === 0, small.join("; "));
          }

          if (width === 390 && path !== "/") {
            const tiny = await page.evaluate(
              ({ minPx }) => {
                const problems: string[] = [];
                const blocks = document.querySelectorAll<HTMLElement>(
                  "main .prose-rj :is(p, li, dd), main [role=region] p, main table :is(th, td) span, main table td",
                );
                for (const el of blocks) {
                  if (el.closest(".sr-only")) continue;
                  const size = parseFloat(getComputedStyle(el).fontSize);
                  if (size < minPx && (el.textContent ?? "").trim().length > 0) {
                    problems.push(`${size}px "${(el.textContent ?? "").trim().slice(0, 40)}"`);
                  }
                }
                return problems;
              },
              { minPx: MIN_BODY_PX },
            );
            check(`${label}: body copy at least ${MIN_BODY_PX}px`, tiny.length === 0, tiny.join("; "));
          }

          check(`${label}: no console errors`, errors.length === 0, errors.join(" | "));
        } finally {
          await context.close();
        }
      }
    }
  }
}

/* ── Parallax moves when motion is allowed ───────────────────────────────── */

async function checkMotion(browser: Browser, unbuilt: string[]): Promise<void> {
  for (const path of ["/pricing/", UNKNOWN_PATH]) {
    const { context, page } = await open(browser, 1440, { unbuilt });
    try {
      await visit(page, path);
      await page.evaluate(() => window.scrollTo({ top: 260, behavior: "instant" }));
      await page.waitForTimeout(900);
      const transform = await page.evaluate(farPlaneTransform);
      check(`${path}: parallax layer moves on scroll`, transform !== null && transform !== "none", String(transform));
    } finally {
      await context.close();
    }
  }
}

/* ── Keyboard ────────────────────────────────────────────────────────────── */

async function focusedOutline(page: Page): Promise<{ text: string; style: string; width: string }> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const style = getComputedStyle(el);
    return { text: (el.textContent ?? "").trim(), style: style.outlineStyle, width: style.outlineWidth };
  });
}

async function checkKeyboard(browser: Browser, unbuilt: string[]): Promise<void> {
  /* Skip link and focus ring, on every page. */
  for (const path of PAGES) {
    const { context, page } = await open(browser, 1440, { unbuilt });
    try {
      await visit(page, path);
      await page.keyboard.press("Tab");
      const first = await focusedOutline(page);
      check(`${path}: first Tab stop is the skip link`, first.text === "Skip to content", first.text);
      check(`${path}: focus ring is visible`, first.style === "solid" && parseFloat(first.width) >= 2, JSON.stringify(first));
      await page.keyboard.press("Enter");
      check(`${path}: skip link targets main`, new URL(page.url()).hash === "#main", page.url());
    } finally {
      await context.close();
    }
  }

  /* FAQ accordions and topic links. */
  for (const path of ["/faq/", "/pricing/"]) {
    const { context, page } = await open(browser, 1440, { unbuilt });
    try {
      await visit(page, path);
      const triggers = page.locator("main button[aria-controls]");
      const count = await triggers.count();
      check(`${path}: has accordion questions`, count >= 5, `found ${count}`);

      const state = async (index: number) =>
        page.evaluate((i) => {
          const trigger = document.querySelectorAll<HTMLButtonElement>("main button[aria-controls]")[i]!;
          const panel = document.getElementById(trigger.getAttribute("aria-controls")!)!;
          return {
            expanded: trigger.getAttribute("aria-expanded"),
            inert: panel.hasAttribute("inert"),
            height: panel.getBoundingClientRect().height,
            focused: document.activeElement === trigger,
          };
        }, index);

      await triggers.nth(1).focus();
      const before = await state(1);
      check(`${path}: closed answer is collapsed and inert`, before.expanded === "false" && before.inert, JSON.stringify(before));
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
      const opened = await state(1);
      check(
        `${path}: Enter opens an answer`,
        opened.expanded === "true" && !opened.inert && opened.height > 20,
        JSON.stringify(opened),
      );
      await page.keyboard.press("Space");
      await page.waitForTimeout(500);
      const closed = await state(1);
      check(`${path}: Space closes it`, closed.expanded === "false" && closed.inert, JSON.stringify(closed));
      await page.keyboard.press("ArrowDown");
      check(`${path}: ArrowDown moves to the next question`, (await state(2)).focused);
      await page.keyboard.press("ArrowUp");
      check(`${path}: ArrowUp moves back`, (await state(1)).focused);

      if (path === "/faq/") {
        const topics = page.locator('nav[aria-label="FAQ topics"] a');
        const total = await topics.count();
        check(`${path}: has topic links`, total >= 4, `found ${total}`);
        for (let i = 0; i < total; i += 1) {
          const href = await topics.nth(i).getAttribute("href");
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
          await topics.nth(i).focus();
          await page.keyboard.press("Enter");
          await page.waitForTimeout(1200);
          const top = await page.evaluate((hash) => {
            const target = document.getElementById(hash.slice(1));
            return target ? target.getBoundingClientRect().top : null;
          }, href ?? "#");
          check(
            `${path}: topic link ${href} scrolls to its group`,
            top !== null && top >= 0 && top < 300 && new URL(page.url()).hash === href,
            `top ${top}, url ${page.url()}`,
          );
        }
      }
    } finally {
      await context.close();
    }
  }

  /* Long-form pages: table of contents and sticky sidebar. */
  for (const path of LONG_FORM_ROUTES) {
    const { context, page } = await open(browser, 1440, { unbuilt });
    try {
      await visit(page, path);
      const toc = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLAnchorElement>('nav[aria-label="On this page"] a')].map((a) => ({
          hash: a.hash,
          text: (a.textContent ?? "").trim(),
          heading: (document.querySelector(`${a.hash} h2`)?.textContent ?? "").trim(),
        })),
      );
      check(`${path}: table of contents has entries`, toc.length >= 5, `found ${toc.length}`);
      const broken = toc.filter((entry) => entry.heading !== entry.text);
      check(`${path}: every contents link has a matching section`, broken.length === 0, JSON.stringify(broken));
      const sections = await page.evaluate(() => document.querySelectorAll("main article > section").length);
      check(`${path}: every section is in the contents`, sections === toc.length, `${sections} sections, ${toc.length} links`);

      /* A section in the middle: at the very end the contents rightly scroll away with the article. */
      const middle = page.locator('nav[aria-label="On this page"] a').nth(Math.floor(toc.length / 2));
      await middle.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1500);
      const position = await page.evaluate(() => {
        const nav = document.querySelector('nav[aria-label="On this page"]')!;
        const target = document.querySelector(window.location.hash)!;
        return {
          navTop: nav.getBoundingClientRect().top,
          targetTop: target.getBoundingClientRect().top,
          scrollY: window.scrollY,
          viewport: window.innerHeight,
        };
      });
      check(
        `${path}: contents link scrolls to its section`,
        position.scrollY > 200 && position.targetTop >= 0 && position.targetTop < position.viewport,
        JSON.stringify(position),
      );
      check(
        `${path}: contents stay in view while reading (sticky)`,
        position.navTop >= 0 && position.navTop < 200,
        JSON.stringify(position),
      );
    } finally {
      await context.close();
    }
  }

  /* Docs: commands are text, and each copy button works. */
  {
    const { context, page } = await open(browser, 1440, { clipboard: true, unbuilt });
    try {
      await visit(page, "/docs/");
      const rows = await page.evaluate(() =>
        [...document.querySelectorAll("main article li")]
          .filter((li) => li.querySelector("button"))
          .map((li) => ({
            codes: [...li.querySelectorAll("code")].map((code) => (code.textContent ?? "").trim()),
            buttons: li.querySelectorAll("button").length,
            description: (li.querySelector("p")?.textContent ?? "").trim(),
          })),
      );
      check("/docs/: lists commands", rows.length >= 20, `found ${rows.length}`);
      const malformed = rows.filter(
        (row) => row.codes.length !== 1 || !row.codes[0]!.startsWith("/") || row.buttons !== 1 || row.description === "",
      );
      check("/docs/: each command is text with a description and one copy button", malformed.length === 0, JSON.stringify(malformed));
      const images = await page.evaluate(() => document.querySelectorAll("main img, main picture").length);
      check("/docs/: documentation is text, not images", images === 0, `found ${images} images`);

      const buttons = page.locator("main article li button");
      for (const index of [0, rows.length - 1]) {
        const button = buttons.nth(index);
        await button.focus();
        await page.keyboard.press("Enter");
        await page.waitForTimeout(250);
        const copied = await page.evaluate(() => navigator.clipboard.readText());
        const command = rows[index]!.codes[0]!.split(" ")[0]!;
        check(`/docs/: copy button ${index + 1} copies "${command}"`, copied === command, `clipboard has "${copied}"`);
        check(`/docs/: copy button ${index + 1} confirms`, (await button.getAttribute("data-copy-state")) === "done");
        await page.waitForTimeout(2300);
        check(`/docs/: copy button ${index + 1} resets`, (await button.getAttribute("data-copy-state")) === "idle");
      }
    } finally {
      await context.close();
    }

    const blocked = await open(browser, 1440, { unbuilt });
    try {
      await blocked.page.addInitScript(() => {
        Object.defineProperty(navigator, "clipboard", {
          value: { writeText: () => Promise.reject(new Error("blocked")) },
        });
      });
      await visit(blocked.page, "/docs/");
      const button = blocked.page.locator("main article li button").first();
      await button.click();
      await blocked.page.waitForTimeout(250);
      check(
        "/docs/: a refused copy is reported, not shown as copied",
        (await button.getAttribute("data-copy-state")) === "failed",
        String(await button.getAttribute("data-copy-state")),
      );
    } finally {
      await blocked.context.close();
    }
  }

  /* 404: the way home works from the keyboard. */
  {
    const { context, page } = await open(browser, 1440, { unbuilt });
    try {
      await visit(page, UNKNOWN_PATH);
      const home = page.locator('main a[href="/"]').first();
      await home.focus();
      const ring = await focusedOutline(page);
      check("404: home link takes focus with a visible ring", ring.style === "solid", JSON.stringify(ring));
      await page.keyboard.press("Enter");
      await page.waitForURL(`${origin}/`);
      check("404: Enter on the home link opens the home page", new URL(page.url()).pathname === "/", page.url());
    } finally {
      await context.close();
    }
  }
}

/* ── Referral pass-through ───────────────────────────────────────────────── */

async function telegramLinks(page: Page): Promise<{ cta: string[]; other: string[] }> {
  return page.evaluate(() => {
    const anchors = [...document.querySelectorAll<HTMLAnchorElement>('a[href*="t.me"]')];
    return {
      cta: anchors.filter((a) => a.dataset.cta === "telegram").map((a) => a.href),
      other: anchors.filter((a) => a.dataset.cta !== "telegram").map((a) => a.href),
    };
  });
}

async function checkReferrals(browser: Browser, unbuilt: string[]): Promise<void> {
  const { telegramBot } = site.links;
  const { queryParam, startPrefix } = site.referrals;
  const withCode = (code: string) => `${telegramBot}?start=${startPrefix}${code}`;
  const cases: { name: string; query: string; expected: string }[] = [
    { name: "valid code", query: `?${queryParam}=ABC123`, expected: withCode("ABC123") },
    { name: "3 characters", query: `?${queryParam}=a1B`, expected: withCode("a1B") },
    { name: "20 characters", query: `?${queryParam}=${"A1b2".repeat(5)}`, expected: withCode("A1b2".repeat(5)) },
    { name: "too short", query: `?${queryParam}=AB`, expected: telegramBot },
    { name: "too long", query: `?${queryParam}=${"A".repeat(21)}`, expected: telegramBot },
    { name: "not alphanumeric", query: `?${queryParam}=AB-12_3`, expected: telegramBot },
    { name: "script-like", query: `?${queryParam}=${encodeURIComponent("<script>alert(1)</script>")}`, expected: telegramBot },
    { name: "empty", query: `?${queryParam}=`, expected: telegramBot },
    { name: "missing", query: "", expected: telegramBot },
  ];

  for (const path of PAGES) {
    for (const item of cases) {
      for (const width of [1440, 390]) {
        if (width === 390 && item.name !== "valid code" && item.name !== "script-like") continue;
        const { context, page } = await open(browser, width, { unbuilt });
        try {
          await visit(page, path + item.query);
          if (width === 390) {
            await page.locator('button[aria-label="Open menu"]').click();
            await page.waitForTimeout(400);
          }
          const links = await telegramLinks(page);
          const wrong = links.cta.filter((href) => href !== item.expected);
          const minimum = width === 390 ? 3 : 2;
          check(
            `${path} referral ${item.name} @${width}: ${links.cta.length} Telegram CTAs → ${item.expected}`,
            links.cta.length >= minimum && wrong.length === 0,
            `expected at least ${minimum}; wrong: ${JSON.stringify(wrong)}`,
          );
          if (item.name === "valid code" && width === 1440) {
            check(
              `${path}: every Telegram link is a referral-aware CTA`,
              links.other.length === 0,
              JSON.stringify(links.other),
            );
          }
        } finally {
          await context.close();
        }
      }
    }
  }

  /* The code survives moving between pages in the same tab. */
  const { context, page } = await open(browser, 1440, { unbuilt });
  try {
    await visit(page, `/pricing/?${queryParam}=ABC123`);
    await page.locator('main a[href="/faq/"]').first().click();
    await page.waitForURL(`${origin}/faq/`);
    await page.waitForTimeout(400);
    const afterClientNav = await telegramLinks(page);
    check(
      "referral code survives in-site navigation",
      afterClientNav.cta.length >= 2 && afterClientNav.cta.every((href) => href === withCode("ABC123")),
      JSON.stringify(afterClientNav.cta),
    );
    for (const path of ["/docs/", "/terms/", UNKNOWN_PATH]) {
      await visit(page, path);
      const links = await telegramLinks(page);
      check(
        `referral code survives a full load of ${path}`,
        links.cta.length >= 2 && links.cta.every((href) => href === withCode("ABC123")),
        JSON.stringify(links.cta),
      );
    }
  } finally {
    await context.close();
  }
}

/* ── Content rules ───────────────────────────────────────────────────────── */

async function checkContent(browser: Browser, unbuilt: string[]): Promise<void> {
  const { context, page } = await open(browser, 1440, { unbuilt });
  try {
    /* FAQ structured data says exactly what the page says. */
    await visit(page, "/faq/");
    const faq = await page.evaluate(() => {
      const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')].map(
        (script) => JSON.parse(script.textContent ?? "") as Record<string, unknown>,
      );
      const visible = [...document.querySelectorAll<HTMLButtonElement>("main button[aria-controls]")].map((trigger) => ({
        question: (trigger.textContent ?? "").trim(),
        answer: (
          document.getElementById(trigger.getAttribute("aria-controls")!)!.querySelector("p")?.textContent ?? ""
        ).trim(),
      }));
      return { scripts, visible };
    });
    const faqData = faq.scripts.filter((data) => data["@type"] === "FAQPage");
    check("/faq/: one FAQPage structured data block", faqData.length === 1, `found ${faqData.length}`);
    const entities = (faqData[0]?.mainEntity ?? []) as {
      "@type": string;
      name: string;
      acceptedAnswer: { "@type": string; text: string };
    }[];
    const structured = entities.map((entity) => ({ question: entity.name, answer: entity.acceptedAnswer.text }));
    check(
      `/faq/: structured data matches the ${faq.visible.length} visible questions and answers`,
      faq.visible.length >= 20 && JSON.stringify(structured) === JSON.stringify(faq.visible),
      `structured ${structured.length}, visible ${faq.visible.length}`,
    );
    check(
      "/faq/: structured data is well formed",
      entities.every((entity) => entity["@type"] === "Question" && entity.acceptedAnswer["@type"] === "Answer"),
    );
    check(
      "/faq/: no question is repeated",
      new Set(faq.visible.map((entry) => entry.question)).size === faq.visible.length,
    );
    check(
      "/faq/: every answer has text",
      faq.visible.every((entry) => entry.answer.length >= 10),
      JSON.stringify(faq.visible.filter((entry) => entry.answer.length < 10)),
    );
    const ratings = JSON.stringify(faq.scripts);
    check("/faq/: no ratings or reviews in structured data", !/aggregateRating|"review"/i.test(ratings));

    /* Pricing: the access fee, separated trade costs, and no unpublished amounts. */
    await visit(page, "/pricing/");
    const pricing = await page.evaluate(() => ({
      text: document.querySelector("main")!.innerText,
      costRows: document.querySelectorAll("#costs table tbody tr").length,
      faqLink: document.querySelector('main a[href="/faq/"]') !== null,
      referrals: document.querySelector("#referrals") !== null,
      ldJson: document.querySelectorAll('script[type="application/ld+json"]').length,
    }));
    check("/pricing/: shows the access fee", pricing.text.includes(site.access.descriptor), site.access.descriptor);
    check("/pricing/: shows the trading-cost disclosure", pricing.text.includes(site.access.disclosure));
    check("/pricing/: lists per-trade costs separately", pricing.costRows >= 4, `found ${pricing.costRows} rows`);
    check("/pricing/: links to the full FAQ", pricing.faqLink);
    check(
      `/pricing/: referral section ${site.referrals.showOnPricing ? "shown" : "hidden"} as configured`,
      pricing.referrals === site.referrals.showOnPricing,
    );
    if (site.speedFees.pendingVerification) {
      const leaked = site.speedFees.tiers.filter((tier) => pricing.text.includes(`${tier.feeSol} SOL`));
      check("/pricing/: unverified speed-fee amounts are not shown", leaked.length === 0, JSON.stringify(leaked));
      check("/pricing/: says where current trade fees are shown", pricing.text.includes(site.speedFees.pendingCopy));
    }

    /* Legal pages: marked as drafts, and silent on facts the owner has not confirmed. */
    for (const path of LEGAL_ROUTES) {
      await visit(page, path);
      const legal = await page.evaluate(() => ({
        header: document.querySelector<HTMLElement>("main header")!.innerText,
        text: document.querySelector<HTMLElement>("main")!.innerText,
        openItems: document.querySelector("#open-items") !== null,
        mailto: document.querySelectorAll('main a[href^="mailto:"]').length,
      }));
      if (!site.legal.reviewed) {
        check(
          `${path}: draft notice under the title`,
          legal.header.toLowerCase().includes(site.legal.draftNotice.toLowerCase()),
          legal.header,
        );
        check(`${path}: lists what is still open in the draft`, legal.openItems);
      }
      if (!site.legal.entityName.confirmed) {
        check(`${path}: names no operating entity`, !/operated by|\b(LLC|Ltd|Inc|GmbH|Limited)\b/.test(legal.text));
      }
      if (!site.support.contact.confirmed) {
        check(`${path}: gives no support contact`, legal.mailto === 0 && !/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(legal.text));
      }
      if (!site.legal.refundPolicy.confirmed && path !== "/privacy/") {
        check(`${path}: states that refund terms are not published`, legal.text.includes("Refund terms have not been published yet."));
      }
      if (!site.legal.restrictedJurisdictions.confirmed) {
        check(`${path}: names no restricted locations`, !legal.text.includes("is not offered in:"));
      }
    }

    /* Sitemap lists the built routes and nothing else. */
    const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
    for (const path of INFO_ROUTES) {
      check(`sitemap lists ${path}`, sitemap.includes(`<loc>${new URL(path, site.url).toString()}</loc>`));
    }
    for (const path of unbuilt) {
      check(`sitemap leaves out unbuilt ${path}`, !sitemap.includes(`<loc>${new URL(path, site.url).toString()}</loc>`));
    }
    check("sitemap leaves out the 404 page", !/404|not-found/.test(sitemap));
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch({ executablePath: values.chrome, args: ["--no-sandbox"] });
try {
  const unbuilt = await findUnbuiltRoutes();
  console.log(
    unbuilt.length === 0
      ? "All configured routes are built."
      : `Configured routes not in this build (their prefetch 404s are expected): ${unbuilt.join(", ")}`,
  );
  await checkLayout(browser, unbuilt);
  await checkMotion(browser, unbuilt);
  await checkKeyboard(browser, unbuilt);
  await checkReferrals(browser, unbuilt);
  await checkContent(browser, unbuilt);
} finally {
  await browser.close();
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length > 0) {
  console.log(failures.map((name) => `  - ${name}`).join("\n"));
  process.exit(1);
}
