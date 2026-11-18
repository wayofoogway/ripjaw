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

/** A raster asset drawn inside the kit's 680x1160 phone stage. */
export type PhoneAsset = RasterAsset & { readonly kind: "phone" };

const phone = (name: string): PhoneAsset => ({
  kind: "phone",
  base: `/mockups/phone-${name}`,
  widths: [480, 800, 1200],
  width: 1200,
  height: 2047,
});

export const assets = {
  heroBgDesktop: { base: "/images/hero-bg-desktop", widths: [960, 1280], width: 1280, height: 720 },
  heroBgMobile: { base: "/images/hero-bg-mobile", widths: [480, 720], width: 720, height: 1280 },
  memeRadarConcept: { base: "/images/meme-radar-concept", widths: [800, 1280], width: 1280, height: 720 },
  safetyShieldConcept: { base: "/images/safety-shield-concept", widths: [640, 1152], width: 1152, height: 864 },
  speedOneTapConcept: { base: "/images/speed-one-tap-concept", widths: [800, 1280], width: 1280, height: 720 },
  copyTradeNetwork: { base: "/images/copy-trade-network", widths: [800, 1280], width: 1280, height: 720 },
  pushAlertsConcept: { base: "/images/push-alerts-concept", widths: [640, 1152], width: 1152, height: 864 },

  phoneHomeMenu: phone("home-menu"),
  phoneHomeWallet: phone("home-wallet"),
  phoneSafetyCheck: phone("safety-check"),
  phoneLockscreenAlert: phone("lockscreen-alert"),
  phoneSnipeConfirm: phone("snipe-confirm"),
  phoneRadarAlert: phone("radar-alert"),

  chatHomeMenu: { base: "/mockups/chat-home-menu", widths: [460, 920], width: 920, height: 1290 },
  chatHomeWallet: { base: "/mockups/chat-home-wallet", widths: [460, 920], width: 920, height: 830 },
  chatSafetyCheck: { base: "/mockups/chat-safety-check", widths: [460, 920], width: 920, height: 1406 },
  chatSettings: { base: "/mockups/chat-settings", widths: [460, 920], width: 920, height: 1368 },
} as const satisfies Record<string, RasterAsset>;

export type AssetKey = keyof typeof assets;
