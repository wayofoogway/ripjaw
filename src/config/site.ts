import "server-only";

/**
 * Owner-editable source of truth for ripjaw.io.
 *
 * Everything a visitor can read about early access, availability, links,
 * legal status and navigation comes from this file. Edit a value here and
 * every page that shows it follows.
 *
 * This module is server-only: client components receive what they need as
 * props.
 *
 * `validateSiteConfig()` runs when the module loads. A missing or malformed
 * required value throws and fails the build; nothing is filled in for you.
 */

/* ───────────────────────────── Types ───────────────────────────── */

export type FeatureStatus = "early_access" | "limited" | "in_development" | "planned" | "unverified";

export type FeatureCategory = "trade" | "automate" | "research" | "account";

export type Feature = {
  /** Stable slug. Also the anchor on /features/ (`/features/#<id>`). */
  id: string;
  title: string;
  /** One sentence, mechanism only. No availability claims: the status label carries those. */
  summary: string;
  category: FeatureCategory;
  status: FeatureStatus;
  /** Required when `status` is `limited`: the exact limitation shown beside the label. */
  limitation?: string;
};

/** A fact the owner has not confirmed yet. Unconfirmed facts are never rendered. */
export type OwnerFact<T> = { confirmed: false } | { confirmed: true; value: T };

/**
 * `on_hold`: every early access spot shows the heading and the on-hold line.
 * No form is rendered and nothing is collected.
 * `open`: the email form is shown and posts to `destination`.
 */
export type EarlyAccessState = "on_hold" | "open";

export type EarlyAccess = {
  /** Required. There is no default: the build fails when it is absent. */
  state: EarlyAccessState;
  /**
   * Where sign-ups are sent: an https URL that accepts a POST. Required when
   * `state` is "open"; the build fails without it. The same origin must be
   * allowed by `connect-src` in vercel.json, which the build also checks.
   */
  destination?: string;
  heading: string;
  onHoldLine: string;
  openLine: string;
  submitLabel: string;
};

export type SiteRoute = {
  /** Path with a trailing slash, matching the static export. */
  path: string;
  label: string;
  /** Which footer group links to the route. */
  footer: "product" | "legal" | "none";
  /** Unique, accurate metadata for the route. */
  title: string;
  description: string;
};

/* ─────────────────────────── Statuses ──────────────────────────── */

export const featureStatusMeta: Record<FeatureStatus, { label: string; explanation: string }> = {
  early_access: {
    label: "In early access",
    explanation: "Confirmed for the early access release.",
  },
  limited: {
    label: "Limited",
    explanation: "In early access with the limitation stated beside it.",
  },
  in_development: {
    label: "In development",
    explanation: "Not available yet.",
  },
  planned: {
    label: "Planned",
    explanation: "On the roadmap. Not built yet.",
  },
  unverified: {
    label: "Pending verification",
    explanation: "Being confirmed before it is listed for early access.",
  },
};

/* ───────────────────────────── Config ──────────────────────────── */

