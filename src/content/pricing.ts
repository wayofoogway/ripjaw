import "server-only";
import { site } from "@/config/site";

/*
 * Pricing page copy. The price, the fee wording and the speed-fee tiers are
 * read from the site config; this file holds the explanation around them.
 */

const speedFeeAmount = site.speedFees.pendingVerification
  ? "Shown in Telegram before you confirm"
  : site.speedFees.tiers.map((tier) => `${tier.mode} ${tier.feeSol} SOL`).join(" · ");

export const costs = {
  eyebrow: "Costs",
  title: "What you pay, and when.",
  lede: "Access is one payment. After that, each trade has its own costs. They are separate from the access fee, and only one of them is Ripjaw’s.",
  once: {
    label: "Once",
    name: site.access.descriptor,
    amount: site.access.amountSol,
    unit: "SOL",
    detail: "One payment, made inside the Telegram bot when it asks.",
    goesTo: site.name,
  },
  perTrade: {
    label: "On each trade",
    columns: { cost: "Cost", goesTo: "Goes to", amount: "Amount" },
    rows: [
      {
        name: "Ripjaw speed fee",
        detail: "Ripjaw’s own fee on a trade. It depends on the speed mode you choose.",
        goesTo: site.name,
        amount: speedFeeAmount,
      },
      {
        name: "Solana network fee",
        detail: "Every Solana transaction pays the network a base fee.",
        goesTo: "Solana network",
        amount: "Set by the network",
      },
      {
        name: "Priority fee and tips",
        detail: "Optional extras you set, to ask for a transaction to be processed sooner.",
        goesTo: "Solana network",
        amount: "Set by you",
      },
      {
        name: "Price impact and slippage",
        detail: "Not a fee, but a real cost: the price you get can differ from the quote, most of all when liquidity is thin.",
        goesTo: "The market",
        amount: "Varies by token and trade size",
      },
    ],
  },
  timeline: { once: "Access · once", trades: "Each trade" },
};

export const pricingQuestions = {
  eyebrow: "Pricing FAQ",
  title: "Before you pay.",
  allLabel: "All questions",
};
