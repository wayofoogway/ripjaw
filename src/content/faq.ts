import "server-only";
import { featureStatusMeta, getFeature, site } from "@/config/site";

/*
 * The FAQ. Every answer is plain text, because the same string is rendered on
 * the page and written into the FAQ structured data. Answers that depend on
 * the early access state or on a feature's status are worded from the config.
 */

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  /** Page with the longer explanation, linked under the answer. */
  more?: { label: string; href: string };
};

function earlyAccessAnswer(): string {
  switch (site.earlyAccess.state) {
    case "on_hold":
      return `${site.name} is not open to everyone yet. Early access is the first release. ${site.earlyAccess.onHoldLine}`;
    case "open":
      return `${site.name} is not open to everyone yet. Early access is the first release. To be told when it opens, leave your email address in the form on this site.`;
  }
}

/** One sentence on whether a feature can be used, read from its status in the site config. */
function availability(featureId: string): string {
  const feature = getFeature(featureId);
  switch (feature.status) {
    case "early_access":
      return "It is confirmed for early access.";
    case "limited":
      if (!feature.limitation) throw new Error(`faq content: feature "${featureId}" is limited without a limitation`);
      return `It is in early access with a limitation: ${feature.limitation}`;
    case "in_development":
      return "It is in development and is not available yet.";
    case "planned":
      return "It is planned and is not built yet.";
    case "unverified":
      return "It is still being confirmed for early access.";
  }
}

const label = (status: keyof typeof featureStatusMeta) => `“${featureStatusMeta[status].label}”`;

export const faq: FaqEntry[] = [
  {
    id: "what",
    question: `What is ${site.name}?`,
    answer: `${site.productLine} You trade, check token risk and manage orders from one chat.`,
  },
  { id: "early-access", question: "How do I get early access?", answer: earlyAccessAnswer() },
  {
    id: "features",
    question: "Which features will be in early access?",
    answer: `Each tool on the Features page carries its status. ${label("early_access")} means it is confirmed for the early access release. ${label("unverified")} means it is still being confirmed. Anything marked ${label("in_development")} or ${label("planned")} is not available yet.`,
    more: { label: "Features", href: "/features/" },
  },
  {
    id: "meme-radar",
    question: `Is ${getFeature("meme-radar").title} available?`,
    answer: availability("meme-radar"),
  },
  { id: "web", question: "Is there a web version?", answer: site.platform.line },
  { id: "chains", question: `Which chains does ${site.name} support?`, answer: "Solana only." },
  {
    id: "safety-check",
    question: "How does the Safety Check work?",
    answer:
      "Paste a token address and the Safety Check reads on-chain and public data: mint and freeze authority, liquidity, the largest holders, bundled buys and a test sell. Each check is marked passed, unknown or failed. A check it cannot read is never counted as a pass.",
    more: { label: "Safety Check", href: "/safety/" },
  },
  {
    id: "pass-safe",
    question: "Does a pass mean a token is safe?",
    answer:
      "No. “Passed the safety check” means no hard check failed when the report ran. A token that passes can still go to zero. It is not a recommendation to buy.",
  },
  {
    id: "keys",
    question: "How are my wallet keys handled?",
    answer: `${site.name} trades from a wallet inside the bot, so the bot holds that wallet’s key. ${getFeature("account-security").summary} Whoever has a key controls the funds: keep a copy offline and never share it.`,
  },
  {
    id: "official",
    question: `How do I know it is really ${site.name}?`,
    answer: `${site.legal.antiImpersonation} ${site.legal.websiteNote}`,
  },
  {
    id: "risks",
    question: "What are the risks?",
    answer:
      "Crypto trading is high risk, and meme coins especially. Prices can go to zero in seconds, liquidity can disappear, and Solana transactions cannot be reversed. Automated checks and alerts can be wrong, late or incomplete.",
    more: { label: "Risk disclosure", href: "/risk/" },
  },
  {
    id: "advice",
    question: `Is ${site.name} financial advice?`,
    answer: `No. ${site.name} is a software tool, not a financial adviser, broker or exchange. The decisions, and their results, are yours.`,
  },
];

export const faqPage = {
  title: "FAQ",
  lede: `Short answers about ${site.name}.`,
};
