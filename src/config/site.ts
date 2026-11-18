import "server-only";

/**
 * Owner-editable source of truth for ripjaw.io.
 *
 * Everything a visitor can read about availability, price, fees, referrals,
 * links, legal status and navigation comes from this file. Edit a value here
 * and every page that shows it follows.
 *
 * This module is server-only: client components receive what they need as
 * props, so values marked `pendingVerification` never reach the browser
 * unless a page deliberately renders them.
 *
 * `validateSiteConfig()` runs when the module loads. A missing or malformed
 * required value throws and fails the build; nothing is filled in for you.
 */

/* ───────────────────────────── Types ───────────────────────────── */

export type FeatureStatus =
  | "available_beta"
  | "limited_beta"
  | "in_development"
  | "planned"
  | "unverified";

export type FeatureCategory = "trade" | "automate" | "research" | "account";

export type IconName =
  | "arrow-left-right"
  | "bar-chart"
  | "bell-ring"
  | "book-open"
  | "copy"
  | "crosshair"
  | "gift"
  | "languages"
  | "line-chart"
  | "lock-keyhole"
  | "megaphone"
  | "messages-square"
  | "octagon-x"
  | "pie-chart"
  | "radar"
  | "radio-tower"
  | "repeat"
  | "rocket"
  | "rss"
  | "scan-search"
  | "send"
  | "settings"
  | "shield-check"
  | "sliders"
  | "sparkles"
  | "tag"
  | "target"
  | "trophy"
  | "wallet"
  | "zap";

export type Feature = {
  /** Stable slug. Also the anchor on /features/ (`/features/#<id>`). */
  id: string;
  title: string;
  /** One sentence, mechanism only. No availability claims: the status badge carries those. */
  summary: string;
  category: FeatureCategory;
  icon: IconName;
  status: FeatureStatus;
  /** Required when `status` is `limited_beta`: the exact limitation shown beside the badge. */
  limitation?: string;
  /** Page that explains the feature. */
  href: string;
};

/** A fact the owner has not confirmed yet. Unconfirmed facts are never rendered. */
export type OwnerFact<T> = { confirmed: false } | { confirmed: true; value: T };

export type SiteRoute = {
  /** Path with a trailing slash, matching the static export. */
  path: string;
  label: string;
  /** Shown in the top navigation and the mobile menu. */
  nav: boolean;
  footer: "product" | "legal" | "none";
  /** When set, the nav shows this feature's status as a chip beside the label. */
  statusFeatureId?: string;
  /** Unique, beta-accurate metadata for the route. */
  title: string;
  description: string;
};

/* ─────────────────────────── Statuses ──────────────────────────── */

export const featureStatusMeta: Record<
  FeatureStatus,
  { label: string; short: string; explanation: string }
> = {
  available_beta: {
    label: "Available in beta",
    short: "Beta",
    explanation: "Verified on the live public bot.",
  },
  limited_beta: {
    label: "Limited beta",
    short: "Limited",
    explanation: "Available with the limitation stated beside it.",
  },
  in_development: {
    label: "In development",
    short: "Preview",
    explanation: "Shown as a preview. Not available to use yet.",
  },
  planned: {
    label: "Planned",
    short: "Planned",
    explanation: "On the roadmap. Not built yet.",
  },
  unverified: {
    label: "Pending verification",
    short: "Pending",
    explanation: "Being confirmed on the live public bot before it is listed as available.",
  },
};

/* ───────────────────────────── Config ──────────────────────────── */

