import "server-only";
import { featureStatusMeta, visibleFeatures, type FeatureStatus } from "@/config/site";

/*
 * Copy for /features/. Names, one-line summaries and statuses come from the
 * site config; this file adds the few words around them.
 */

export const intro = {
  title: "Features",
  lede: "Every Ripjaw tool, and where it stands today.",
  screenshot: {
    alt: "Ripjaw main menu in Telegram, a grid of buttons including Buy/Sell, Limit Orders, Copy Trade, Snipe, Safety Check, Settings and Wallet Check.",
    caption: "Main menu in the Ripjaw bot.",
  },
};

/** The statuses in use on the page, in a fixed order, each with what it means. */
const STATUS_ORDER: FeatureStatus[] = ["early_access", "limited", "unverified", "in_development", "planned"];
const inUse = new Set(visibleFeatures().map((feature) => feature.status));

export const legend = {
  label: "Status labels",
  items: STATUS_ORDER.filter((status) => inUse.has(status)).map((status) => ({ status, ...featureStatusMeta[status] })),
};

/** A link under a feature's summary, for the tools that have their own page. */
export const featureLinks: Record<string, { label: string; href: string }> = {
  "safety-check": { label: "How the Safety Check works", href: "/safety/" },
  "block-failed-buys": { label: "Limits of the Safety Check", href: "/safety/#limits" },
};

export const limitationLabel = "Limitation";

for (const id of Object.keys(featureLinks)) {
  if (!visibleFeatures().some((feature) => feature.id === id)) {
    throw new Error(`content/features: link written for a feature that is not shown: "${id}"`);
  }
}
