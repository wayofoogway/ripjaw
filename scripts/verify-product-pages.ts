/**
 * Browser checks for the product pages (/features/, /meme-radar/ and /safety/)
 * against a served production build.
 *
 *   npm run build && npm run serve
 *   node --conditions=react-server scripts/verify-product-pages.ts \
 *     --chrome <path to Chrome> --url http://localhost:4173
 *
 * Every check prints one line. The script exits with 1 when any check fails.
 */
import { parseArgs } from "node:util";
import { chromium, type Browser, type Page } from "playwright-core";
import { site } from "../src/config/site.ts";

const { values } = parseArgs({ options: { chrome: { type: "string" }, url: { type: "string" } } });
if (!values.chrome) throw new Error("Missing --chrome <path to a Chrome or Chromium binary>");
if (!values.url) throw new Error("Missing --url <origin of the served build>");
const BASE = values.url.replace(/\/$/, "");
const ROUTES = ["/features/", "/meme-radar/", "/safety/"];
const WIDTHS = [390, 768, 1024, 1440];
const BUILT = new Set(["/", ...ROUTES]);

let failures = 0;
const check = (ok: boolean, label: string, detail = "") => {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
};

async function open(browser: Browser, path: string, width: number, reduced = false) {
  const context = await browser.newContext({
    viewport: { width, height: width < 600 ? 844 : 900 },
    reducedMotion: reduced ? "reduce" : "no-preference",
    isMobile: width < 600,
    hasTouch: width < 600,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  const failed: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) failed.push(`${response.status()} ${new URL(response.url()).pathname}`);
  });
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return { context, page, errors, failed };
}

/** Waits until smooth scrolling has stopped: three equal readings 250 ms apart. */
const settle = async (page: Page) => {
  for (let last = -1, quiet = 0; quiet < 3; ) {
    await page.waitForTimeout(250);
    const now = await page.evaluate(() => window.scrollY);
    quiet = now === last ? quiet + 1 : 0;
    last = now;
  }
};

const scrollTo = async (page: Page, y: number, wait = 200) => {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(wait);
};

/** Requests that may 404: prefetches of routes the sibling branch builds. */
const expected404 = (entry: string) => {
  const path = entry.replace(/^404 /, "").replace(/index\.txt$/, "");
  return entry.startsWith("404 ") && site.routes.some((route) => route.path === path) && !BUILT.has(path);
};

