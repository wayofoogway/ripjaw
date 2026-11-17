import "server-only";
import { featureStatusMeta, getFeature, site, visibleFeatures, type FeatureStatus, type IconName } from "@/config/site";
import type { AssetKey } from "@/lib/assets";

/*
 * Homepage copy. Facts (price, statuses, fees, links) are read from the site
 * config so they cannot drift; this file only holds the words around them.
 */

const verified = (status: FeatureStatus) => status === "available_beta" || status === "limited_beta";

export const hero = {
  headline: { lead: "One bot.", accent: "Every move." },
  subhead:
    "Trade Solana tokens, check risks, and manage your moves without leaving Telegram. Ripjaw is in public beta, with more tools on the way.",
  scrollCue: "Scroll",
  mockupCaption: "Ripjaw in Telegram · sample data",
};

export const pillars: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "send",
    title: "Trade in Telegram",
    body: "Buy, sell and place orders from one chat. There is no separate terminal to install or keep open.",
  },
  {
    icon: "shield-check",
    title: "Review token risk",
    body: "Paste a token address for a report on its contract, liquidity and holders before you decide.",
  },
  {
    icon: "sliders",
    title: "Manage your strategy",
    body: "Set your own speed, slippage and confirmations, then keep orders and positions in the same place.",
  },
];

export const showcase = {
  eyebrow: "Inside the beta",
  title: "The core toolkit, one chat.",
  ledeVerified: "These tools have been verified on the live public bot. Screens are from the Ripjaw bot, with sample data.",
  ledeUnverified:
    "Each tool below carries its current status. Labels change to “Available in beta” only after a feature is verified on the live public bot. Screens are from the Ripjaw bot, with sample data.",
  items: [
    {
      featureId: "buy-sell",
      asset: "chatHomeMenu",
      alt: "Ripjaw main menu in Telegram with buttons including Buy/Sell, Limit Orders, Assets, Wallet, Snipe, Safety Check and Settings.",
      caption: "Main menu",
    },
    {
      featureId: "safety-check",
      asset: "chatSafetyCheck",
      alt: "Ripjaw Safety Check report for the token BONK in Telegram: incomplete, 60 out of 100, 10 of 15 checks read, with mint and freeze revoked and several items unread.",
      caption: "Safety Check report",
    },
    {
      featureId: "wallets",
      asset: "chatHomeWallet",
      alt: "Ripjaw start message in Telegram showing a main wallet address, a zero SOL balance and a prompt to deposit.",
      caption: "Wallet on start",
    },
    {
      featureId: "settings",
      asset: "chatSettings",
      alt: "Ripjaw Settings hub in Telegram with buttons for trading, buy and sell settings, confirmations, wallets and account security.",
      caption: "Settings hub",
    },
  ] satisfies { featureId: string; asset: AssetKey; alt: string; caption: string }[],
};

