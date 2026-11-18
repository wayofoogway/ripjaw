import "server-only";
import type { ResultMark } from "@/components/ui/result-mark";
import { safety as homeSafety } from "@/content/home";

/*
 * Copy for /safety/. Verdict names and meanings are shared with the homepage
 * section (`safety` in content/home.ts); this file adds the detail the
 * dedicated page needs. Thresholds and scores the owner has not confirmed
 * are described in words, never as numbers.
 */

export const resultMarks: Record<ResultMark, { label: string; meaning: string }> = {
  pass: { label: "Passed", meaning: "The check was read and found nothing against the token." },
  unknown: { label: "Unknown", meaning: "The check could not be read. It is never counted as a pass." },
  fail: { label: "Failed", meaning: "The check was read and found a problem. The report names it." },
  info: { label: "Reported", meaning: "A figure shown for context, without a pass or fail." },
};

export const hero = {
  eyebrow: homeSafety.eyebrow,
  title: homeSafety.principle,
  lede: "The Safety Check reads a token’s contract, liquidity and holders, then reports what it found: passed, unknown or failed, with the reason. This page lists every check, shows what each result looks like, and says what the check cannot see.",
  secondary: { label: "See every check", href: "#checks" },
  note: "Not financial advice. A passing check is not a recommendation to buy.",
  phoneAlt:
    "Ripjaw Safety Check in Telegram for the token BONK: incomplete, 60 out of 100, 10 of 15 checks read. Mint and freeze revoked, LP locked, sell test passed; metadata, dev wallet and socials unread.",
  caption: "Safety Check in the Ripjaw bot · sample data",
  legendLabel: "How results are marked",
};

export const sectionNav = {
  label: "On this page",
  items: [
    { id: "report", label: "The report" },
    { id: "checks", label: "Every check" },
    { id: "results", label: "Results" },
    { id: "limits", label: "Limits" },
    { id: "glossary", label: "Glossary" },
  ],
};

export const anatomy = {
  eyebrow: "The report",
  title: "One message, read top to bottom.",
  lede: "Paste a Solana token address in the bot and the full report comes back as a single Telegram message. Each block answers a different question.",
  caption: "Full report recreated from the Ripjaw bot · sample token",
  marksNote: "The marks on the right of each line are added by this page to show how the line is read.",
  report: {
    title: "Full safety report",
    address: "Dg7Vx3mQe9tK2rLpYc8nW4hZsA6uJfB1oT5qpump",
    time: "9:41",
    sections: [
      {
        emoji: "🔒",
        title: "Contract",
        lines: [
          { text: "Mint authority: revoked", mark: "pass" },
          { text: "Freeze authority: revoked", mark: "pass" },
        ],
        note: {
          title: "Who still controls the token",
          body: "Whether anyone can create more supply or freeze your tokens. “Revoked” means that power has been given up.",
        },
      },
      {
        emoji: "💧",
        title: "Liquidity",
        lines: [
          { text: "LP / curve: unknown", mark: "unknown" },
          { text: "Pump curve progress: unknown", mark: "unknown" },
          { text: "Sell quote: pass at 5% slippage (500 bps).", mark: "pass" },
          { text: "Pool liquidity: $4K", mark: "info" },
          { text: "Market cap: $12K", mark: "info" },
          { text: "Pool age: created 2026-11-17", mark: "info" },
          { text: "LP: burned", mark: "pass" },
        ],
        note: {
          title: "Whether you can get out",
          body: "A test sell is quoted, and the pool’s liquidity is checked for a burn or a lock. Two lines here could not be read, and the report says so.",
        },
      },
      {
        emoji: "👥",
        title: "Holders",
        lines: [
          { text: "Largest outsider: 4.0%", mark: "info" },
          { text: "Top holders: unknown", mark: "unknown" },
          { text: "Dev wallet: unknown (not labeled on-chain)", mark: "unknown" },
        ],
        note: {
          title: "Who holds the supply",
          body: "How concentrated the token is and what the deployer’s wallet is doing. Often incomplete on a new token.",
        },
      },
      {
        emoji: "🌐",
        title: "Socials",
        lines: [{ text: "Socials: none from DexScreener", mark: "info" }],
        note: {
          title: "What the project links to",
          body: "Website, X and Telegram links, when a public source lists them. Links existing proves very little; links missing is only a weak signal.",
        },
      },
      {
        title: "Score breakdown",
        lines: [{ text: "+78 Score (stored total)", mark: "info" }],
        note: {
          title: "A score out of 100",
          body: "A summary of the checks that could be read. Lower-concern is not the same as low risk.",
        },
      },
      {
        title: "Verdict",
        lines: [
          {
            text: "Score 78 is in the lower-concern band. Freeze is revoked and no wallet holds more than half. Unchecked items were not treated as a pass.",
            mark: "info",
          },
          {
            text: "Heuristic only. Not financial advice. It does not see private bundles, social rugs, or future pool pulls.",
            mark: "info",
          },
        ],
        note: {
          title: "The verdict, and its reason",
          body: "The report ends by saying which way the checks point and why, followed by its own caveat. On this site a positive verdict is called “Passed the safety check”. It is not a recommendation to buy.",
        },
      },
    ] satisfies {
      emoji?: string;
      title: string;
      lines: { text: string; mark: ResultMark }[];
      note: { title: string; body: string };
    }[],
  },
};