async function layoutChecks(browser: Browser) {
  for (const route of ROUTES) {
    for (const width of WIDTHS) {
      for (const reduced of [false, true]) {
        const tag = `${route} ${width}px ${reduced ? "reduced-motion" : "motion"}`;
        const { context, page, errors, failed } = await open(browser, route, width, reduced);
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        const step = Math.round((width < 600 ? 844 : 900) * 0.5);
        const overflow = new Set<string>();
        const moved = new Set<string>();
        const transformed = new Set<string>();
        let previous: Record<string, string> = {};
        for (let y = 0; y < total; y += step) {
          await scrollTo(page, y, 160);
          const result = await page.evaluate(() => {
            const view = document.documentElement.clientWidth;
            const wide: string[] = [];
            if (document.documentElement.scrollWidth > view) {
              for (const element of document.querySelectorAll<HTMLElement>("main *, footer *, header *")) {
                const rect = element.getBoundingClientRect();
                if (rect.width > 0 && rect.right > view + 1) {
                  let clipped = false;
                  for (let parent = element.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
                    const style = getComputedStyle(parent);
                    if (style.overflowX !== "visible") {
                      clipped = true;
                      break;
                    }
                  }
                  if (!clipped) wide.push(`${element.tagName.toLowerCase()}.${String(element.className).slice(0, 60)}`);
                }
              }
              wide.unshift(`scrollWidth ${document.documentElement.scrollWidth} > ${view}`);
            }
            const transforms: Record<string, string> = {};
            const inline: string[] = [];
            /* <Reveal> entrances are not scroll-linked; an unrevealed one still holds its start offset. */
            document.querySelectorAll<HTMLElement>("main [style*='transform']:not([data-reveal])").forEach((element, index) => {
              const value = getComputedStyle(element).transform;
              transforms[index] = value;
              if (value !== "none" && value !== "matrix(1, 0, 0, 1, 0, 0)") {
                inline.push(`${element.tagName.toLowerCase()}.${String(element.className).slice(0, 50)} ${value}`);
              }
            });
            return { wide, transforms, inline };
          });
          result.wide.forEach((entry) => overflow.add(entry));
          result.inline.forEach((entry) => transformed.add(entry));
          for (const [key, value] of Object.entries(result.transforms)) {
            if (previous[key] !== undefined && previous[key] !== value) moved.add(key);
          }
          previous = result.transforms;
        }
        check(overflow.size === 0, `${tag}: no horizontal overflow`, [...overflow].slice(0, 6).join(" | "));
        if (reduced) {
          check(transformed.size === 0, `${tag}: no scroll transforms`, [...transformed].slice(0, 4).join(" | "));
        } else {
          check(moved.size > 0, `${tag}: scroll-linked layers move`, `${moved.size} layers changed`);
        }

        await scrollTo(page, 0, 300);
        const facts = await page.evaluate(() => ({
          h1: document.querySelectorAll("h1").length,
          broken: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc),
          title: document.title,
          description: document.querySelector("meta[name=description]")?.getAttribute("content") ?? "",
          canonical: document.querySelector("link[rel=canonical]")?.getAttribute("href") ?? "",
        }));
        check(facts.h1 === 1, `${tag}: exactly one h1`, String(facts.h1));
        check(facts.broken.length === 0, `${tag}: no broken images`, facts.broken.join(", "));
        const routeConfig = site.routes.find((entry) => entry.path === route)!;
        check(
          facts.title === routeConfig.title && facts.description === routeConfig.description && facts.canonical === `${site.url}${route}`,
          `${tag}: title, description and canonical from config`,
          facts.title,
        );
        const unexpected = failed.filter((entry) => !expected404(entry));
        const realErrors = errors.filter((entry) => !/Failed to load resource.*404/.test(entry));
        check(unexpected.length === 0, `${tag}: no failed requests`, unexpected.join(", "));
        check(realErrors.length === 0, `${tag}: no console errors`, realErrors.join(" | "));

        if (!reduced && (width === 390 || width === 768)) {
          for (let y = 0; y < total; y += step) await scrollTo(page, y, 60);
          const small = await page.evaluate(() => {
            const out: string[] = [];
            for (const element of document.querySelectorAll<HTMLElement>("main a, main button, nav a, nav button, footer a, header a, header button")) {
              const rect = element.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) continue;
              const style = getComputedStyle(element);
              if (style.visibility === "hidden" || style.display === "none") continue;
              if (rect.height < 44) out.push(`${Math.round(rect.width)}x${Math.round(rect.height)} "${(element.textContent ?? "").trim().slice(0, 40)}"`);
            }
            return out;
          });
          check(small.length === 0, `${tag}: tap targets at least 44px tall`, small.join(" | "));
        }
        if (!reduced && width === 390) {
          const smallText = await page.evaluate(() => {
            const sizes: Record<string, string[]> = {};
            const walker = document.createTreeWalker(document.querySelector("main")!, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
              const text = walker.currentNode.textContent?.trim() ?? "";
              const parent = walker.currentNode.parentElement;
              if (!text || !parent) continue;
              const style = getComputedStyle(parent);
              if (style.display === "none" || parent.closest(".sr-only")) continue;
              const size = Number.parseFloat(style.fontSize);
              if (size < 16) (sizes[size] ??= []).push(text.slice(0, 48));
            }
            return sizes;
          });
          console.log(`INFO  ${tag}: text under 16px (captions, labels and recreated bot messages):`);
          for (const [size, samples] of Object.entries(smallText)) {
            console.log(`        ${size}px ×${samples.length}: ${[...new Set(samples)].slice(0, 12).join(" ¦ ")}`);
          }
        }
        await context.close();
      }
    }
  }
}