export const memeRadar = {
  title: "From a post to a decision you make.",
  lede: "Meme Radar is being built to follow a short chain: a watched account posts, candidate tokens are matched and risk-checked, and an alert reaches you in Telegram. This is how it is meant to work, shown with demo data.",
  acts: [
    {
      step: "Post",
      title: "A post appears",
      body: "Meme Radar is designed to watch a list of accounts. When one posts, it reads the text and the image.",
    },
    {
      step: "Match",
      title: "Candidate tokens appear",
      body: "It looks for tokens created after the post that match by name, ticker or keywords. Matching can miss tokens and can surface unrelated ones.",
    },
    {
      step: "Check",
      title: "Risk checks resolve",
      body: "Each candidate goes through the Safety Check. Results arrive as passed, flagged or unknown. An unknown is never counted as a pass.",
    },
    {
      step: "Alert",
      title: "You get the alert, and decide",
      body: "The alert lands in Telegram. A Snipe button opens a confirmation step. Nothing is bought until you confirm.",
    },
  ],
  /** Invented demo tokens. The first six mirror the bot's built-in demo alert; the seventh shows an unknown result. */
  tokens: [
    { ticker: "DOGE", match: "name and image match", age: "1m after post", result: "pass", reason: "passed checks" },
    { ticker: "MEME", match: "keyword match", age: "1m after post", result: "pass", reason: "passed checks" },
    { ticker: "HONEY", match: "keyword match", age: "2m after post", result: "flag", reason: "honeypot" },
    { ticker: "LIVE", match: "keyword match", age: "2m after post", result: "flag", reason: "mint not revoked" },
    { ticker: "BUN", match: "keyword match", age: "3m after post", result: "flag", reason: "bundled" },
    { ticker: "DOGE", match: "duplicate ticker", age: "4m after post", result: "flag", reason: "copycat" },
    { ticker: "WOOF", match: "keyword match", age: "5m after post", result: "unknown", reason: "checks incomplete" },
  ] satisfies { ticker: string; match: string; age: string; result: "pass" | "flag" | "unknown"; reason: string }[],
  resultGroups: {
    pass: "Passed checks",
    flag: "Flagged",
    unknown: "Unknown",
  },
  report: {
    title: "Full safety report",
    lines: [
      "Mint authority: revoked",
      "Freeze authority: revoked",
      "Sell quote: pass at 5% slippage",
      "LP: burned",
      "Top holders: unknown",
    ],
    note: "Heuristic only. Not financial advice.",
  },
  confirmNote: "Confirmation step. Nothing is bought until you confirm.",
  previewTag: "Preview · sample data",
  feedLabel: "Demo feed",
  feed: ["post detected", "7 candidate tokens", "2 passed checks", "4 flagged", "1 unknown", "confirmation required"],
  disclaimer: "Illustration of the intended workflow. Tokens, scores and the post are invented demo data. Not financial advice.",
};

export const howItWorks = {
  eyebrow: "How it works",
  title: "Four steps, all inside Telegram.",
  lede: "There is no checkout on this website. Setup and payment both happen in the bot.",
  steps: [
    {
      title: "Open the official bot",
      body: `Open ${site.links.telegramBotHandle} in Telegram and tap Start. Check the handle: it is the only official Ripjaw bot.`,
    },
    {
      title: "Set up your wallet",
      body: "Ripjaw shows a Solana wallet in the chat, with its address and balance. Follow the bot’s own instructions to create or import one, and keep your keys private.",
    },
    {
      title: `Pay ${site.access.priceLabel}, one time`,
      body: `When the bot asks, pay the ${site.access.descriptor.toLowerCase()} from inside Telegram. Trading fees are separate and apply per trade.`,
    },
    {
      title: "Explore the beta tools",
      body: "Start with a Safety Check on a token you know, then look through the menu. Tools marked in development are not available yet.",
    },
  ],
};

