import "server-only";
import { featureStatusMeta, getFeature, site } from "@/config/site";

/*
 * Docs page copy. The command list follows the kit's command reference. Each
 * group reads the status of the features it belongs to from the site config,
 * so a status change there changes the label here. Meme Radar's commands are
 * not listed: it is in development and the site shows no preview of it.
 */

export type DocsCommand = {
  /** What the copy button copies and what the visitor types first. */
  command: string;
  /** Values the visitor adds after the command, shown beside it and never copied. */
  args?: string;
  description: string;
};

export type DocsGroup = {
  id: string;
  heading: string;
  /** Labels of the distinct statuses of the features these commands belong to. */
  statusLabels: string[];
  commands: DocsCommand[];
};

function group(id: string, heading: string, featureIds: string[], commands: DocsCommand[]): DocsGroup {
  const statuses = [...new Set(featureIds.map((featureId) => getFeature(featureId).status))];
  return { id, heading, statusLabels: statuses.map((status) => featureStatusMeta[status].label), commands };
}

export const docs = {
  title: "Docs",
  lede: `The ${site.name} bot’s commands, written out as text you can copy.`,

  usingCommands: {
    id: "using-commands",
    heading: "How commands work",
    paragraphs: [
      `Commands are messages you send in your chat with the ${site.name} bot in Telegram. Access to the bot opens with early access.`,
      "Words in angle brackets stand for a value you type, such as a token’s mint address or a wallet address. The copy button copies the command without them.",
    ],
    statusLink: { label: "What the status labels mean", href: "/features/" },
  },

  statusPrefix: "Status",

  groups: [
    group("menu-and-help", "Menu and help", ["guide", "settings"], [
      { command: "/start", description: "Start the bot and open the main menu." },
      { command: "/menu", description: "Open the main menu." },
      { command: "/help", description: "Show help." },
      { command: "/guide", description: "Open the built-in guide for new traders." },
      { command: "/settings", description: "Open the Settings hub." },
      { command: "/cancel", description: "Cancel the prompt you are in." },
    ]),
    group("wallets", "Wallets", ["wallets", "account-security"], [
      { command: "/wallet", description: "Create, import, export and switch wallets." },
    ]),
    group("trading", "Trading", ["buy-sell", "limit-orders", "dca", "portfolio"], [
      { command: "/buy", description: "Buy a token." },
      { command: "/sell", description: "Sell a token." },
      { command: "/positions", description: "Open positions and profit or loss." },
      { command: "/orders", description: "Limit orders and DCA." },
    ]),
    group("sniper-and-copy", "Sniper and copy trading", ["sniper", "copy-trade"], [
      { command: "/sniper", description: "Sniper filters." },
      { command: "/copy", description: "Open copy trading." },
      { command: "/copy_add", description: "Add a wallet to copy." },
      { command: "/copy_list", description: "List the wallets you copy." },
      { command: "/copy_set", args: "<wallet> <sol>", description: "Set the size for one copied wallet." },
      { command: "/copy_pause", description: "Pause copying." },
      { command: "/copy_resume", description: "Resume copying." },
      { command: "/copy_remove", description: "Stop copying a wallet." },
    ]),
    group(
      "research-and-alerts",
      "Research and alerts",
      ["safety-check", "wallet-tracking", "price-alerts", "ct-tracker", "picks", "top-wallets"],
      [
        { command: "/safety", description: "Run the Safety Check on a token’s mint address." },
        { command: "/track", description: "Open wallet tracking." },
        { command: "/track_add", description: "Add a wallet to watch." },
        { command: "/track_list", description: "List the wallets you watch." },
        { command: "/track_view", args: "<wallet>", description: "Look at one watched wallet." },
        { command: "/track_mute", description: "Mute alerts for a watched wallet." },
        { command: "/track_remove", description: "Stop watching a wallet." },
        { command: "/alerts", description: "Price alerts and the new-launch feed." },
        { command: "/ct", description: "Open CT Tracker." },
        { command: "/ct_follow", args: "<@handle>", description: "Follow one account." },
        { command: "/ct_follow all", description: "Follow every account on the list." },
        { command: "/ct_unfollow", description: "Unfollow an account." },
        { command: "/ct_feed", description: "Show the CT feed." },
        { command: "/ct_coin", args: "<mint>", description: "Trace posts about one token." },
        { command: "/picks", description: "Ranked new tokens. A list to research, not a recommendation." },
        { command: "/topwallets", description: "Wallets ranked from realized swap history." },
        { command: "/smartfeed", description: "The smart-money feed." },
      ],
    ),
    group("token-launch", "Token launch", ["token-launch"], [{ command: "/launch", description: "Create a token." }]),
    group("group-chats", "In group chats", ["group-commands"], [
      { command: "/price", args: "<mint>", description: "Quick price for a token." },
      { command: "/info", args: "<mint>", description: "Quick information about a token." },
    ]),
  ],

  stayingSafe: {
    id: "staying-safe",
    heading: "Staying safe",
    points: [
      site.legal.antiImpersonation,
      site.legal.websiteNote,
      "Whoever has a wallet’s key controls its funds. Keep a copy offline and never share it.",
    ],
    riskLink: { label: "Risk disclosure", href: "/risk/" },
  },

  copy: { idle: "Copy", done: "Copied", failed: "Not copied" },
};
