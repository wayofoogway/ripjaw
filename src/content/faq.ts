import "server-only";
import { featureStatusMeta, getFeature, site } from "@/config/site";
import { faq as homeFaq } from "./home";
import { refundStatement } from "./owner-facts";

/*
 * The full FAQ. The eight homepage answers are reused from `content/home.ts`
 * so the two pages cannot disagree; the rest are written here. Every answer
 * is plain text, because the same string feeds the FAQ structured data.
 */

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  /** Page with the longer explanation, linked under the answer. */
  more?: { label: string; href: string };
};

export type FaqGroup = { id: string; heading: string; entries: FaqEntry[] };

function fromHome(id: string, more?: FaqEntry["more"]): FaqEntry {
  const entry = homeFaq.find((item) => item.id === id);
  if (!entry) throw new Error(`faq content: the homepage FAQ has no entry "${id}"`);
  return { ...entry, more };
}

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** One sentence on whether a feature can be used today, read from its status in the site config. */
function availability(featureId: string): string {
  const feature = getFeature(featureId);
  switch (feature.status) {
    case "available_beta":
      return "It is available in the public beta.";
    case "limited_beta":
      if (!feature.limitation) throw new Error(`faq content: feature "${featureId}" is limited_beta without a limitation`);
      return `It is in limited beta: ${feature.limitation}`;
    case "in_development":
      return "It is in development and is not available yet.";
    case "planned":
      return "It is planned and is not built yet.";
    case "unverified":
      return "Its availability on the live public bot is still being confirmed.";
  }
}

/** "That is what X is for: <mechanism>. <availability>" */
function featureAnswer(featureId: string): string {
  const feature = getFeature(featureId);
  return `That is what ${feature.title} is for: ${lowerFirst(feature.summary)} ${availability(featureId)}`;
}

function radarBuysAnswer(): string {
  const confirmStep =
    "an alert has a Snipe button that opens a confirmation step, and nothing is bought until you confirm";
  switch (getFeature("meme-radar").status) {
    case "available_beta":
    case "limited_beta":
      return `Not unless you choose to. In Meme Radar, ${confirmStep}.`;
    case "in_development":
    case "planned":
    case "unverified":
      return `Meme Radar is not available yet, so it does not buy anything. In the workflow previewed on this site, ${confirmStep}. This website cannot place a trade at all.`;
  }
}

function referralAnswer(): string {
  const { referrals } = site;
  const rewards = referrals.rewards.pendingVerification
    ? referrals.rewards.pendingCopy
    : `Current rewards: ${referrals.rewards.items.map((item) => `${lowerFirst(item.label)} ${item.value}`).join("; ")}.`;
  return `${referrals.body} Links to this site work too: add your code as ?${referrals.queryParam}= and every Telegram button here carries it. ${rewards} Referral status: ${featureStatusMeta[referrals.status].label}.`;
}

const pricingRoute = { label: "Pricing", href: "/pricing/" };