export const checks = {
  eyebrow: "Every check",
  title: "What is read, why it matters, and what a problem looks like.",
  lede: "Checks read on-chain and public data at the moment you ask. Each one is reported as passed, unknown or failed.",
  columns: { check: "Check", reads: "What it reads", why: "Why it matters", problem: "What a problem looks like" },
  groups: [
    {
      title: "Contract",
      items: [
        {
          name: "Mint authority",
          reads: "Whether anyone can still create new tokens.",
          why: "New supply dilutes every holder.",
          problem: "Mint authority is still active (“mint not revoked”).",
        },
        {
          name: "Freeze authority",
          reads: "Whether an authority can freeze token accounts.",
          why: "A frozen account cannot sell or transfer.",
          problem: "Freeze authority is still active.",
        },
        {
          name: "Hidden tax",
          reads: "Whether the token takes a fee on transfers.",
          why: "A transfer fee comes out of every trade you make.",
          problem: "A transfer tax is present.",
        },
        {
          name: "Metadata mutability",
          reads: "Whether the name, image or links can still be changed.",
          why: "A token can be re-dressed after launch to look like something else.",
          problem: "Metadata can still be changed.",
        },
      ],
    },
    {
      title: "Liquidity and selling",
      items: [
        {
          name: "Sell simulation",
          reads: "A small test sell is quoted, and the cost of buying then selling is compared.",
          why: "A token you can buy but cannot sell is a honeypot.",
          problem: "The sell simulation fails, or the round trip costs far more than normal fees.",
        },
        {
          name: "Liquidity and LP lock",
          reads: "Whether the pool’s liquidity is burned or locked, and how far a launch curve has progressed.",
          why: "Unlocked liquidity can be withdrawn, leaving nothing to sell into.",
          problem: "LP is neither burned nor locked.",
        },
      ],
    },
    {
      title: "Holders and wallets",
      items: [
        {
          name: "Top holders",
          reads: "The share held by the ten largest wallets, apart from the pool and exchange wallets.",
          why: "Concentrated supply can be sold all at once.",
          problem: "A few wallets hold a large share of supply.",
        },
        {
          name: "Bundles",
          reads: "Whether linked wallets bought a large share of supply in the first moments.",
          why: "Bundled supply can be sold into later buyers.",
          problem: "The launch is marked “bundled”.",
        },
        {
          name: "Snipers, bundlers and insiders",
          reads: "Whether early wallets of these kinds are still holding.",
          why: "They often sell to the first wave of buyers.",
          problem: "These wallets still hold a meaningful share.",
        },
        {
          name: "Dev wallet",
          reads: "The deployer’s holdings, whether it has sold, how it was funded, and its earlier launches.",
          why: "The deployer’s history is one of the few signals about intent.",
          problem: "A large dev holding or heavy selling. Often unknown, because many dev wallets are not labelled on-chain.",
        },
      ],
    },
    {
      title: "Project",
      items: [
        {
          name: "Socials",
          reads: "Website, X and Telegram links, and how old the website’s domain is.",
          why: "Missing or brand-new links are a weak warning. Present links prove little.",
          problem: "Shown for context rather than as a hard fail.",
        },
      ],
    },
  ],
};

