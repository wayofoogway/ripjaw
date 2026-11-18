/**
 * Registry of every raster asset the site serves. `scripts/build-assets.ts`
 * generates `<base>-<width>.avif` and `.webp` for each entry from the kit and
 * fails when an entry has no recipe, so this file and `public/` cannot drift.
 */
export type RasterAsset = {
  /** Public path without the `-<width>.<format>` suffix. */
  readonly base: string;
  /** Generated widths in CSS-independent pixels, ascending. */
  readonly widths: readonly [number, ...number[]];
  /** Intrinsic size of the largest variant, used to reserve layout space. */
  readonly width: number;
  readonly height: number;
};

/**
 * The product visuals: two frameless crops of the Ripjaw chat in Telegram,
 * and the kit's phone mockup of the Safety Check for the home page.
 */
export const assets = {
  chatHomeMenu: { base: "/mockups/chat-home-menu", widths: [460, 920], width: 920, height: 1290 },
  chatSafetyCheck: { base: "/mockups/chat-safety-check", widths: [460, 920], width: 920, height: 1406 },
  phoneSafetyCheck: { base: "/mockups/phone-safety-check", widths: [300, 600, 860], width: 860, height: 1800 },
} as const satisfies Record<string, RasterAsset>;

export type AssetKey = keyof typeof assets;