async function referralChecks(browser: Browser) {
  const bot = site.links.telegramBot;
  const cases: { label: string; query: string; expected: string }[] = [
    { label: "valid ABC123", query: "?ref=ABC123", expected: `${bot}?start=ref_ABC123` },
    { label: "valid, 3 characters", query: "?ref=a1B", expected: `${bot}?start=ref_a1B` },
    { label: "valid, 20 characters", query: "?ref=ABCDEFGHIJ0123456789", expected: `${bot}?start=ref_ABCDEFGHIJ0123456789` },
    { label: "too short", query: "?ref=AB", expected: bot },
    { label: "too long", query: "?ref=ABCDEFGHIJ01234567890", expected: bot },
    { label: "not alphanumeric", query: "?ref=AB-12%3Cx", expected: bot },
    { label: "empty", query: "?ref=", expected: bot },
    { label: "missing", query: "", expected: bot },
  ];
  for (const route of ROUTES) {
    for (const width of [1440, 390]) {
      for (const entry of cases) {
        const { context, page } = await open(browser, `${route}${entry.query}`, width);
        const links = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLAnchorElement>("a")]
            .filter((anchor) => /t\.me|telegram\.me/.test(anchor.href))
            .map((anchor) => ({ href: anchor.href, cta: anchor.dataset.cta ?? "", where: anchor.dataset.ctaLocation ?? "" })),
        );
        const wrong = links.filter((link) => link.href !== entry.expected || link.cta !== "telegram");
        check(
          links.length >= 3 && wrong.length === 0,
          `${route} ${width}px referral ${entry.label}: ${links.length} Telegram links → ${entry.expected}`,
          wrong.length > 0 ? JSON.stringify(wrong) : links.map((link) => link.where).join(", "),
        );
        await context.close();
      }
    }
  }
  /* The code is kept for the session: land on one page with it, move to another without it. */
  const { context, page } = await open(browser, "/safety/?ref=ABC123", 1440);
  await page.goto(`${BASE}/features/`, { waitUntil: "networkidle" });
  const kept = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLAnchorElement>("a[data-cta=telegram]")].every((anchor) => anchor.href.endsWith("?start=ref_ABC123")),
  );
  check(kept, "referral code carries from /safety/ to /features/ in the same session");
  await context.close();
}