const entries = {
  publicBeta: fromHome("public-beta"),
  availableToday: fromHome("available-today", { label: "All features and their status", href: "/features/" }),
  betaChanges: fromHome("beta-changes"),
  webApp: {
    id: "web-app",
    question: "Is there a web app?",
    answer:
      "No. Ripjaw runs inside Telegram. This website explains the product and links to the official bot. It has no sign-up, no wallet connection, no checkout and no trading.",
  },
  officialBot: {
    id: "official-bot",
    question: "How do I know I am using the real bot?",
    answer: `Check the handle: the only official bot is ${site.links.telegramBotHandle}, and every Telegram button on this site opens it. ${site.legal.antiImpersonation}`,
  },
  chains: {
    id: "chains",
    question: "Which chains does Ripjaw support?",
    answer: "Solana only.",
  },
  telegramOpen: {
    id: "telegram-open",
    question: "Do I need to keep Telegram open?",
    answer:
      "No. Ripjaw replies and alerts are Telegram messages, so they arrive like any other notification on your phone.",
  },

  cost: fromHome("cost", pricingRoute),
  otherFees: fromHome("other-fees", pricingRoute),
  accessIncludes: {
    id: "access-includes",
    question: `What comes with the ${site.access.priceLabel} access fee?`,
    answer: `${site.access.points.join(". ")}. These are the terms as currently specified for public beta.`,
  },
  wherePay: {
    id: "where-pay",
    question: "Where do I pay?",
    answer: `Inside the official Telegram bot, when it asks for the access fee. ${site.access.paymentNote} If a page or a person asks you to pay anywhere else, it is not Ripjaw.`,
  },
  refunds: { id: "refunds", question: "Can I get a refund?", answer: refundStatement },
  feeChanges: {
    id: "fee-changes",
    question: "Can fees change?",
    answer: `Yes. Fees can change during public beta. ${site.speedFees.pendingCopy}`,
  },

  existingWallet: {
    id: "existing-wallet",
    question: "Can I use a wallet I already have?",
    answer: featureAnswer("wallets"),
  },
  keys: {
    id: "keys",
    question: "How are my wallet keys handled?",
    answer: `Ripjaw trades from a wallet inside the bot, so the bot holds that wallet’s key. ${getFeature("account-security").summary} ${availability("account-security")} Whoever has a key controls the funds: export yours, keep it offline and never share it. ${site.legal.antiImpersonation}`,
  },
  copyTraders: {
    id: "copy-traders",
    question: "Can I copy other traders?",
    answer: featureAnswer("copy-trade"),
  },
  tradeSpeed: {
    id: "trade-speed",
    question: "How fast are trades?",
    answer:
      "You choose a speed mode, a priority fee and an optional tip in the bot’s settings. A faster setting costs more and is never a guarantee: how quickly a trade lands depends on the Solana network at that moment.",
  },
  referrals: { id: "referrals", question: "How do referrals work?", answer: referralAnswer() },

  memeRadar: fromHome("meme-radar", { label: "Meme Radar preview", href: getFeature("meme-radar").href }),
  radarBuys: { id: "radar-buys", question: "Will Meme Radar buy tokens for me?", answer: radarBuysAnswer() },
  radarDemo: {
    id: "radar-demo",
    question: "Are the Meme Radar alerts on this site real?",
    answer: `No. Every alert, token and post in the Meme Radar preview is invented and labelled “${site.demo.label}”. It illustrates the intended workflow. It is not a feed.`,
  },

  tokenSafety: fromHome("token-safety", { label: "How the Safety Check works", href: getFeature("safety-check").href }),
  passSafe: {
    id: "pass-safe",
    question: "Does a pass mean a token is safe?",
    answer:
      "No. “Passed the safety check” means no hard check failed when the report ran. The check cannot see private bundles or what a deployer does next, and a token that passes can still go to zero. It is not a recommendation to buy.",
  },
  honeypotBundle: {
    id: "honeypot-bundle",
    question: "What is a honeypot? What is a bundle?",
    answer:
      "A honeypot is a token you can buy but cannot sell. A bundle is when wallets linked to the launcher buy a large share of the supply in the first moments, so they can sell into later buyers. The Safety Check looks for both and can miss either.",
  },

  risks: fromHome("risks", { label: "Risk disclosure", href: "/risk/" }),
  advice: {
    id: "advice",
    question: "Is Ripjaw financial advice?",
    answer:
      "No. Ripjaw is a software tool, not a financial adviser, broker or exchange. Its reports, alerts and labels are automated and can be wrong. The decisions, and their results, are yours.",
  },
} satisfies Record<string, FaqEntry>;

/** The questions about money, shown on the pricing page as well. */
export const pricingFaq: FaqEntry[] = [
  entries.cost,
  entries.otherFees,
  entries.accessIncludes,
  entries.wherePay,
  entries.refunds,
  entries.feeChanges,
];

export const faqGroups: FaqGroup[] = [
  {
    id: "beta",
    heading: "Public beta",
    entries: [
      entries.publicBeta,
      entries.availableToday,
      entries.betaChanges,
      entries.webApp,
      entries.officialBot,
      entries.chains,
      entries.telegramOpen,
    ],
  },
  { id: "fees", heading: "Price and fees", entries: pricingFaq },
  {
    id: "bot",
    heading: "Using the bot",
    entries: [entries.existingWallet, entries.keys, entries.copyTraders, entries.tradeSpeed, entries.referrals],
  },
  { id: "meme-radar", heading: "Meme Radar", entries: [entries.memeRadar, entries.radarBuys, entries.radarDemo] },
  { id: "safety", heading: "Safety Check", entries: [entries.tokenSafety, entries.passSafe, entries.honeypotBundle] },
  { id: "risk", heading: "Risk", entries: [entries.risks, entries.advice] },
];

export const faqPage = {
  eyebrow: "FAQ",
  title: "Questions about the Ripjaw beta, answered plainly.",
  lede: "What it costs, what works today, how the Safety Check reads a token, and what can go wrong.",
  jumpLabel: "Jump to",
};
