import "server-only";
import { featureStatusMeta, getFeature, site, type FeatureStatus } from "@/config/site";
import { feesCommandNote, howItWorks } from "./home";

/*
 * Docs page copy. The command list follows the kit's command reference. Each
 * group reads the status of the features it belongs to from the site config,
 * so a status change there changes the label here.
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
  /** Distinct statuses of the features these commands belong to. */
  statuses: FeatureStatus[];
  /** Shown above the commands when part of the group cannot be used yet. */
  note?: string;
  commands: DocsCommand[];
};

const NOT_USABLE: FeatureStatus[] = ["in_development", "planned"];

function group(
  id: string,
  heading: string,
  featureIds: string[],
  commands: DocsCommand[],
  extraStatuses: FeatureStatus[] = [],
): DocsGroup {
  const features = featureIds.map(getFeature);
  const statuses = [...new Set([...features.map((feature) => feature.status), ...extraStatuses])];
  const waiting = features.filter((feature) => NOT_USABLE.includes(feature.status));
  const note =
    waiting.length === 0
      ? undefined
      : `${waiting
          .map((feature) => `${feature.title} is ${featureStatusMeta[feature.status].label.toLowerCase()}.`)
          .join(" ")} These commands are listed for reference and can change before release.`;
  return { id, heading, statuses, note, commands };
}

export const docs = {
  eyebrow: "Docs",
  title: "Docs and commands",
  lede: `How to get started with ${site.name} in Telegram, and every bot command written out as text you can copy.`,
  notice: `${site.beta.stageLabel} · Commands can change`,

  gettingStarted: {
    id: "getting-started",
    heading: "Getting started",
    intro: howItWorks.lede,
    steps: howItWorks.steps,
  },

  usingCommands: {
    id: "using-commands",
    heading: "How commands work",
    paragraphs: [
      `Send a command as a message in your chat with ${site.links.telegramBotHandle}. The main menu has buttons for the same areas, so you can use either.`,
      "Words in angle brackets stand for a value you type: a token’s mint address, a wallet address, an X handle or an amount of SOL. The copy button copies the command itself, without them.",
      "Each group below shows the current status of the features its commands belong to. A command for a feature that is not available yet may not respond.",
    ],
    legendHeading: "Status labels",
    legend: (Object.keys(featureStatusMeta) as FeatureStatus[]).map((status) => ({
      status,
      label: featureStatusMeta[status].label,
      explanation: featureStatusMeta[status].explanation,
    })),
  },

  groups: [
    group("menu-and-help", "Menu and help", ["guide", "settings"], [
      { command: "/start", description: "Start the bot and open the main menu." },
      { command: "/menu", description: "Open the main menu." },
      { command: "/help", description: "Show help." },
      { command: "/guide", description: "Open the built-in guide for new traders." },
      { command: "/settings", description: "Open the Settings hub: speed, slippage, tips, confirmations and presets." },
      { command: "/cancel", description: "Cancel the prompt you are in." },
    ]),
    group("wallets", "Wallets", ["wallets", "account-security"], [
      { command: "/wallet", description: "Open Wallets: create, import, export and switch wallets." },
    ]),
    group("trading", "Trading", ["buy-sell", "limit-orders", "dca", "portfolio"], [
      { command: "/buy", description: "Buy a token." },
      { command: "/sell", description: "Sell a token." },
      { command: "/positions", description: "Open positions and profit or loss." },
      { command: "/orders", description: "Limit orders and DCA." },
      ...(feesCommandNote === null
        ? []
        : [{ command: site.speedFees.botCommand.command, description: "Current speed fees." }]),
    ]),
    group("sniper-and-copy", "Sniper and copy trading", ["sniper", "copy-trade"], [
      { command: "/sniper", description: "Sniper filters and the migration sniper." },
      { command: "/copy", description: "Open copy trading." },
      { command: "/copy_add", description: "Add a wallet to copy." },
      { command: "/copy_list", description: "List the wallets you copy." },
      { command: "/copy_set", args: "<wallet> <sol>", description: "Set the size in SOL for one copied wallet." },
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
    group("meme-radar", "Meme Radar", ["meme-radar"], [
      { command: "/memeradar", description: "Open the Meme Radar menu." },
      { command: "/memeradar_add", args: "<@handle>", description: "Add an account to watch." },
      { command: "/memeradar_mute", args: "<@handle>", description: "Mute an account." },
      {
        command: "/memeradar_quiet",
        args: "<from hour> <to hour>",
        description: "Set quiet hours. For example, 22 7 keeps alerts quiet from 22:00 to 07:00.",
      },
    ]),
    group(
      "launch-and-rewards",
      "Launch and rewards",
      ["token-launch"],
      [
        { command: "/launch", description: "Create a token." },
        { command: "/rewards", description: "Referrals and payouts." },
      ],
      [site.referrals.status],
    ),
    group("group-chats", "In group chats", ["group-commands"], [
      { command: "/price", args: "<mint>", description: "Quick price for a token." },
      { command: "/info", args: "<mint>", description: "Quick information about a token." },
    ]),
  ],

  stayingSafe: {
    id: "staying-safe",
    heading: "Staying safe",
    points: [
      `${site.legal.antiImpersonation} Check the handle before you tap Start.`,
      site.access.paymentNote,
      "Whoever has a wallet’s key controls its funds. Export yours, keep it offline and never share it.",
      "A passed Safety Check is not approval to buy. Only trade what you can afford to lose.",
    ],
    riskLink: { label: "Read the risk disclosure", href: "/risk/" },
  },

  copy: { idle: "Copy", done: "Copied", failed: "Not copied" },
};