async function keyboardChecks(browser: Browser) {
  for (const route of ROUTES) {
    const { context, page } = await open(browser, route, 1440);
    await page.keyboard.press("Tab");
    const first = await page.evaluate(() => ({
      text: document.activeElement?.textContent?.trim() ?? "",
      visible: (() => {
        const rect = document.activeElement?.getBoundingClientRect();
        return !!rect && rect.width > 0 && rect.top >= 0;
      })(),
    }));
    check(first.text === "Skip to content" && first.visible, `${route} keyboard: first Tab shows the skip link`, first.text);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);
    const afterSkip = await page.evaluate(() => ({ hash: location.hash, active: document.activeElement?.id ?? "" }));
    check(afterSkip.hash !== "" , `${route} keyboard: skip link jumps to ${afterSkip.hash}`, `focus on #${afterSkip.active}`);

    /* Tab on from the skip target: every stop must show a focus ring. */
    const stops: string[] = [];
    let ringless = 0;
    for (let index = 0; index < 14; index += 1) {
      await page.keyboard.press("Tab");
      const stop = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null;
        if (!element || element === document.body) return null;
        const style = getComputedStyle(element);
        return {
          name: (element.textContent ?? "").trim().slice(0, 28) || element.getAttribute("aria-label") || element.tagName,
          ring: style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) >= 2,
          inMain: !!element.closest("main"),
        };
      });
      if (!stop) continue;
      stops.push(stop.name);
      if (!stop.ring) ringless += 1;
    }
    check(stops.length >= 8 && ringless === 0, `${route} keyboard: Tab stops all show a focus ring`, stops.join(" → "));

    /* In-page nav: focus a link, press Enter, the section is at the top and marked current. */
    const navLinks = page.locator("main nav a, nav[aria-label='On this page'] a, nav[aria-label='Feature categories'] a");
    const count = await navLinks.count();
    check(count >= 4, `${route} keyboard: in-page nav has ${count} links`);
    const target = navLinks.nth(Math.min(2, count - 1));
    const href = await target.getAttribute("href");
    /* The Tab presses above start smooth focus scrolls; let them finish, as a person would. */
    await settle(page);
    await target.focus();
    await page.keyboard.press("Enter");
    await settle(page);
    const landed = await page.evaluate((hash) => {
      const section = document.querySelector(hash!);
      const link = document.querySelector(`a[href="${hash}"][aria-current="location"]`);
      return { top: section ? Math.round(section.getBoundingClientRect().top) : null, current: !!link, hash: location.hash };
    }, href);
    check(
      landed.hash === href && landed.top !== null && landed.top >= 0 && landed.top < 200 && landed.current,
      `${route} keyboard: Enter on the in-page link goes to ${href} and marks it current`,
      JSON.stringify(landed),
    );
    await scrollTo(page, 0, 500);
    const cleared = await page.evaluate(() => document.querySelectorAll("a[aria-current='location']").length);
    check(cleared === 0, `${route}: no in-page link is marked current at the top of the page`, String(cleared));
    await context.close();
  }

  /* Accordion on /meme-radar/. */
  const { context, page } = await open(browser, "/meme-radar/", 1440);
  const triggers = page.locator("#questions button[aria-expanded]");
  const total = await triggers.count();
  check(total >= 5, `/meme-radar/ accordion: ${total} questions`);
  await triggers.nth(1).focus();
  const before = await triggers.nth(1).getAttribute("aria-expanded");
  await page.keyboard.press("Enter");
  const opened = await triggers.nth(1).getAttribute("aria-expanded");
  await page.keyboard.press("Space");
  const closed = await triggers.nth(1).getAttribute("aria-expanded");
  check(before === "false" && opened === "true" && closed === "false", "/meme-radar/ accordion: Enter opens, Space closes", `${before} → ${opened} → ${closed}`);
  await page.keyboard.press("ArrowDown");
  const down = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.keyboard.press("End");
  const end = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.keyboard.press("Home");
  const home = await page.evaluate(() => document.activeElement?.textContent?.trim());
  const texts = await triggers.allTextContents();
  check(
    down === texts[2]?.trim() && end === texts[total - 1]?.trim() && home === texts[0]?.trim(),
    "/meme-radar/ accordion: ArrowDown, End and Home move between questions",
    `${down} | ${end} | ${home}`,
  );
  const answersInHtml = await page.evaluate(() => document.querySelectorAll("#questions [role=region] p").length);
  check(answersInHtml === total, "/meme-radar/ accordion: every answer is in the page HTML", String(answersInHtml));
  await context.close();

  /* The swipe row of preview screens can be reached and scrolled from the keyboard on a phone. */
  const phone = await open(browser, "/meme-radar/", 390);
  const row = phone.page.locator("#screens ol");
  await row.focus();
  const startLeft = await row.evaluate((element) => element.scrollLeft);
  await phone.page.keyboard.press("ArrowRight");
  await phone.page.keyboard.press("ArrowRight");
  await phone.page.waitForTimeout(500);
  const endLeft = await row.evaluate((element) => element.scrollLeft);
  check(endLeft > startLeft, "/meme-radar/ 390px: the preview screens row scrolls from the keyboard", `${startLeft} → ${endLeft}`);
  await phone.context.close();
}

