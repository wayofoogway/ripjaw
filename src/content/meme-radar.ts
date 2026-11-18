import "server-only";
import type { ResultMark } from "@/components/ui/result-mark";
import { featureStatusMeta, getFeature, site, type FeatureStatus } from "@/config/site";
import { faq as homeFaq, memeRadar as homeRadar } from "@/content/home";

/*
 * Copy for /meme-radar/. The demo post, tokens and report lines are the ones
 * the homepage chapter uses (`memeRadar` in content/home.ts), so the two never
 * disagree. Everything that depends on whether Meme Radar is available is
 * derived from its status in the site config.
 */

const radar = getFeature("meme-radar");
const isLive = radar.status === "available_beta" || radar.status === "limited_beta";

function availabilityNote(status: FeatureStatus): string {
  switch (status) {
    case "available_beta":
      return "Meme Radar is available in the public beta. The screens on this page use sample data.";
    case "limited_beta":
      return `Meme Radar is in limited beta: ${radar.limitation} The screens on this page use sample data.`;
    case "in_development":
    case "unverified":
      return "Meme Radar is not part of the public beta yet. Everything on this page is a preview with demo data.";
    case "planned":
      return "Meme Radar is planned and is not built yet. Everything on this page is a concept with demo data.";
  }
}

export const previewTag = homeRadar.previewTag;

export const hero = {
  eyebrow: isLive
    ? `${radar.title} — ${featureStatusMeta[radar.status].label}`
    : `${radar.title} — Preview / ${featureStatusMeta[radar.status].label}`,
  title: isLive ? "Meme Radar, step by step." : "Meme Radar, in preview.",
  lede: "Meme Radar is being built to turn a post from a watched account into a short, risk-checked list in Telegram. This page walks through the intended workflow with demo data, and says plainly what it will not do.",
  secondary: { label: "Walk through the workflow", href: "#workflow" },
  note: availabilityNote(radar.status),
  phoneAlt:
    "Preview with sample data: a phone lock screen showing a Ripjaw notification that a sample account just posted, with 2 tokens that passed checks and 4 flagged.",
  chip: { title: "Nothing here is live", body: "One invented post, followed through four steps." },
};

export const sectionNav = {
  label: "On this page",
  items: [
    { id: "workflow", label: "Workflow" },
    { id: "screens", label: "Screens" },
    { id: "controls", label: "Controls" },
    { id: "limits", label: "Limits" },
    { id: "questions", label: "Questions" },
  ],
};

export const ledger = {
  label: "Where Meme Radar stands",
  items: [
    {
      term: "What exists",
      detail: "The workflow design and its Telegram screens, shown here as a preview.",
    },
    {
      term: "What it still needs",
      detail:
        "A production connection that reads posts from X, an AI read of each post’s text and image, and end-to-end testing on the live bot.",
    },
    {
      term: "What this page shows",
      detail: "An invented post, invented tokens and invented scores. There is no live feed and no track record here.",
    },
  ],
};

