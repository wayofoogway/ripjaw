import "server-only";
import { site, visibleFeatures, type Feature, type FeatureCategory } from "@/config/site";
import type { AssetKey } from "@/lib/assets";

/*
 * Copy for /features/. Titles, one-line summaries, statuses and links come
 * from the site config; this file adds the detail under each tool and decides
 * which tools get an illustrated deep dive. Details describe mechanism only.
 * Availability is carried by the status badge, and amounts the owner has not
 * confirmed are never written here.
 */

export const hero = {
  eyebrow: `Features · ${site.beta.stageLabel}`,
  title: "Every tool, with its status.",
  lede: "Ripjaw keeps trading, automation, research and account tools in one Telegram chat. Each tool on this page carries a label that says where it stands today. A label changes only after the tool has been checked on the live public bot.",
  secondary: { label: "Browse by category" },
  note: site.beta.notice,
  legendTitle: "What the labels mean",
  legendCount: (count: number) => (count === 1 ? "1 tool" : `${count} tools`),
  visualAlt:
    "Ripjaw main menu in Telegram, a grid of buttons including Buy/Sell, Limit Orders, Copy Trade, Snipe, Safety Check, Settings and Wallet Check.",
  caption: "Main menu in the Ripjaw bot",
};

export const sectionNavLabel = "Feature categories";

export const categoryIntro: Record<FeatureCategory, string> = {
  trade: "Buying, selling, and the orders and routing around a trade.",
  automate: "Rules that act for you, inside limits you set.",
  research: "Ways to look at a token or a wallet before you decide.",
  account: "Wallets, settings and the basics of using the bot.",
};

export const labels = {
  menu: "In the bot menu",
  limitation: "Limitation",
  count: hero.legendCount,
  more: (category: string) => `More in ${category}`,
};

export type FeatureDetail = {
  /** Short statements of how the tool works. */
  points: string[];
  /** The tool's button on the bot's main menu, as shown in the kit's menu screenshot. */
  menu?: string;
  /** Where to read more, for tools that have their own page. */
  link?: { label: string; href: string };
};

const AUTOMATION_RISK = "Automated buying acts without a confirmation and carries extra risk.";

export const featureDetails: Record<string, FeatureDetail> = {
  "buy-sell": {
    points: [
      "Preset buy and sell sizes, or type your own amount.",
      "Slippage, priority fee and an optional tip come from your settings.",
      "A confirm step sits between the tap and the trade. Confirmations are yours to set.",
      site.speedFees.pendingVerification
        ? `Trading fees apply to each trade. ${site.speedFees.pendingCopy}`
        : site.speedFees.publishedNote,
    ],
    menu: "Buy/Sell",
  },
  "limit-orders": {
    points: ["Set a target price for a buy or for a sell.", "Orders wait in the background and message you when they fill."],
    menu: "Limit Orders",
  },
  "anti-mev": {
    points: ["Applies to buys and to sells, each with its own switch in Settings.", "Different routing is never a guarantee of a better price."],
  },
  "block-failed-buys": {
    points: ["Until it is enforced, a manual buy can go ahead after a failed hard check. Read the report first."],
    link: { label: "Limits of the Safety Check", href: "/safety/#limits" },
  },
  "token-launch": {
    points: ["Set the token’s name, symbol and metadata in the chat.", "You are responsible for any token you create."],
  },
  dca: {
    points: ["Choose the token, the size of each buy and the interval.", "Open DCA orders are listed alongside limit orders."],
    menu: "DCA Orders",
  },
  "tp-sl": {
    points: [
      "Several take-profit levels on one position.",
      "A stop loss, and a trailing stop that follows the price.",
      "Automatic sells act on fast-moving data and can fill at a worse price than the trigger.",
    ],
  },
  "copy-trade": {
    points: [
      "Pick the wallets to mirror, and pause or remove one at any time.",
      "Set your own size, a cap per trade and a cap per day.",
      "A Safety Check runs before each copy. It is on by default.",
      "Copied trades can be delayed or fill at a worse price than the wallet you follow.",
    ],
    menu: "Copy Trade",
  },
  "copy-signal": {
    points: ["Optional. It triggers when a ranked wallet cluster or a pick appears.", AUTOMATION_RISK],
    menu: "Copy Signal",
  },
  sniper: {
    points: [
      "Watches new token launches and new liquidity pools.",
      "Filters include buy size, a maximum, minimum liquidity, dev share, revoked mint and freeze authority, and allowed or blocked words.",
      "Can also act when a token moves from its launch curve to a pool.",
      AUTOMATION_RISK,
    ],
    menu: "Snipe",
  },
  "meme-radar": {
    points: [
      "Shown on this site as a preview with demo data.",
      "A candidate that fails a check is listed with the reason and gets no Snipe button.",
      "A Snipe from an alert opens a confirmation step first.",
    ],
    link: { label: site.cta.memeRadar.label, href: site.cta.memeRadar.href },
  },
  "safety-check": {
    points: [
      "Reads mint and freeze authority, liquidity, holders, bundles and a test sell.",
      "Each check is marked passed, unknown or failed, with a reason.",
      "A check that cannot be read is never counted as a pass.",
    ],
    menu: "Safety Check",
    link: { label: "How the Safety Check works", href: "/safety/" },
  },
  "wallet-tracking": {
    points: [
      "Add a wallet to watch, and mute or remove it later.",
      "An alert is a Telegram message, so it arrives like any other notification.",
      "Tracking only tells you. It does not copy the trade.",
    ],
  },
  "wallet-check": {
    points: ["Paste a wallet address to see its profile.", "Useful before you track a wallet or mirror it with Copy Trade."],
    menu: "Wallet Check",
  },
  "top-wallets": {
    points: ["Comes with a feed of what ranked wallets are doing.", "A wallet’s past results say little about its next trade."],
    menu: "Top Wallets",
  },
  picks: {
    points: ["New tokens are high risk, and most lose their value.", "Not financial advice."],
    menu: "Picks",
  },
  "ct-tracker": {
    points: ["Follow specific accounts, or every tracked account.", "Read the feed, or look up the posts about one token."],
    menu: "CT Tracker",
  },
  "price-alerts": {
    points: ["The alert is a Telegram message, so it arrives like any other notification.", "Also offers a feed of new launches."],
  },
  "coin-calling": {
    points: ["Record the address at the moment you call it.", "The call then shows how far the price has moved since."],
    menu: "Coin Calling",
  },
  "radar-track-record": {
    points: ["Not built yet. No Meme Radar results or statistics are published today."],
    link: { label: "What Meme Radar is not", href: "/meme-radar/#limits" },
  },
  wallets: {
    points: [
      "Create a wallet in the chat, or import one you already use.",
      "Hold several, rename them and switch between them.",
      "Withdraw SOL or tokens to another address.",
      "Export your key and keep a copy offline. You are responsible for it.",
    ],
    menu: "Wallet",
  },
  portfolio: {
    points: ["Each position shows its cost basis and its profit or loss.", "A position’s result can be shared as a PnL card."],
  },
  settings: {
    points: [
      "Speed, slippage and tips for buys and for sells.",
      "Confirmation prompts and sell protection.",
      "Buy and sell presets, so common sizes are one tap.",
      "Automated buying and selling are switches you turn on yourself.",
    ],
    menu: "Settings",
  },
  "account-security": {
    points: [
      "A key is shown only after you confirm an export.",
      "The action password is stored as a hash, not as the password itself.",
      site.legal.antiImpersonation,
    ],
  },
  guide: {
    points: ["Covers wallets, buying, risk, the Safety Check, take profit and stop loss, and copy trading."],
    menu: "New to trading",
  },
  "group-commands": {
    points: ["Add the bot to a group to look up a token’s price or basic information by its address."],
  },
  languages: {
    points: ["More languages are on the roadmap. There is no date."],
  },
};

