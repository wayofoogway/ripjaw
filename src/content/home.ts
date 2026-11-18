import "server-only";
import { featureStatusMeta, getFeature, site } from "@/config/site";

/*
 * Homepage copy: five short sections. Facts (statuses, the platform line,
 * early access) are read from the site config; this file holds the words
 * around them.
 */

const [lead, accent] = site.tagline.split(". ");
if (!lead || !accent) throw new Error('content/home: site.tagline must read "<lead>. <accent>"');

export const hero = {
  headline: { lead: `${lead}.`, accent },
  line: `${site.name} is a Solana trading bot inside Telegram. Trade, check token risk and manage your orders in one chat.`,
};

const radar = getFeature("meme-radar");

export const capabilities = {
  title: "What it does",
  items: [
    { name: "Trade", line: "Buy and sell Solana tokens from the chat, with limit orders and your own slippage." },
    { name: "Automate", line: "DCA, take profit, stop loss and copy trading, inside limits you set." },
    { name: "Research", line: "Token safety reports, wallet tracking and price alerts." },
    { name: "Account", line: "Wallets, positions and settings in one place." },
  ],
  /** Meme Radar gets one line, worded from its status in the config. */
  radarLine: `${radar.title} is ${featureStatusMeta[radar.status].label.toLowerCase()}.`,
  link: { label: "Every feature and its status", href: "/features/" },
};

export const safety = {
  title: "A check, not a guarantee.",
  lines: [
    "Paste a token address and Ripjaw reports what it could read: each check marked passed, unknown or failed.",
    "A pass is not a recommendation to buy.",
  ],
  link: { label: "How the Safety Check works", href: "/safety/" },
  screenshot: {
    alt: "Ripjaw Safety Check report for the token BONK in Telegram: incomplete, 60 out of 100, 10 of 15 checks read, with mint and freeze revoked and several items unread.",
    caption: "Safety Check in the Ripjaw bot. Sample data.",
  },
};

export const platform = site.platform;