export const workflow = {
  eyebrow: "Workflow",
  title: "Four steps, in the order they happen.",
  lede: "Each step narrows the list. What reaches you at the end is a message to read, not a trade that has been made.",
  detailLabels: { reads: "What it reads", signals: "Match signals", reasons: "Reasons a candidate is flagged" },
  post: {
    step: homeRadar.acts[0]!.step,
    title: "A watched account posts",
    body: "Meme Radar is designed to follow a list of accounts. When one of them posts, it reads the text and the image and reduces them to the idea a token would be named after.",
    reads: ["The text of the post", "The attached image", "The time of the post: only tokens created after it count"],
    caveat: "Watched accounts are not named on this site, and no account is affiliated with Ripjaw.",
    accountLabel: "Sample account",
    imageLabel: "Sample image",
    inputs: ["Text", "Sample image"],
    readAsLabel: "Read as",
    idea: "Doge meme is back",
    keywordsLabel: "Keywords",
    keywords: ["doge", "meme"],
  },
  match: {
    step: homeRadar.acts[1]!.step,
    title: "Tokens launched after the post are matched",
    body: "It gathers tokens created after the post and compares each one with the idea: by name, by ticker, by keywords and, where a token has an image, by how closely it resembles the one in the post.",
    signals: ["Name", "Ticker", "Keywords", "Image similarity"],
    caveat: "Matching is a best effort. It can miss a token, and it can surface one that has nothing to do with the post.",
    chartLabel: "Demo tokens by minutes after the post",
    postLabel: "Post",
    minutes: [1, 2, 3, 4, 5],
  },
  check: {
    step: homeRadar.acts[2]!.step,
    title: "Every candidate goes through the Safety Check",
    body: "Each match is run through the same Safety Check you can use on any token. A candidate that fails a hard check is listed with the reason. One whose checks could not be read is marked unknown, and an unknown is never counted as a pass.",
    reasons: [
      { term: "honeypot", detail: "It can be bought but a test sell fails." },
      { term: "mint not revoked", detail: "More supply can still be created." },
      { term: "bundled", detail: "Linked wallets took a large share of supply at launch." },
      { term: "copycat", detail: "It reuses the name or ticker of an earlier match." },
    ],
    link: { label: "How the Safety Check works", href: getFeature("safety-check").href },
    tableLabel: "Demo check results for each candidate",
    columns: ["Sell test", "Mint", "Bundles", "Original"],
    tokenColumn: "Token",
    resultColumn: "Result",
    /** One row of marks per token in `memeRadar.tokens`, in the same order. */
    marks: [
      ["pass", "pass", "pass", "pass"],
      ["pass", "pass", "pass", "pass"],
      ["fail", "pass", "pass", "pass"],
      ["pass", "fail", "pass", "pass"],
      ["pass", "pass", "fail", "pass"],
      ["pass", "pass", "pass", "fail"],
      ["unknown", "pass", "unknown", "pass"],
    ] satisfies ResultMark[][],
  },
  alert: {
    step: homeRadar.acts[3]!.step,
    title: "The alert reaches you, and you decide",
    body: "The result is one Telegram message: the post, the candidates that passed, and the flagged ones with the reason. Snipe buttons appear only beside candidates that passed, and tapping one opens a confirmation step. Nothing is bought until you confirm.",
    caption: "Alert recreated from the Ripjaw bot’s preview · sample data",
    notes: [
      { title: "The post", body: "Which account posted and what it said, with a link to open the post." },
      {
        title: "Top picks",
        body: "Candidates that passed, ranked, with the figures used to rank them. A candidate with unknown checks is not listed as a pick.",
      },
      { title: "Flagged", body: "Candidates that failed a check, each with its reason. They get a report button and no Snipe button." },
      { title: "Snipe buttons", body: "Preset sizes or a custom one. Each opens a confirmation message before anything is sent." },
    ],
    message: {
      postedSuffix: "just posted",
      openPost: "Open post",
      picksLabel: "Top picks",
      picksMeta: "2 passed · watching 30m",
      /** Figures shown beside each passed candidate in the kit's preview alert. */
      pickStats: [
        "MC $12K · Liq $4K · 1m · score 78 · match 100% · original",
        "MC $12K · Liq $4K · 0m · score 78 · match 50% · original",
      ],
      flaggedLabel: "Flagged",
      footer: "Not a sure buy. Not financial advice.",
      time: "9:42",
      snipeSizes: ["0.1", "0.5", "1"],
      customLabel: "Custom",
      reportLabel: "report",
      refreshLabel: "Refresh",
      menuLabel: "Menu",
    },
  },
};

export const screens = {
  eyebrow: "Preview screens",
  title: "The same alert on three screens.",
  lede: "These are the Telegram screens Meme Radar is designed around, rendered with sample data.",
  hint: "Swipe to see all three",
  listLabel: "Meme Radar preview screens",
  items: [
    {
      asset: "phoneLockscreenAlert",
      title: "It arrives as a notification",
      body: "An alert is a Telegram message, so it shows up on the lock screen like any other.",
      alt: hero.phoneAlt,
    },
    {
      asset: "phoneRadarAlert",
      title: "The alert lists what passed and what did not",
      body: "Top picks with Snipe buttons, flagged candidates with their reasons.",
      alt: "Preview with sample data: a Meme Radar alert in Telegram for a post by a sample account, listing two top picks with Snipe buttons and four flagged tokens with the reason for each.",
    },
    {
      asset: "phoneSnipeConfirm",
      title: "A Snipe asks before it sends",
      body: homeRadar.confirmNote,
      alt: "Preview with sample data: a Meme Radar alert in Telegram followed by a confirmation message asking “Snipe 0.1 SOL of $DOGE?” with Snipe now and Cancel buttons.",
    },
  ] satisfies { asset: "phoneLockscreenAlert" | "phoneRadarAlert" | "phoneSnipeConfirm"; title: string; body: string; alt: string }[],
};