export const results = {
  eyebrow: "Results",
  title: "Three results, and what each one does not mean.",
  lede: "Every report lands on one of three results. The wording matters, so here is each with the lines that decide it.",
  caption: homeSafety.excerptNote,
  decidedBy: "Decided by",
  notMeanLabel: "It does not mean",
  /** Keyed by the verdict tones in content/home.ts. */
  detail: {
    pass: {
      lines: [
        { text: "Mint authority: revoked", mark: "pass" },
        { text: "Freeze authority: revoked", mark: "pass" },
        { text: "Sell quote: pass at 5% slippage (500 bps).", mark: "pass" },
        { text: "LP: burned", mark: "pass" },
        { text: "Top holders: unknown", mark: "unknown" },
        { text: "Unchecked items were not treated as a pass.", mark: "info" },
      ],
      notMean: "The token is safe, will hold its price, or is worth buying. Unread items are still open questions.",
    },
    unknown: {
      lines: [
        { text: "INCOMPLETE · 60/100", mark: "unknown" },
        { text: "Checked 10 of 15", mark: "info" },
        { text: "Metadata unread", mark: "unknown" },
        { text: "Dev unknown", mark: "unknown" },
        { text: "Website unread · X unread · Telegram unread", mark: "unknown" },
        { text: "Why: Mint and freeze are revoked and a test sell worked.", mark: "info" },
      ],
      notMean: "The token passed. A check that could not be read may be hiding a problem.",
    },
    fail: {
      lines: [
        { text: "Mint authority: revoked", mark: "pass" },
        { text: "Freeze authority: revoked", mark: "pass" },
        { text: "Sell quote: fail at 5% slippage (500 bps).", mark: "fail" },
        { text: "+14 Score (stored total)", mark: "info" },
        { text: "Sell simulation failed.", mark: "fail" },
      ],
      notMean: "Proof of a scam. It means one hard check failed at that moment, and the report tells you which.",
    },
  } satisfies Record<"pass" | "unknown" | "fail", { lines: { text: string; mark: ResultMark }[]; notMean: string }>,
};

export const limits = {
  eyebrow: "Limits",
  title: "What the check cannot see.",
  lede: homeSafety.principleBody,
  items: [
    {
      title: "Private bundles",
      body: "Wallets that are linked off-chain, or supply that is split so it does not look connected.",
    },
    {
      title: "What happens next",
      body: "A deployer can sell, pull an unlocked pool or change a token after you have read the report.",
    },
    {
      title: "Social engineering",
      body: "Fake endorsements, copied accounts and coordinated hype are outside what on-chain data shows.",
    },
    {
      title: "Bad or late data",
      body: "On-chain and public sources can be missing, delayed or manipulated. A report is a snapshot of the moment you asked.",
    },
  ],
  rule: "A missing check is not a pass.",
  manualBuys: {
    title: "On manual buys",
    link: { label: "All features", href: "/features/" },
  },
};

export const glossary = {
  eyebrow: "Glossary",
  title: "The words a report uses.",
  terms: [
    { id: "honeypot", term: "Honeypot", definition: "A token you can buy but cannot sell." },
    { id: "bundle", term: "Bundle", definition: "Linked wallets buying a large share of supply at launch." },
    { id: "mint-authority", term: "Mint authority", definition: "The power to create more tokens. If it is active, supply can grow." },
    { id: "freeze-authority", term: "Freeze authority", definition: "The power to freeze token accounts. If it is active, your tokens can be frozen." },
    { id: "lp", term: "LP burned or locked", definition: "The pool’s liquidity cannot be withdrawn by the deployer." },
    { id: "rug-pull", term: "Rug pull", definition: "Liquidity is removed or supply is dumped, leaving holders with nothing to sell into." },
    { id: "sniper", term: "Sniper", definition: "A wallet, usually automated, that buys in the first moments of a launch." },
    { id: "insider", term: "Insider", definition: "A wallet linked to the deployer that received or bought supply early." },
    { id: "dev-wallet", term: "Dev wallet", definition: "The wallet that created the token." },
    { id: "round-trip", term: "Round-trip tax", definition: "What you lose by buying and immediately selling, beyond normal fees." },
    { id: "slippage", term: "Slippage", definition: "The gap between the quoted price and the price a trade fills at." },
    { id: "copycat", term: "Copycat", definition: "A token reusing another’s name or ticker to be mistaken for it." },
    { id: "metadata", term: "Metadata", definition: "A token’s name, image and links. Mutable metadata can change after launch." },
    { id: "heuristic", term: "Heuristic", definition: "A rule of thumb an automated check applies. It can be wrong." },
  ],
};