export const site = {
  name: "Ripjaw",
  tagline: "One bot. Every move.",
  productLine: "A Solana trading bot inside Telegram.",
  url: "https://ripjaw.io",

  links: {
    /** The only official bot. Every Telegram call to action resolves to this. */
    telegramBot: "https://t.me/RipjawBot",
    telegramBotHandle: "@RipjawBot",
    x: "https://x.com/ripjawsol",
    xHandle: "@ripjawsol",
  },

  beta: {
    stageLabel: "Public Beta",
    eyebrow: "RIPJAW · PUBLIC BETA",
    notice:
      "Some features may change, be temporarily unavailable, or behave unexpectedly during public beta.",
    announcement: {
      text: "Ripjaw is in public beta. Access is a one-time 1 SOL fee, paid inside Telegram.",
      linkLabel: "See pricing",
      href: "/pricing/",
    },
  },

  cta: {
    primary: { label: "Try Ripjaw Beta" },
    secondary: { label: "See How It Works", href: "/#how-it-works" },
    pricing: { label: "Get Access on Telegram" },
    memeRadar: { label: "Explore Meme Radar", href: "/meme-radar/" },
    microcopy: "1 SOL one-time access · Trading fees apply · Crypto trading involves risk",
    reminder: "Public Beta · One-time 1 SOL access",
  },

  access: {
    amountSol: "1",
    priceLabel: "1 SOL",
    descriptor: "One-time access fee",
    eyebrow: "RIPJAW ACCESS · PUBLIC BETA",
    headline: "One payment. Your trading toolkit.",
    body: "Unlock the Ripjaw features currently available during public beta inside Telegram. We’re continuing to improve the bot and develop new tools.",
    /** Kit-specified terms. Confirm against production before launch. */
    points: [
      "The Ripjaw tools available during public beta",
      "No recurring subscription",
      "No separate Ripjaw token or credit package required",
    ],
    disclosure:
      "Per-trade Ripjaw speed fees, network charges and execution costs may apply. Check fees before trading.",
    paymentNote:
      "Payment happens inside the Telegram bot. This website never takes payment, connects a wallet, or asks for keys.",
  },

  speedFees: {
    /**
     * While true, the tiers below are NOT published anywhere. The site says
     * that current fees are shown in Telegram before you confirm a trade.
     * Set to false only after the owner approves every amount.
     */
    pendingVerification: true,
    pendingCopy: "Current trade fees are shown in Telegram before you confirm a trade.",
    /** Shown as an instruction only once the command is verified on the live bot. */
    botCommand: { command: "/fees", verifiedOnLiveBot: false },
    publishedNote:
      "Speed fees are flat amounts per trade. They are not the whole cost of a trade: Solana network fees, priority fees, tips and price impact are separate.",
    /** Kit-listed candidates, not confirmed as final public rates. */
    tiers: [
      { mode: "Eco", feeSol: "0.001" },
      { mode: "Normal", feeSol: "0.005" },
      { mode: "Fast", feeSol: "0.01" },
      { mode: "Instant", feeSol: "0.275" },
    ],
  },

  referrals: {
    showOnHome: true,
    showOnPricing: true,
    status: "unverified" as FeatureStatus,
    headline: "Share Ripjaw with a link.",
    body: "Ripjaw has a referral program that runs inside the bot. Your personal link is shown in Telegram, and a friend who opens it starts the bot with your code attached.",
    /** Query parameter the site accepts, e.g. https://ripjaw.io/?ref=ABC123 */
    queryParam: "ref",
    /** Letters and digits only, 3 to 20 characters. */
    codePattern: "^[A-Za-z0-9]{3,20}$",
    /** Appended to the bot link as `?start=ref_<CODE>`. */
    startPrefix: "ref_",
    rewards: {
      /** While true, no reward amount, percentage, discount or threshold is published. */
      pendingVerification: true,
      pendingCopy: "Reward details are shown in Telegram.",
      /** Kit-listed candidates, not owner-finalized. */
      items: [
        { label: "Access fee share", value: "0.25 SOL per referred access fee" },
        { label: "Tier 1 trading-fee share", value: "25%" },
        { label: "Tier 2 trading-fee share", value: "3.5%" },
        { label: "Tier 3 trading-fee share", value: "2.5%" },
        { label: "Friend discount on trading fees", value: "10%" },
      ],
    },
  },

  demo: {
    label: "Demo · sample data",
    /** Not a valid X handle (X does not allow hyphens), so it cannot be a real account. */
    sampleHandle: "@sample-account",
    samplePost: "the doge meme is back",
  },

  roadmap: {
    /** Set to false to hide `planned` features everywhere. */
    showPlanned: true,
  },

  legal: {
    /** Terms, Privacy and Risk are drafts until a lawyer has reviewed them. */
    reviewed: false,
    draftNotice: "Draft pending legal review. Not final policy.",
    entityName: { confirmed: false } as OwnerFact<string>,
    refundPolicy: { confirmed: false } as OwnerFact<string>,
    restrictedJurisdictions: { confirmed: false } as OwnerFact<string>,
    shortDisclaimer:
      "Ripjaw is a software tool, not a financial adviser, broker or exchange. Nothing on this site or in the bot is financial, investment, legal or tax advice. Trading meme coins and other crypto assets is extremely risky: prices can go to zero in seconds, liquidity can disappear, and transactions on Solana can’t be reversed. Safety checks are automated heuristics that can be wrong or incomplete. Only trade what you can afford to lose.",
    nonAffiliation:
      "Ripjaw is not affiliated with Solana Labs, the Solana Foundation, Telegram or X.",
    antiImpersonation:
      "Ripjaw will never DM you first or ask for your private key. The only official bot is @RipjawBot.",
  },

  support: {
    contact: { confirmed: false } as OwnerFact<{ label: string; href: string }>,
    communityChannel: { confirmed: false } as OwnerFact<{ label: string; href: string }>,
  },

  analytics: {
    /** Name of the analytics service this website loads. Unconfirmed means the site loads none. */
    provider: { confirmed: false } as OwnerFact<string>,
  },

  seo: {
    titleSuffix: "Ripjaw",
    ogImage: { path: "/og-card-1200x630.png", width: 1200, height: 630 },
    ogImageAlt: "Ripjaw logo with the slogan One bot. Every move.",
  },

  routes: [
    {
      path: "/",
      label: "Home",
      nav: false,
      footer: "none",
      title: "Ripjaw — Solana Trading Bot in Telegram | Public Beta",
      description:
        "Ripjaw is a Solana trading bot inside Telegram, now in public beta. Trade tokens, check risks and manage your moves in one chat. One-time 1 SOL access; trading fees apply.",
    },
    {
      path: "/features/",
      label: "Features",
      nav: true,
      footer: "product",
      title: "Features — Ripjaw Public Beta",
      description:
        "Every Ripjaw tool with its current beta status: trading, orders, automation, token risk checks, wallets and settings, all inside Telegram.",
    },
    {
      path: "/meme-radar/",
      label: "Meme Radar",
      nav: true,
      footer: "product",
      statusFeatureId: "meme-radar",
      title: "Meme Radar Preview — Ripjaw",
      description:
        "A preview of Meme Radar, in development: the intended workflow from a social post to candidate tokens, risk checks and a Telegram alert you confirm. Demo data only.",
    },
    {
      path: "/safety/",
      label: "Safety",
      nav: true,
      footer: "product",
      title: "Safety Check — Ripjaw",
      description:
        "What Ripjaw’s token Safety Check looks at, what a pass, incomplete or failed result means, and what it can miss. A check, not a guarantee.",
    },
    {
      path: "/pricing/",
      label: "Pricing",
      nav: true,
      footer: "product",
      title: "Pricing — Ripjaw Public Beta",
      description:
        "Ripjaw access is a one-time 1 SOL fee during public beta, paid inside Telegram. Per-trade speed fees, network charges and execution costs are separate.",
    },
    {
      path: "/docs/",
      label: "Docs",
      nav: true,
      footer: "product",
      title: "Docs & Commands — Ripjaw",
      description:
        "Getting started with Ripjaw in Telegram and a reference for its commands, written out as text you can copy.",
    },
    {
      path: "/faq/",
      label: "FAQ",
      nav: false,
      footer: "product",
      title: "FAQ — Ripjaw Public Beta",
      description:
        "Answers about the Ripjaw public beta: what it costs, which other fees apply, what is available today, how the Safety Check works, and the risks of trading.",
    },
    {
      path: "/terms/",
      label: "Terms",
      nav: false,
      footer: "legal",
      title: "Terms of Use (Draft) — Ripjaw",
      description: "Draft terms of use for Ripjaw, pending legal review.",
    },
    {
      path: "/privacy/",
      label: "Privacy",
      nav: false,
      footer: "legal",
      title: "Privacy Policy (Draft) — Ripjaw",
      description: "Draft privacy policy for Ripjaw, pending legal review.",
    },
    {
      path: "/risk/",
      label: "Risk disclosure",
      nav: false,
      footer: "legal",
      title: "Risk Disclosure (Draft) — Ripjaw",
      description:
        "Draft risk disclosure for Ripjaw, pending legal review: crypto trading risk, the limits of automated checks, and your responsibilities.",
    },
  ] as SiteRoute[],

  /**
   * Feature statuses default to the cautious reading of the kit: working-code
   * candidates are `unverified` until the owner confirms the live public bot.
   * Changing a status here updates every badge, nav chip and label that reads it.
   */
  features: [
    {
      id: "buy-sell",
      title: "Buy & Sell",
      summary:
        "Swap Solana tokens from the chat with preset sizes, your own slippage and priority settings, and a confirm step.",
      category: "trade",
      icon: "arrow-left-right",
      status: "unverified",
      href: "/features/#buy-sell",
    },
    {
      id: "limit-orders",
      title: "Limit Orders",
      summary: "Set a buy or sell price and let the order wait in the background.",
      category: "trade",
      icon: "tag",
      status: "unverified",
      href: "/features/#limit-orders",
    },
    {
      id: "anti-mev",
      title: "Anti-MEV routing",
      summary: "Optionally send buys and sells through a Jito bundle.",
      category: "trade",
      icon: "lock-keyhole",
      status: "unverified",
      href: "/features/#anti-mev",
    },
    {
      id: "block-failed-buys",
      title: "Block failed manual buys",
      summary:
        "Stop a manual buy when the token fails a hard check. The setting can be saved today, but it is not yet enforced on manual buys.",
      category: "trade",
      icon: "octagon-x",
      status: "in_development",
      href: "/safety/",
    },
    {
      id: "token-launch",
      title: "Token Launch",
      summary: "Create an SPL token with metadata from the chat.",
      category: "trade",
      icon: "rocket",
      status: "unverified",
      href: "/features/#token-launch",
    },
    {
      id: "dca",
      title: "DCA",
      summary: "Buy a fixed size on a timer.",
      category: "automate",
      icon: "repeat",
      status: "unverified",
      href: "/features/#dca",
    },
    {
      id: "tp-sl",
      title: "Take Profit & Stop Loss",
      summary: "Set take-profit levels, a stop loss and a trailing stop for auto-sell.",
      category: "automate",
      icon: "target",
      status: "unverified",
      href: "/features/#tp-sl",
    },
    {
      id: "copy-trade",
      title: "Copy Trade",
      summary:
        "Mirror buys and sells from wallets you pick, with your own size and per-trade and daily caps.",
      category: "automate",
      icon: "copy",
      status: "unverified",
      href: "/features/#copy-trade",
    },
    {
      id: "copy-signal",
      title: "Copy Signal",
      summary: "Optional auto-buy when a ranked wallet cluster or a pick appears.",
      category: "automate",
      icon: "zap",
      status: "unverified",
      href: "/features/#copy-signal",
    },
    {
      id: "sniper",
      title: "Sniper",
      summary:
        "Watch new launches and buy the ones that match the filters you set: size, liquidity, dev share, and revoked authorities.",
      category: "automate",
      icon: "crosshair",
      status: "unverified",
      href: "/features/#sniper",
    },
    {
      id: "meme-radar",
      title: "Meme Radar",
      summary:
        "Intended workflow: a watched account posts, candidate tokens are matched and risk-checked, and an alert reaches you in Telegram to confirm or ignore.",
      category: "research",
      icon: "radar",
      status: "in_development",
      href: "/meme-radar/",
    },
    {
      id: "safety-check",
      title: "Safety Check",
      summary:
        "Paste a token address and get a report: a score, each check marked pass, unknown or fail, and a plain-language reason.",
      category: "research",
      icon: "shield-check",
      status: "unverified",
      href: "/safety/",
    },
    {
      id: "wallet-tracking",
      title: "Wallet Tracking",
      summary:
        "Watch a wallet and get an alert when it buys or sells. Nothing is bought unless you choose to.",
      category: "research",
      icon: "radio-tower",
      status: "unverified",
      href: "/features/#wallet-tracking",
    },
    {
      id: "wallet-check",
      title: "Wallet Check",
      summary: "Profile a wallet before you decide to follow or copy it.",
      category: "research",
      icon: "scan-search",
      status: "unverified",
      href: "/features/#wallet-check",
    },
    {
      id: "top-wallets",
      title: "Top Wallets & Leaderboard",
      summary: "Wallets ranked from realized swap history.",
      category: "research",
      icon: "trophy",
      status: "unverified",
      href: "/features/#top-wallets",
    },
    {
      id: "picks",
      title: "Picks",
      summary: "A ranked list of new Solana tokens. A list to research, not a recommendation.",
      category: "research",
      icon: "sparkles",
      status: "unverified",
      href: "/features/#picks",
    },
    {
      id: "ct-tracker",
      title: "CT Tracker",
      summary: "Follow Solana accounts on X and trace posts to the token they mention.",
      category: "research",
      icon: "rss",
      status: "unverified",
      href: "/features/#ct-tracker",
    },
    {
      id: "price-alerts",
      title: "Price Alerts",
      summary: "Get a message when a token crosses a price you set.",
      category: "research",
      icon: "bell-ring",
      status: "unverified",
      href: "/features/#price-alerts",
    },
    {
      id: "coin-calling",
      title: "Coin Calling",
      summary: "Record a contract address and track how it moves from there.",
      category: "research",
      icon: "megaphone",
      status: "unverified",
      href: "/features/#coin-calling",
    },
    {
      id: "radar-track-record",
      title: "Public Meme Radar track record",
      summary: "A public page listing past Meme Radar alerts and what happened next.",
      category: "research",
      icon: "bar-chart",
      status: "planned",
      href: "/meme-radar/",
    },
    {
      id: "wallets",
      title: "Wallets",
      summary:
        "Create or import a Solana wallet in the chat, hold several, and switch between them.",
      category: "account",
      icon: "wallet",
      status: "unverified",
      href: "/features/#wallets",
    },
    {
      id: "portfolio",
      title: "Portfolio & PnL",
      summary: "Open positions, cost basis and profit or loss in one view.",
      category: "account",
      icon: "pie-chart",
      status: "unverified",
      href: "/features/#portfolio",
    },
    {
      id: "settings",
      title: "Settings hub",
      summary:
        "Speed, slippage, tips, confirmations, sell protection and presets in one place.",
      category: "account",
      icon: "sliders",
      status: "unverified",
      href: "/features/#settings",
    },
    {
      id: "account-security",
      title: "Account security",
      summary:
        "Wallet keys are encrypted at rest, with an optional action password for withdrawals and key export.",
      category: "account",
      icon: "lock-keyhole",
      status: "unverified",
      href: "/features/#account-security",
    },
    {
      id: "guide",
      title: "Built-in guide",
      summary: "Short pages for new traders on wallets, buying, risk and the Safety Check.",
      category: "account",
      icon: "book-open",
      status: "unverified",
      href: "/features/#guide",
    },
    {
      id: "group-commands",
      title: "Group commands",
      summary: "Quick token info commands inside your Telegram groups.",
      category: "account",
      icon: "messages-square",
      status: "unverified",
      href: "/features/#group-commands",
    },
    {
      id: "languages",
      title: "More languages",
      summary: "The bot is English only today.",
      category: "account",
      icon: "languages",
      status: "planned",
      href: "/features/#languages",
    },
  ] as Feature[],

  featureCategories: [
    { id: "trade", label: "Trade" },
    { id: "automate", label: "Automate" },
    { id: "research", label: "Research" },
    { id: "account", label: "Account" },
  ] as { id: FeatureCategory; label: string }[],
};