export const safety = {
  eyebrow: "Safety Check",
  title: "Read the contract before you read the chart.",
  lede: "Paste a Solana token address and Ripjaw returns a report: a score out of 100, each check marked passed, unknown or failed, and a plain-language reason.",
  principle: "A check, not a guarantee.",
  principleBody:
    "A report describes what automated checks could read at that moment. It cannot see private bundles or what a deployer does next, and it is not a recommendation to buy.",
  checks: [
    { name: "Mint authority", detail: "Can more supply be created?" },
    { name: "Freeze authority", detail: "Can your tokens be frozen?" },
    { name: "Sell simulation", detail: "Does a small test sell go through? A token you can buy but not sell is a honeypot." },
    { name: "Liquidity & LP", detail: "Is the pool’s liquidity burned or locked, or can it be pulled?" },
    { name: "Holders", detail: "How much do the largest wallets hold, apart from the pool?" },
    { name: "Bundles", detail: "Did linked wallets buy a large share of supply at launch?" },
  ],
  verdicts: [
    {
      tone: "pass",
      label: "Passed the safety check",
      meaning: "No hard check failed and the score is in the lower-concern band. A pass is not approval to buy.",
      excerpt:
        "Score 78 is in the lower-concern band. Freeze is revoked and no wallet holds more than half. Unchecked items were not treated as a pass. Heuristic only. Not financial advice.",
    },
    {
      tone: "unknown",
      label: "Incomplete",
      meaning: "Some checks could not be read. Treat the gaps as open questions, not as passes.",
      excerpt:
        "INCOMPLETE · 60/100. Checked 10 of 15. Mint and freeze are revoked and a test sell worked. Not financial advice.",
    },
    {
      tone: "fail",
      label: "Failed a hard check",
      meaning: "At least one hard check failed. The report names the check instead of making an accusation.",
      excerpt:
        "Sell simulation failed. Heuristic only. Not financial advice. It does not see private bundles, social rugs, or future pool pulls.",
    },
  ] satisfies { tone: "pass" | "unknown" | "fail"; label: string; meaning: string; excerpt: string }[],
  excerptNote: "Report text from the Ripjaw bot · sample tokens",
  cta: { label: "How the Safety Check works", href: getFeature("safety-check").href },
};

export const bento = {
  eyebrow: "Features",
  title: "Every move, one chat.",
  lede: "The Ripjaw toolkit by category, each with its current status.",
  /** Feature ids shown on the homepage, in order. `featured` cells are larger. */
  cells: [
    { id: "meme-radar", size: "featured" },
    { id: "safety-check", size: "wide" },
    { id: "buy-sell", size: "standard" },
    { id: "limit-orders", size: "standard" },
    { id: "dca", size: "standard" },
    { id: "tp-sl", size: "standard" },
    { id: "copy-trade", size: "standard" },
    { id: "sniper", size: "standard" },
    { id: "wallet-tracking", size: "standard" },
    { id: "portfolio", size: "standard" },
    { id: "wallets", size: "standard" },
    { id: "settings", size: "standard" },
    { id: "block-failed-buys", size: "standard" },
    { id: "radar-track-record", size: "standard" },
    { id: "languages", size: "standard" },
  ] satisfies { id: string; size: "featured" | "wide" | "standard" }[],
  allLabel: "All features",
};

export const philosophy = {
  eyebrow: "Why Ripjaw",
  title: "Built around the chat you already have open.",
  principles: [
    {
      title: "One place for the whole move",
      body: "The report, the order and the position sit in the same conversation, so there is less copying addresses between apps.",
    },
    {
      title: "It reaches you",
      body: "Ripjaw replies and alerts are Telegram messages. They arrive like any other notification on your phone.",
    },
    {
      title: "Honest about risk",
      body: "Reports state which check passed, failed or could not be read. A gap is shown as a gap.",
    },
    {
      title: "Your settings, your confirmation",
      body: "Speed, slippage and confirmation prompts are yours to set, and automated buying is opt-in.",
    },
  ],
};

export const referralsSection = {
  eyebrow: "Referrals",
  steps: [
    "Open Referrals in the bot to see your personal link.",
    "Share it. A friend who opens it starts the bot with your code attached.",
    "Links to this site work too: add your code and every Telegram button here carries it.",
  ],
  siteLinkLabel: "Site link format",
  botLinkLabel: "Bot link format",
  codePlaceholder: "YOURCODE",
};

export const finalCta = {
  title: "Your next move starts in Telegram.",
  body: "Open the official bot, set up your wallet, and see what the beta can do.",
};

/* ─────────────────────────────── FAQ ─────────────────────────────── */