async function contentChecks(browser: Browser) {
  /* Every feature link in the config lands on a real element. */
  for (const route of ROUTES) {
    const { context, page } = await open(browser, route, 1440);
    const ids = new Set(await page.evaluate(() => [...document.querySelectorAll("[id]")].map((element) => element.id)));
    const wanted = site.features.filter((feature) => feature.href.startsWith(`${route}#`)).map((feature) => feature.href.split("#")[1]!);
    const missing = wanted.filter((id) => !ids.has(id));
    check(missing.length === 0, `${route}: ${wanted.length} feature anchors from the config exist`, missing.join(", "));
    const hashes = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>("main a[href*='#']")].map((anchor) => anchor.getAttribute("href")!),
    );
    const sameTarget = hashes.filter((href) => href.startsWith("#") || href.startsWith(`${route}#`));
    const dead = sameTarget.filter((href) => !ids.has(href.split("#")[1]!));
    check(dead.length === 0, `${route}: ${sameTarget.length} in-page links resolve`, dead.join(", "));

    const text = await page.evaluate(() => document.querySelector("main")!.innerText);
    const live = [...text.matchAll(/[^.\n]{0,40}\blive\b[^.\n]{0,30}/gi)].map((match) => match[0].trim());
    console.log(`INFO  ${route}: uses of the word "live": ${[...new Set(live)].join(" ¦ ") || "none"}`);
    await context.close();
  }

  /* Cross-page hash links used by these routes. */
  for (const href of ["/safety/#limits", "/meme-radar/#limits", "/safety/#checks", "/meme-radar/#workflow", "/features/#copy-trade"]) {
    const [path, id] = href.split("#");
    const { context, page } = await open(browser, href, 1440);
    await page.waitForTimeout(900);
    const top = await page.evaluate((target) => document.getElementById(target!)?.getBoundingClientRect().top ?? null, id);
    check(top !== null && top >= 0 && top < 320, `${path}#${id} opens at its target`, `top ${top === null ? "missing" : Math.round(top)}px`);
    await context.close();
  }

  /* Status wording on the Meme Radar page. */
  const radar = await open(browser, "/meme-radar/", 1440);
  const radarText = await radar.page.evaluate(() => document.querySelector("main")!.innerText);
  const radarStatus = site.features.find((feature) => feature.id === "meme-radar")!.status;
  check(radarStatus === "in_development", "config: Meme Radar is in_development");
  check(/in development/i.test(radarText) && /preview/i.test(radarText) && /demo/i.test(radarText), "/meme-radar/: labelled In development, Preview and Demo");
  const previews = await radar.page.evaluate(() => ({
    phones: document.querySelectorAll("main [data-phone]").length,
    preview: document.querySelectorAll("main [data-phone=preview]").length,
  }));
  check(previews.phones === previews.preview && previews.phones >= 4, "/meme-radar/: every phone uses the preview treatment", JSON.stringify(previews));
  await radar.context.close();

  /* Feature statuses rendered on /features/ match the config. */
  const features = await open(browser, "/features/", 1440);
  const rendered = await features.page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll<HTMLElement>("main article[id]")].map((article) => [
        article.id,
        article.querySelector<HTMLElement>("[data-status]")?.dataset.status ?? "",
      ]),
    ),
  );
  const shown = site.features.filter((feature) => site.roadmap.showPlanned || feature.status !== "planned");
  const mismatched = shown.filter((feature) => rendered[feature.id] !== feature.status).map((feature) => feature.id);
  check(
    Object.keys(rendered).length === shown.length && mismatched.length === 0,
    `/features/: ${shown.length} features rendered, each with its config status`,
    mismatched.join(", "),
  );
  await features.context.close();
}

const browser = await chromium.launch({ executablePath: values.chrome, args: ["--no-sandbox"] });
try {
  await layoutChecks(browser);
  await referralChecks(browser);
  await keyboardChecks(browser);
  await contentChecks(browser);
} finally {
  await browser.close();
}
console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