type Media =
  | { kind: "phone"; phone: Extract<AssetKey, `phone${string}`>; backdrop: AssetKey; preview: boolean }
  | { kind: "art"; art: AssetKey }
  | { kind: "chat"; chat: Extract<AssetKey, `chat${string}`> };

export type DeepDive = { featureId: string; media: Media; alt: string; caption: string };

/** Tools that get an illustrated deep dive, in page order. Every other visible tool is listed in its category's grid. */
export const deepDives: DeepDive[] = [
  {
    featureId: "buy-sell",
    media: { kind: "phone", phone: "phoneHomeMenu", backdrop: "speedOneTapConcept", preview: false },
    alt: "Ripjaw main menu in Telegram on a phone, with buttons including Buy/Sell, Limit Orders, Assets, Wallet, Snipe, Safety Check and Settings.",
    caption: "Main menu in the Ripjaw bot · sample data",
  },
  {
    featureId: "copy-trade",
    media: { kind: "art", art: "copyTradeNetwork" },
    alt: "Illustration: glass nodes joined by purple and green lines, like wallets linked in a network.",
    caption: "Illustration",
  },
  {
    featureId: "safety-check",
    media: { kind: "chat", chat: "chatSafetyCheck" },
    alt: "Ripjaw Safety Check report for the token BONK in Telegram: incomplete, 60 out of 100, 10 of 15 checks read, with mint and freeze revoked and several items unread.",
    caption: "Safety Check report in the Ripjaw bot · sample data",
  },
  {
    featureId: "meme-radar",
    media: { kind: "phone", phone: "phoneRadarAlert", backdrop: "memeRadarConcept", preview: true },
    alt: "Preview with sample data: a Meme Radar alert in Telegram for a post by a sample account, listing two top picks with Snipe buttons and four flagged tokens with the reason for each.",
    caption: "Preview · sample data",
  },
  {
    featureId: "wallet-tracking",
    media: { kind: "art", art: "pushAlertsConcept" },
    alt: "Illustration: a phone lying on a dark surface with a notification on its screen and rings of light spreading out from it.",
    caption: "Illustration",
  },
  {
    featureId: "wallets",
    media: { kind: "chat", chat: "chatHomeWallet" },
    alt: "Ripjaw start message in Telegram showing a main wallet address, a zero SOL balance and a prompt to deposit.",
    caption: "Start message in the Ripjaw bot · sample data",
  },
  {
    featureId: "settings",
    media: { kind: "chat", chat: "chatSettings" },
    alt: "Ripjaw Settings hub in Telegram with buttons for trading, buy and sell settings, confirmations, wallets and account security.",
    caption: "Settings hub in the Ripjaw bot · sample data",
  },
];

/** Detail for a feature. Throws when a visible feature has none, so a tool added to the config cannot ship without copy. */
export function detailFor(feature: Feature): FeatureDetail {
  const detail = featureDetails[feature.id];
  if (!detail) throw new Error(`content/features: no detail written for feature "${feature.id}"`);
  return detail;
}

function validate(): void {
  const visible = new Set(visibleFeatures().map((feature) => feature.id));
  for (const id of visible) {
    if (!featureDetails[id]) throw new Error(`content/features: no detail written for feature "${id}"`);
  }
  for (const id of Object.keys(featureDetails)) {
    if (!site.features.some((feature) => feature.id === id)) {
      throw new Error(`content/features: detail written for unknown feature "${id}"`);
    }
  }
  for (const dive of deepDives) {
    if (!site.features.some((feature) => feature.id === dive.featureId)) {
      throw new Error(`content/features: deep dive for unknown feature "${dive.featureId}"`);
    }
  }
}

validate();
