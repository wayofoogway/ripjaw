/**
 * Builds everything in `public/` from the Ripjaw website kit.
 *
 *   npm run assets -- --kit <path to ripjaw-website-kit> --chrome <path to Chrome>
 *
 * The outputs are committed, so this only needs re-running when the kit, the
 * asset registry (`src/lib/assets.ts`) or `site.demo.sampleHandle` changes.
 *
 * Three kit mockups are re-rendered from the kit's own HTML sources instead of
 * being copied:
 *  - the snipe-confirm and lock-screen phones, with the real person's handle
 *    replaced by `site.demo.sampleHandle`;
 *  - the lock screen also loses its second notification, which showed a
 *    completed purchase and an unverified per-trade fee;
 *  - a second home-menu phone anchored to the top of the chat, so the wallet
 *    lines are visible.
 * The social card is rebuilt from the kit logo, palette and type with
 * beta-accurate wording.
 */
import { cpSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { chromium, type Browser } from "playwright-core";
import sharp from "sharp";
import { site } from "../src/config/site.ts";
import { assets, type AssetKey, type RasterAsset } from "../src/lib/assets.ts";

const root = resolve(import.meta.dirname, "..");
const publicDir = join(root, "public");

const { values: args } = parseArgs({
  options: { kit: { type: "string" }, chrome: { type: "string" } },
});
if (!args.kit) throw new Error("Missing --kit <path to ripjaw-website-kit>");
if (!args.chrome) throw new Error("Missing --chrome <path to a Chrome or Chromium binary>");
const kit = resolve(args.kit);

const REAL_HANDLE = "@elonmusk";
const PHONE_STAGE = { width: 680, height: 1160 };

type Recipe =
  | { from: "kit"; file: string; extract?: { left: number; top: number; width: number; height: number } }
  | { from: "render"; html: () => string };

function replaceExactly(source: string, search: string | RegExp, replacement: string, times: number, label: string): string {
  const pattern = typeof search === "string" ? new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g") : search;
  const found = source.match(pattern)?.length ?? 0;
  if (found !== times) {
    throw new Error(`${label}: expected ${times} occurrence(s) of ${String(search)}, found ${found}`);
  }
  return source.replace(pattern, replacement);
}

function kitHtml(name: string): string {
  return readFileSync(join(kit, "mockups/src", name), "utf8");
}

function withSampleHandle(html: string, label: string): string {
  const out = replaceExactly(html, REAL_HANDLE, site.demo.sampleHandle, 1, label);
  if (out.includes("elonmusk")) throw new Error(`${label}: real handle still present`);
  return out;
}

const recipes: Record<AssetKey, Recipe> = {
  heroBgDesktop: { from: "kit", file: "images/hero-bg-desktop.jpg" },
  heroBgMobile: { from: "kit", file: "images/hero-bg-mobile.jpg" },
  memeRadarConcept: { from: "kit", file: "images/meme-radar-concept.jpg" },
  safetyShieldConcept: { from: "kit", file: "images/safety-shield-concept.jpg" },
  speedOneTapConcept: { from: "kit", file: "images/speed-one-tap-concept.jpg" },

  phoneHomeMenu: { from: "kit", file: "mockups/phone/01-home-menu-phone.png" },
  phoneSafetyCheck: { from: "kit", file: "mockups/phone/05-safety-check-phone.png" },
  phoneHomeWallet: {
    from: "render",
    html: () =>
      replaceExactly(
        kitHtml("01-home-menu-phone.html"),
        ".scr .chat{justify-content:flex-end;",
        ".scr .chat{justify-content:flex-start;",
        1,
        "home-wallet phone",
      ),
  },
  phoneSnipeConfirm: {
    from: "render",
    html: () => withSampleHandle(kitHtml("03-snipe-confirm-phone.html"), "snipe-confirm phone"),
  },
  phoneLockscreenAlert: {
    from: "render",
    html: () =>
      replaceExactly(
        withSampleHandle(kitHtml("00-lockscreen-alert-phone.html"), "lockscreen phone"),
        /<div class=n>(?:(?!<div class=n>)[\s\S])*?Bought \$DOGE[\s\S]*?<\/div><\/div><\/div>\s*/g,
        "",
        1,
        "lockscreen phone purchase notification",
      ),
  },

  chatHomeMenu: { from: "kit", file: "mockups/png/01-home-menu.png", extract: { left: 0, top: 800, width: 920, height: 1290 } },
  chatHomeWallet: { from: "kit", file: "mockups/png/01-home-menu.png", extract: { left: 0, top: 0, width: 920, height: 830 } },
  chatSafetyCheck: { from: "kit", file: "mockups/png/05-safety-check.png" },
  chatSettings: { from: "kit", file: "mockups/png/09-settings-hub.png", extract: { left: 0, top: 720, width: 920, height: 1368 } },
};

async function renderPhone(browser: Browser, html: string): Promise<Buffer> {
  const page = await browser.newPage({ viewport: PHONE_STAGE, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const shot = await page.locator("#shot").first().screenshot({ omitBackground: true });
  await page.close();
  return shot;
}

async function writeVariants(asset: RasterAsset, input: Buffer, hasAlpha: boolean): Promise<void> {
  const largest = asset.widths[asset.widths.length - 1];
  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) throw new Error(`${asset.base}: unreadable image`);
  if (meta.width < largest!) throw new Error(`${asset.base}: source is ${meta.width}px wide, registry asks for ${largest}px`);
  const expectedHeight = Math.round((meta.height / meta.width) * asset.width);
  if (Math.abs(expectedHeight - asset.height) > 1) {
    throw new Error(`${asset.base}: registry height ${asset.height} does not match source ratio (${expectedHeight})`);
  }
  for (const width of asset.widths) {
    const out = join(publicDir, `${asset.base}-${width}`);
    mkdirSync(dirname(out), { recursive: true });
    const resized = sharp(input).resize({ width });
    await resized.clone().avif({ quality: hasAlpha ? 62 : 56, effort: 6 }).toFile(`${out}.avif`);
    await resized.clone().webp({ quality: hasAlpha ? 84 : 78, effort: 6 }).toFile(`${out}.webp`);
  }
}

function dataUri(path: string, mime: string): string {
  return `data:${mime};base64,${readFileSync(path).toString("base64")}`;
}

function ogCardHtml(): string {
  const font = (family: string) =>
    dataUri(
      join(root, "node_modules/@fontsource-variable", family, "files", `${family}-latin-wght-normal.woff2`),
      "font/woff2",
    );
  const lockup = dataUri(join(kit, "brand/logo/ripjaw-lockup-horizontal.svg"), "image/svg+xml");
  const background = dataUri(join(kit, "images/hero-bg-desktop.jpg"), "image/jpeg");
  const [first, ...rest] = site.tagline.split(". ");
  if (!first || rest.length !== 1) throw new Error("og card: tagline must be two sentences");
  return `<!doctype html><html><head><style>
@font-face{font-family:"Space Grotesk";font-weight:300 700;src:url(${font("space-grotesk")})}
@font-face{font-family:"Inter";font-weight:100 900;src:url(${font("inter")})}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#0B0C10;color:#F5F6FA;font-family:Inter,sans-serif;position:relative;overflow:hidden;-webkit-font-smoothing:antialiased}
.bg{position:absolute;inset:0;background:url(${background}) right center/cover}
.scrim{position:absolute;inset:0;background:linear-gradient(90deg,#0B0C10 0%,rgba(11,12,16,.94) 38%,rgba(11,12,16,.25) 72%,rgba(11,12,16,.1) 100%)}
.content{position:absolute;inset:0;padding:72px 80px;display:flex;flex-direction:column}
.logo{height:72px;align-self:flex-start}
h1{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:104px;line-height:1;letter-spacing:-0.035em;margin-top:56px}
.grad{background:linear-gradient(90deg,#9945FF 0%,#4F7BFF 50%,#14F195 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
p{font-size:30px;line-height:1.35;color:#A7ADC0;margin-top:32px;max-width:620px}
.pills{display:flex;gap:14px;margin-top:auto}
.pill{font-size:21px;font-weight:500;padding:11px 22px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(18,20,27,.72)}
.pill.beta{border-color:rgba(153,69,255,.6);color:#D9C2FF;letter-spacing:.04em}
</style></head><body><div class="bg"></div><div class="scrim"></div><div class="content">
<img class="logo" src="${lockup}" alt="">
<h1>${first}.<br><span class="grad">${rest[0]}</span></h1>
<p>${site.productLine}</p>
<div class="pills"><span class="pill beta">${site.beta.stageLabel}</span><span class="pill">${site.access.priceLabel} one-time access</span></div>
</div></body></html>`;
}

async function renderOgCard(browser: Browser): Promise<void> {
  const { path, width, height } = site.seo.ogImage;
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(ogCardHtml(), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const shot = await page.screenshot();
  await page.close();
  await sharp(shot).png({ compressionLevel: 9, palette: false }).toFile(join(publicDir, path));
}

const STATIC_FILES: Record<string, string> = {
  "brand/favicon/favicon.ico": "favicon.ico",
  "brand/favicon/favicon.svg": "favicon.svg",
  "brand/favicon/favicon-16.png": "favicon-16.png",
  "brand/favicon/favicon-32.png": "favicon-32.png",
  "brand/favicon/favicon-180.png": "favicon-180.png",
  "brand/favicon/favicon-192.png": "favicon-192.png",
  "brand/favicon/favicon-512.png": "favicon-512.png",
  "brand/favicon/site.webmanifest": "site.webmanifest",
  "brand/logo/ripjaw-lockup-horizontal.svg": "brand/ripjaw-lockup-horizontal.svg",
  "brand/logo/ripjaw-mark-gradient.svg": "brand/ripjaw-mark-gradient.svg",
};

rmSync(publicDir, { recursive: true, force: true });
for (const [from, to] of Object.entries(STATIC_FILES)) {
  const target = join(publicDir, to);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(join(kit, from), target);
}

const browser = await chromium.launch({
  executablePath: args.chrome,
  args: ["--no-sandbox", "--font-render-hinting=none"],
});
try {
  for (const key of Object.keys(assets) as AssetKey[]) {
    const recipe = recipes[key];
    const asset = assets[key];
    let input: Buffer;
    if (recipe.from === "render") {
      input = await renderPhone(browser, recipe.html());
    } else {
      const pipeline = sharp(join(kit, recipe.file));
      input = await (recipe.extract ? pipeline.extract(recipe.extract) : pipeline).png().toBuffer();
    }
    const { hasAlpha } = await sharp(input).metadata();
    await writeVariants(asset, input, Boolean(hasAlpha));
    console.log("ok", asset.base);
  }
  await renderOgCard(browser);
  console.log("ok", site.seo.ogImage.path);
} finally {
  await browser.close();
}
