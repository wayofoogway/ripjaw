import "server-only";
import type { ResultMark } from "@/components/ui/result-mark";
import { featureStatusMeta, getFeature } from "@/config/site";
import { safety as homeSafety } from "@/content/home";

/*
 * Copy for /safety/. Thresholds and scores the owner has not confirmed are
 * described in words, never as numbers.
 */

export const intro = {
  title: "Safety Check",
  lede: "Ripjaw reads a token’s contract, liquidity and holders, then reports what it found. A check, not a guarantee.",
  screenshot: homeSafety.screenshot,
};

export const checks = {
  title: "What it checks",
  items: [
    { name: "Mint authority", reads: "Whether anyone can still create new tokens." },
    { name: "Freeze authority", reads: "Whether an authority can freeze token accounts." },
    { name: "Hidden tax", reads: "Whether the token takes a fee on transfers." },
    { name: "Metadata", reads: "Whether the name, image or links can still be changed." },
    { name: "Sell simulation", reads: "Whether a small test sell goes through. A token you can buy but not sell is a honeypot." },
    { name: "Liquidity", reads: "Whether the pool’s liquidity is burned or locked, or can be withdrawn." },
    { name: "Top holders", reads: "The share held by the largest wallets, apart from the pool." },
    { name: "Bundles", reads: "Whether linked wallets bought a large share of supply at launch." },
    { name: "Early wallets", reads: "Whether snipers, bundlers and insiders are still holding." },
    { name: "Dev wallet", reads: "What the deployer holds and has sold. Often unknown." },
    { name: "Socials", reads: "Website, X and Telegram links. Shown for context." },
  ],
};

export const results = {
  title: "Three results",
  items: [
    {
      mark: "pass",
      label: "Passed the safety check",
      meaning: "No hard check failed. It does not mean the token is safe or worth buying.",
    },
    {
      mark: "unknown",
      label: "Incomplete",
      meaning: "Some checks could not be read. Treat the gaps as open questions, not as passes.",
    },
    {
      mark: "fail",
      label: "Failed a hard check",
      meaning: "At least one hard check failed, and the report names it. It is not proof of a scam.",
    },
  ] satisfies { mark: ResultMark; label: string; meaning: string }[],
};

const blockFailedBuys = getFeature("block-failed-buys");

export const limits = {
  title: "What it cannot see",
  items: [
    { name: "Private bundles", detail: "Wallets linked off-chain, or supply split so it does not look connected." },
    { name: "What happens next", detail: "A deployer can sell, pull an unlocked pool or change a token after you read the report." },
    { name: "Social engineering", detail: "Fake endorsements, copied accounts and coordinated hype." },
    { name: "Bad or late data", detail: "Sources can be missing, delayed or manipulated. A report is a snapshot." },
  ],
  rule: "A missing check is not a pass.",
  /** Whether a failed hard check stops a manual buy, worded from the feature's status in the config. */
  manualBuys:
    blockFailedBuys.status === "early_access" || blockFailedBuys.status === "limited"
      ? "A manual buy is stopped when the token fails a hard check."
      : `A failed hard check does not yet stop a manual buy. Blocking it is ${featureStatusMeta[blockFailedBuys.status].label.toLowerCase()}.`,
};
