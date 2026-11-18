/**
 * Builds everything in `public/` from the Ripjaw website kit.
 *
 *   npm run assets -- --kit <path to ripjaw-website-kit> --chrome <path to Chrome>
 *
 * The outputs are committed, so this only needs re-running when the kit, the
 * asset registry (`src/lib/assets.ts`) or the words on the social card change.
 *
 * The site uses two kit screenshots cropped to the chat and one kit phone
 * mockup, plus the kit's logo and favicons. The social card is rebuilt from
 * the kit logo, palette and type with the site's own wording, instead of
 * copying the kit's card.
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

type Recipe = {
  file: string;
  extract?: { left: number; top: number; width: number; height: number };
  /**
   * The kit's phone mockups sit in a soft purple glow. The site shows no
   * glows, so everything that is not the solid device is made transparent.
   */
  removeGlow?: boolean;
};

const recipes: Record<AssetKey, Recipe> = {
  chatHomeMenu: { file: "mockups/png/01-home-menu.png", extract: { left: 0, top: 800, width: 920, height: 1290 } },
  chatSafetyCheck: { file: "mockups/png/05-safety-check.png" },
  phoneSafetyCheck: {
    file: "mockups/phone/05-safety-check-phone.png",
    extract: { left: 250, top: 260, width: 860, height: 1800 },
    removeGlow: true,
  },
};

/** The glow never exceeds this opacity (out of 255); the device is fully opaque. */
const GLOW_MAX_ALPHA = 80;

/** Makes the glow transparent and keeps the device's anti-aliased edge. Fails if the result is not a clean cut-out. */
async function withoutGlow(input: Buffer, name: string): Promise<Buffer> {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let solid = 0;
  for (let i = 3; i < data.length; i += 4) {
    const alpha = data[i]!;
    data[i] = alpha <= GLOW_MAX_ALPHA ? 0 : Math.round(((alpha - GLOW_MAX_ALPHA) / (255 - GLOW_MAX_ALPHA)) * 255);
    if (data[i] === 255) solid += 1;
  }
  const pixels = info.width * info.height;
  if (solid < pixels * 0.9) throw new Error(`${name}: only ${Math.round((solid / pixels) * 100)}% of the crop is the device`);
  const corner = data[3]!;
  if (corner !== 0) throw new Error(`${name}: the corner outside the device is not transparent`);
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function writeVariants(asset: RasterAsset, input: Buffer): Promise<void> {
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
    await resized.clone().avif({ quality: 56, effort: 6 }).toFile(`${out}.avif`);
    await resized.clone().webp({ quality: 78, effort: 6 }).toFile(`${out}.webp`);
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
  const [first, ...rest] = site.tagline.split(". ");
  if (!first || rest.length !== 1) throw new Error("og card: tagline must be two sentences");
  return `<!doctype html><html><head><style>
@font-face{font-family:"Space Grotesk";font-weight:300 700;src:url(${font("space-grotesk")})}
@font-face{font-family:"Inter";font-weight:100 900;src:url(${font("inter")})}
@font-face{font-family:"JetBrains Mono";font-weight:100 800;src:url(${font("jetbrains-mono")})}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#0B0C10;color:#F5F6FA;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.content{height:100%;padding:72px 88px;display:flex;flex-direction:column}
.logo{height:56px;align-self:flex-start}
h1{font-family:"Space Grotesk",sans-serif;font-weight:600;font-size:112px;line-height:1.02;letter-spacing:-0.035em;margin-top:64px}
.grad{background:linear-gradient(90deg,#9945FF 0%,#4F7BFF 50%,#14F195 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
p{font-size:32px;line-height:1.35;color:#A7ADC0;margin-top:36px}
.stage{font-family:"JetBrains Mono",monospace;font-size:20px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:#858BA1;margin-top:auto;padding-top:24px;border-top:1px solid rgba(255,255,255,.14)}
</style></head><body><div class="content">
<img class="logo" src="${lockup}" alt="">
<h1>${first}.<br><span class="grad">${rest[0]}</span></h1>
<p>${site.productLine}</p>
<div class="stage">${site.stage.label}</div>
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
};

rmSync(publicDir, { recursive: true, force: true });
for (const [from, to] of Object.entries(STATIC_FILES)) {
  const target = join(publicDir, to);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(join(kit, from), target);
}

for (const key of Object.keys(assets) as AssetKey[]) {
  const recipe = recipes[key];
  const asset = assets[key];
  const pipeline = sharp(join(kit, recipe.file));
  const cropped = await (recipe.extract ? pipeline.extract(recipe.extract) : pipeline).png().toBuffer();
  const input = recipe.removeGlow ? await withoutGlow(cropped, asset.base) : cropped;
  await writeVariants(asset, input);
  console.log("ok", asset.base);
}

const browser = await chromium.launch({
  executablePath: args.chrome,
  args: ["--no-sandbox", "--font-render-hinting=none"],
});
try {
  await renderOgCard(browser);
  console.log("ok", site.seo.ogImage.path);
} finally {
  await browser.close();
}
