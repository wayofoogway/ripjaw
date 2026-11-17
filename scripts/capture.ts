/**
 * Screenshots a page in real Chrome, for checking work at the brief's viewport widths.
 *
 *   npm run capture -- --chrome <path> --url http://localhost:3000/ --out shot.png \
 *     [--width 1440] [--height 900] [--full] [--scroll <px>] [--reduced-motion] [--scale 1]
 *
 * `--full` scrolls through the page first so scroll reveals have played, then
 * captures the whole document. `--scroll` captures one viewport at that offset.
 */
import { parseArgs } from "node:util";
import { chromium } from "playwright-core";

const { values } = parseArgs({
  options: {
    chrome: { type: "string" },
    url: { type: "string" },
    out: { type: "string" },
    width: { type: "string", default: "1440" },
    height: { type: "string", default: "900" },
    scale: { type: "string", default: "1" },
    scroll: { type: "string", default: "0" },
    full: { type: "boolean", default: false },
    "reduced-motion": { type: "boolean", default: false },
  },
});
if (!values.chrome) throw new Error("Missing --chrome <path to a Chrome or Chromium binary>");
if (!values.url) throw new Error("Missing --url");
if (!values.out) throw new Error("Missing --out <file.png>");

const width = Number(values.width);
const height = Number(values.height);
const browser = await chromium.launch({ executablePath: values.chrome, args: ["--no-sandbox"] });
try {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: Number(values.scale),
    reducedMotion: values["reduced-motion"] ? "reduce" : "no-preference",
    isMobile: width < 600,
    hasTouch: width < 600,
  });
  const page = await context.newPage();
  await page.goto(values.url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  const scrollTo = async (y: number) => {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(350);
  };

  if (values.full) {
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(height * 0.6)) await scrollTo(y);
    await scrollTo(0);
    await page.waitForTimeout(600);
    await page.screenshot({ path: values.out, fullPage: true });
  } else {
    await scrollTo(Number(values.scroll));
    await page.waitForTimeout(900);
    await page.screenshot({ path: values.out });
  }
  console.log("saved", values.out);
} finally {
  await browser.close();
}