/* ─────────────────────────── Accessors ─────────────────────────── */

export function getFeature(id: string): Feature {
  const feature = site.features.find((f) => f.id === id);
  if (!feature) throw new Error(`site config: unknown feature id "${id}"`);
  return feature;
}

/** Features a visitor may see, honouring the roadmap switch. */
export function visibleFeatures(): Feature[] {
  return site.features.filter((f) => site.roadmap.showPlanned || f.status !== "planned");
}

export function getRoute(path: string): SiteRoute {
  const route = site.routes.find((r) => r.path === path);
  if (!route) throw new Error(`site config: unknown route "${path}"`);
  return route;
}

/* ─────────────────────────── Validation ────────────────────────── */

const PLACEHOLDER = /\[[^\]]*\]|\bTBD\b|lorem ipsum/i;

function fail(message: string): never {
  throw new Error(`site config: ${message}`);
}

/** Regular-expression source, where square brackets are syntax rather than a placeholder. */
const PATTERN_PATHS = new Set(["site.referrals.codePattern"]);

function assertStrings(value: unknown, path: string): void {
  if (typeof value === "string") {
    if (value.trim() === "") fail(`${path} is empty`);
    if (!PATTERN_PATHS.has(path) && PLACEHOLDER.test(value)) {
      fail(`${path} contains a placeholder: "${value}"`);
    }
    return;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) fail(`${path} is an empty list`);
    value.forEach((item, i) => assertStrings(item, `${path}[${i}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) assertStrings(child, `${path}.${key}`);
    return;
  }
  if (value === undefined || value === null) fail(`${path} is missing`);
}

function assertHttpsUrl(value: string, path: string): void {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    fail(`${path} is not a URL: "${value}"`);
  }
  if (url.protocol !== "https:") fail(`${path} must be https: "${value}"`);
}

function assertUnique(values: string[], path: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) fail(`${path} has a duplicate: "${value}"`);
    seen.add(value);
  }
}

function assertInternalHref(href: string, path: string): void {
  const routePath = href.split("#")[0];
  if (!site.routes.some((r) => r.path === routePath)) {
    fail(`${path} points at "${href}", which is not in routes`);
  }
}

export function validateSiteConfig(): void {
  assertStrings(site, "site");

  assertHttpsUrl(site.url, "url");
  assertHttpsUrl(site.links.telegramBot, "links.telegramBot");
  assertHttpsUrl(site.links.x, "links.x");
  if (new URL(site.links.telegramBot).hostname !== "t.me") {
    fail("links.telegramBot must be a t.me link");
  }

  assertUnique(site.routes.map((r) => r.path), "routes");
  assertUnique(site.routes.map((r) => r.title), "routes titles");
  assertUnique(site.features.map((f) => f.id), "features");

  for (const route of site.routes) {
    if (!route.path.startsWith("/") || !route.path.endsWith("/")) {
      fail(`route "${route.path}" must start and end with "/"`);
    }
    if (route.statusFeatureId) getFeature(route.statusFeatureId);
  }

  for (const feature of site.features) {
    if (!(feature.status in featureStatusMeta)) {
      fail(`feature "${feature.id}" has unknown status "${feature.status}"`);
    }
    if (feature.status === "limited_beta" && !feature.limitation) {
      fail(`feature "${feature.id}" is limited_beta and needs a "limitation"`);
    }
    if (!site.featureCategories.some((c) => c.id === feature.category)) {
      fail(`feature "${feature.id}" has unknown category "${feature.category}"`);
    }
    assertInternalHref(feature.href, `feature "${feature.id}" href`);
  }

  assertInternalHref(site.cta.secondary.href, "cta.secondary.href");
  assertInternalHref(site.cta.memeRadar.href, "cta.memeRadar.href");
  assertInternalHref(site.beta.announcement.href, "beta.announcement.href");

  if (!/^\d+(\.\d+)?$/.test(site.access.amountSol)) fail("access.amountSol must be a number");
  for (const tier of site.speedFees.tiers) {
    if (!/^\d+(\.\d+)?$/.test(tier.feeSol)) fail(`speed fee "${tier.mode}" must be a number`);
  }

  try {
    new RegExp(site.referrals.codePattern);
  } catch {
    fail("referrals.codePattern is not a valid regular expression");
  }
  if (!(site.referrals.status in featureStatusMeta)) fail("referrals.status is unknown");

  const handle = site.demo.sampleHandle;
  if (!handle.startsWith("@") || /^@[A-Za-z0-9_]{1,15}$/.test(handle)) {
    fail(
      "demo.sampleHandle must start with @ and must not be a valid X handle, so it cannot name a real account",
    );
  }
}

validateSiteConfig();