function availabilityAnswer(): string {
  const live = visibleFeatures().filter((f) => verified(f.status));
  if (live.length === 0) {
    return "Feature availability is being confirmed on the live public bot, one feature at a time. Every tool on this site carries its current status label. Only features marked “Available in beta” or “Limited beta” have been verified; anything marked “In development” or “Planned” is not available yet.";
  }
  const names = live.map((f) => (f.status === "limited_beta" ? `${f.title} (limited: ${f.limitation})` : f.title));
  return `Verified on the live public bot today: ${names.join(", ")}. Every other tool on this site carries its own status label, and anything marked “In development” or “Planned” is not available yet.`;
}

function memeRadarAnswer(): string {
  const radar = getFeature("meme-radar");
  switch (radar.status) {
    case "available_beta":
      return "Yes. Meme Radar is available in the public beta. Alerts are automated and can be wrong or late, and a Snipe always asks you to confirm.";
    case "limited_beta":
      return `Partly. Meme Radar is in limited beta: ${radar.limitation} The full workflow shown on this site uses demo data.`;
    case "in_development":
    case "unverified":
      return "Not yet as shown on this site. The full Meme Radar workflow, which reads posts from X, is in development. It appears here as a preview with demo data, so you can see where it is going. It is not a live alert feed.";
    case "planned":
      return "No. Meme Radar is planned and is not built yet. What you see on this site is a concept preview with demo data.";
  }
}

function otherFeesAnswer(): string {
  const base =
    "Trading costs are separate from the access fee. A trade can carry a Ripjaw speed fee, Solana network and priority fees, optional tips, and price impact.";
  if (site.speedFees.pendingVerification) {
    const command = site.speedFees.botCommand;
    const instruction = command.verifiedOnLiveBot ? ` Send ${command.command} in the bot to see them at any time.` : "";
    return `${base} ${site.speedFees.pendingCopy}${instruction} Check fees before trading.`;
  }
  const tiers = site.speedFees.tiers.map((t) => `${t.mode} ${t.feeSol} SOL`).join(", ");
  return `${base} Ripjaw speed fees per trade: ${tiers}. ${site.speedFees.publishedNote}`;
}

export const faq: { id: string; question: string; answer: string }[] = [
  {
    id: "public-beta",
    question: "What is public beta?",
    answer: `Ripjaw is open to the public while it is still being built and tested. You can use the tools that are available in the Telegram bot today. ${site.beta.notice}`,
  },
  {
    id: "cost",
    question: "How much does it cost?",
    answer: `Access costs ${site.access.priceLabel}, paid once, inside the Telegram bot. This website never takes payment. There is no free trial, and trading fees are separate.`,
  },
  { id: "other-fees", question: "What other fees apply?", answer: otherFeesAnswer() },
  { id: "available-today", question: "Which features are available today?", answer: availabilityAnswer() },
  { id: "meme-radar", question: "Is Meme Radar operational?", answer: memeRadarAnswer() },
  {
    id: "token-safety",
    question: "How does token safety work?",
    answer:
      "Paste a token address in the bot and the Safety Check reads on-chain and public data: mint and freeze authority, liquidity and LP status, the largest holders, bundled buys and a simulated sell. It returns a score and marks each check passed, unknown or failed. A check it cannot read is never counted as a pass. “Passed the safety check” means no hard check failed. It does not mean the token is safe, and it is not a recommendation to buy.",
  },
  {
    id: "beta-changes",
    question: "Can the product change during beta?",
    answer:
      "Yes. Features, limits and fees can change during public beta, and tools can be added, reworked or paused. Status labels on this site are updated as that happens, and current fees are shown in Telegram before you confirm a trade.",
  },
  {
    id: "risks",
    question: "What are the trading risks?",
    answer:
      "Crypto trading is high risk, and meme coins especially: prices can go to zero in seconds, liquidity can disappear, and Solana transactions cannot be reversed. Automated checks and alerts can be wrong, late or incomplete. Ripjaw is a tool, not financial advice. Only trade what you can afford to lose.",
  },
];

/** Label for a status, for server components that render a <StatusBadge>. */
export const statusLabel = (status: FeatureStatus) => featureStatusMeta[status].label;