export const site = {
  name: "Ripjaw",
  tagline: "One bot. Every move.",
  productLine: "A Solana trading bot inside Telegram.",
  url: "https://ripjaw.io",

  links: {
    /** Named so visitors can recognise the real bot. The site does not link to it. */
    telegramBotHandle: "@RipjawBot",
    x: "https://x.com/ripjawsol",
    xHandle: "@ripjawsol",
  },

  stage: {
    label: "Early access",
    notice: "Features can change, be unavailable, or behave unexpectedly during early access.",
  },

  earlyAccess: {
    state: "on_hold",
    heading: "Early access",
    onHoldLine: "Sign-up opens soon.",
    openLine: "Leave your email address and we will tell you when early access opens.",
    submitLabel: "Request early access",
  } as EarlyAccess,

  platform: {
    headline: "Telegram first. Web later.",
    line: "Ripjaw starts in Telegram. A web version is planned, with no date yet.",
  },

  referral: {
    /** Query parameter the site accepts, e.g. https://ripjaw.io/?ref=ABC123 */
    queryParam: "ref",
    /** Letters and digits only, 3 to 20 characters. */
    codePattern: "^[A-Za-z0-9]{3,20}$",
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
      "Ripjaw is a software tool, not a financial adviser, broker or exchange. Nothing on this site is financial advice. Crypto trading is high risk. Only trade what you can afford to lose.",
    nonAffiliation: "Ripjaw is not affiliated with Solana Labs, the Solana Foundation, Telegram or X.",
    antiImpersonation:
      "Ripjaw will never DM you first or ask for your private key. The only official bot is @RipjawBot.",
    websiteNote: "This website never takes payment, connects a wallet, or asks for keys.",
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
      footer: "none",
      title: "Ripjaw — Solana Trading Bot in Telegram | Early Access",
      description:
        "Ripjaw is a Solana trading bot inside Telegram. Trade tokens, check token risk and manage your orders in one chat. Early access is on the way.",
    },
    {
      path: "/features/",
      label: "Features",
      footer: "product",
      title: "Features — Ripjaw",
      description:
        "Every Ripjaw tool with its current status: trading, automation, research and account tools, all inside Telegram.",
    },
    {
      path: "/safety/",
      label: "Safety",
      footer: "product",
      title: "Safety Check — Ripjaw",
      description:
        "What Ripjaw’s token Safety Check looks at, what a pass, incomplete or failed result means, and what it can miss. A check, not a guarantee.",
    },
    {
      path: "/faq/",
      label: "FAQ",
      footer: "product",
      title: "FAQ — Ripjaw",
      description:
        "Answers about Ripjaw: early access, what it does, where it runs, how the Safety Check works, and the risks of trading.",
    },
    {
      path: "/docs/",
      label: "Docs",
      footer: "product",
      title: "Docs & Commands — Ripjaw",
      description: "A reference for the Ripjaw bot’s Telegram commands, written out as text you can copy.",
    },
    {
      path: "/terms/",
      label: "Terms",
      footer: "legal",
      title: "Terms of Use (Draft) — Ripjaw",
      description: "Draft terms of use for Ripjaw, pending legal review.",
    },
    {
      path: "/privacy/",
      label: "Privacy",
      footer: "legal",
      title: "Privacy Policy (Draft) — Ripjaw",
      description: "Draft privacy policy for Ripjaw, pending legal review.",
    },
    {
      path: "/risk/",
      label: "Risk",
      footer: "legal",
      title: "Risk Disclosure (Draft) — Ripjaw",
      description:
        "Draft risk disclosure for Ripjaw, pending legal review: crypto trading risk, the limits of automated checks, and your responsibilities.",
    },
  ] as SiteRoute[],

  /**
   * Feature statuses default to the cautious reading: a tool is `unverified`
   * until the owner confirms it for the early access release. Changing a
   * status here updates every label that reads it.
   */
  features: [
    {
      id: "buy-sell",
      title: "Buy & Sell",
      summary: "Swap Solana tokens from the chat with preset sizes, your own slippage and a confirm step.",
      category: "trade",
      status: "unverified",
    },
    {
      id: "limit-orders",
      title: "Limit Orders",
      summary: "Set a buy or sell price and let the order wait in the background.",
      category: "trade",
      status: "unverified",
    },
    {
      id: "anti-mev",
      title: "Anti-MEV routing",
      summary: "Optionally send buys and sells through a Jito bundle.",
      category: "trade",
      status: "unverified",
    },
    {
      id: "block-failed-buys",
      title: "Block failed manual buys",
      summary: "Stop a manual buy when the token fails a hard check. Not yet enforced on manual buys.",
      category: "trade",
      status: "in_development",
    },
    {
      id: "token-launch",
      title: "Token Launch",
      summary: "Create an SPL token with metadata from the chat.",
      category: "trade",
      status: "unverified",
    },
    {
      id: "dca",
      title: "DCA",
      summary: "Buy a fixed size on a timer.",
      category: "automate",
      status: "unverified",
    },
    {
      id: "tp-sl",
      title: "Take Profit & Stop Loss",
      summary: "Set take-profit levels, a stop loss and a trailing stop for auto-sell.",
      category: "automate",
      status: "unverified",
    },
    {
      id: "copy-trade",
      title: "Copy Trade",
      summary: "Mirror buys and sells from wallets you pick, with your own size and caps.",
      category: "automate",
      status: "unverified",
    },
    {
      id: "copy-signal",
      title: "Copy Signal",
      summary: "Optional auto-buy when a ranked wallet cluster or a pick appears.",
      category: "automate",
      status: "unverified",
    },
    {
      id: "sniper",
      title: "Sniper",
      summary: "Watch new launches and buy the ones that match the filters you set.",
      category: "automate",
      status: "unverified",
    },
    {
      id: "meme-radar",
      title: "Meme Radar",
      summary: "Telegram alerts when an account you watch posts about a token, with risk checks on the candidates.",
      category: "research",
      status: "in_development",
    },
    {
      id: "safety-check",
      title: "Safety Check",
      summary: "Paste a token address and get a report: each check marked passed, unknown or failed, with a reason.",
      category: "research",
      status: "unverified",
    },
    {
      id: "wallet-tracking",
      title: "Wallet Tracking",
      summary: "Watch a wallet and get an alert when it buys or sells.",
      category: "research",
      status: "unverified",
    },
    {
      id: "wallet-check",
      title: "Wallet Check",
      summary: "Profile a wallet before you decide to follow or copy it.",
      category: "research",
      status: "unverified",
    },
    {
      id: "top-wallets",
      title: "Top Wallets & Leaderboard",
      summary: "Wallets ranked from realized swap history.",
      category: "research",
      status: "unverified",
    },
    {
      id: "picks",
      title: "Picks",
      summary: "A ranked list of new Solana tokens. A list to research, not a recommendation.",
      category: "research",
      status: "unverified",
    },
    {
      id: "ct-tracker",
      title: "CT Tracker",
      summary: "Follow Solana accounts on X and trace posts to the token they mention.",
      category: "research",
      status: "unverified",
    },
    {
      id: "price-alerts",
      title: "Price Alerts",
      summary: "Get a message when a token crosses a price you set.",
      category: "research",
      status: "unverified",
    },
    {
      id: "coin-calling",
      title: "Coin Calling",
      summary: "Record a contract address and track how it moves from there.",
      category: "research",
      status: "unverified",
    },
    {
      id: "wallets",
      title: "Wallets",
      summary: "Create or import a Solana wallet in the chat, hold several, and switch between them.",
      category: "account",
      status: "unverified",
    },
    {
      id: "portfolio",
      title: "Portfolio & PnL",
      summary: "Open positions, cost basis and profit or loss in one view.",
      category: "account",
      status: "unverified",
    },
    {
      id: "settings",
      title: "Settings hub",
      summary: "Speed, slippage, tips, confirmations, sell protection and presets in one place.",
      category: "account",
      status: "unverified",
    },
    {
      id: "account-security",
      title: "Account security",
      summary: "Wallet keys are encrypted at rest, with an optional action password for withdrawals and key export.",
      category: "account",
      status: "unverified",
    },
    {
      id: "guide",
      title: "Built-in guide",
      summary: "Short pages for new traders on wallets, buying, risk and the Safety Check.",
      category: "account",
      status: "unverified",
    },
    {
      id: "group-commands",
      title: "Group commands",
      summary: "Quick token info commands inside your Telegram groups.",
      category: "account",
      status: "unverified",
    },
    {
      id: "languages",
      title: "More languages",
      summary: "The bot is English only today.",
      category: "account",
      status: "planned",
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

/** Where sign-ups are sent. Throws unless early access is open, so nothing can post while it is on hold. */
export function earlyAccessDestination(): string {
  const { state, destination } = site.earlyAccess;
  if (state !== "open") fail(`earlyAccess.destination was read while earlyAccess.state is "${state}"`);
  if (destination === undefined) fail(MISSING_DESTINATION);
  return destination;
}

/* ─────────────────────────── Validation ────────────────────────── */

const PLACEHOLDER = /\[[^\]]*\]|\bTBD\b|lorem ipsum/i;
const EARLY_ACCESS_STATES: EarlyAccessState[] = ["on_hold", "open"];
const MISSING_DESTINATION =
  'earlyAccess.destination is missing. It is required when earlyAccess.state is "open": set it to the https URL that receives sign-ups, or set the state to "on_hold".';

function fail(message: string): never {
  throw new Error(`site config: ${message}`);
}

/** Regular-expression source, where square brackets are syntax rather than a placeholder. */
const PATTERN_PATHS = new Set(["site.referral.codePattern"]);

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

function validateEarlyAccess(): void {
  const { state, destination } = site.earlyAccess as { state?: unknown; destination?: unknown };
  const allowed = EARLY_ACCESS_STATES.map((value) => `"${value}"`).join(" or ");
  if (state === undefined || state === null) {
    fail(`earlyAccess.state is missing. Set it to ${allowed}. There is no default.`);
  }
  if (!EARLY_ACCESS_STATES.includes(state as EarlyAccessState)) {
    fail(`earlyAccess.state must be ${allowed}, got ${JSON.stringify(state)}`);
  }
  if (destination === undefined || destination === null) {
    if (state === "open") fail(MISSING_DESTINATION);
    return;
  }
  if (typeof destination !== "string" || destination.trim() === "") {
    fail(`earlyAccess.destination must be an https URL, got ${JSON.stringify(destination)}`);
  }
  assertHttpsUrl(destination, "earlyAccess.destination");
}

export function validateSiteConfig(): void {
  validateEarlyAccess();
  assertStrings(site, "site");

  assertHttpsUrl(site.url, "url");
  assertHttpsUrl(site.links.x, "links.x");

  assertUnique(site.routes.map((r) => r.path), "routes");
  assertUnique(site.routes.map((r) => r.title), "routes titles");
  assertUnique(site.features.map((f) => f.id), "features");

  for (const route of site.routes) {
    if (!route.path.startsWith("/") || !route.path.endsWith("/")) {
      fail(`route "${route.path}" must start and end with "/"`);
    }
  }

  for (const feature of site.features) {
    if (!(feature.status in featureStatusMeta)) {
      fail(`feature "${feature.id}" has unknown status "${feature.status}"`);
    }
    if (feature.status === "limited" && !feature.limitation) {
      fail(`feature "${feature.id}" is limited and needs a "limitation"`);
    }
    if (!site.featureCategories.some((c) => c.id === feature.category)) {
      fail(`feature "${feature.id}" has unknown category "${feature.category}"`);
    }
  }

  try {
    new RegExp(site.referral.codePattern);
  } catch {
    fail("referral.codePattern is not a valid regular expression");
  }
}

validateSiteConfig();