export const controls = {
  eyebrow: "Controls",
  title: "Designed to stay under your control.",
  lede: isLive
    ? "The settings that shape what Meme Radar sends you and what it is allowed to do."
    : "These settings are part of the design. They are listed here as intended behaviour, not as something you can use today.",
  items: [
    {
      icon: "accounts",
      title: "Your accounts too",
      body: "Add accounts to watch and mute the ones you do not care about.",
    },
    {
      icon: "quiet",
      title: "Quiet hours",
      body: "Choose hours when alerts are held back.",
    },
    {
      icon: "confirm",
      title: "A confirm on every Snipe",
      body: "A Snipe uses the slippage, priority fee and tip you have already saved, and asks before it sends.",
    },
    {
      icon: "double-tap",
      title: "Double-tap protection",
      body: "Tapping Snipe twice, or on two devices at once, is meant to send one buy.",
    },
    {
      icon: "auto",
      title: "Auto-snipe is opt-in",
      body: "Off unless you turn it on. If you do, it is limited by a size and a daily cap that you set. Automated buying acts without a confirmation and carries extra risk.",
      tag: "Off by default",
    },
  ] satisfies { icon: "accounts" | "quiet" | "confirm" | "double-tap" | "auto"; title: string; body: string; tag?: string }[],
};

export const limits = {
  eyebrow: "Limits",
  title: "What Meme Radar is not.",
  lede: homeRadar.disclaimer,
  items: [
    { title: "Not a live feed", body: "Nothing on this page updates. Every post, token and score is fixed sample text." },
    { title: "Not complete", body: "Matching can miss a token and can include one that is unrelated to the post." },
    { title: "Not a recommendation", body: "A candidate that passed the checks is not a sure buy. The checks are heuristics and can be wrong." },
    { title: "Not instant", body: "Alerts would depend on third-party data. They can arrive late, or not at all." },
    { title: "Not affiliated", body: "Ripjaw is not affiliated with, endorsed by or sponsored by any account Meme Radar may watch." },
  ],
  trackRecordNote: "Until that page exists, this site shows no results or statistics for Meme Radar.",
};

function operationalAnswer(): string {
  const entry = homeFaq.find((item) => item.id === "meme-radar");
  if (!entry) throw new Error('content/meme-radar: the homepage FAQ has no "meme-radar" entry');
  return entry.answer;
}

export const questions = {
  eyebrow: "Questions",
  title: "Straight answers about the preview.",
  items: [
    { id: "operational", question: "Is Meme Radar operational?", answer: operationalAnswer() },
    {
      id: "buys-for-me",
      question: "Would Meme Radar buy for me?",
      answer:
        "Not by default. The design is that you tap Snipe on an alert and then confirm. An optional auto-snipe setting is part of the design; it stays off unless you turn it on, and it is limited by a size and a daily cap you set.",
    },
    {
      id: "accounts",
      question: "Which accounts would it watch?",
      answer:
        "A list of large accounts, plus accounts you add yourself. They are not named on this site, and none of them is affiliated with Ripjaw.",
    },
    {
      id: "telegram-open",
      question: "Would I need to keep Telegram open?",
      answer: "No. Alerts are Telegram messages, so they arrive as normal notifications.",
    },
    {
      id: "passed-means",
      question: "Does a candidate that passed mean it is fine to buy?",
      answer:
        "No. It means no hard check failed at the moment the token was read. The Safety Check cannot see private bundles or what a deployer does next, and most meme coins lose their value.",
    },
    ...(isLive
      ? []
      : [
          {
            id: "when",
            question: "When will it be available?",
            answer: `There is no date. When Meme Radar has been verified on the live public bot, its label on this site changes from “${featureStatusMeta[radar.status].label}”.`,
          },
        ]),
  ],
};

export const demoTokens = homeRadar.tokens;
export const resultGroups = homeRadar.resultGroups;
export const demoPost = { handle: site.demo.sampleHandle, text: site.demo.samplePost, label: site.demo.label };
