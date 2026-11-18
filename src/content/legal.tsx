import "server-only";
import Link from "next/link";
import type { ReactNode } from "react";
import type { LongFormSection } from "@/components/ui/long-form";
import { earlyAccessDestination, featureStatusMeta, getFeature, site } from "@/config/site";
import {
  analyticsStatement,
  locationsOpenItem,
  openLegalItems,
  operatorStatement,
  refundOpenItem,
  refundStatement,
  restrictedLocationsStatement,
  supportContact,
} from "./owner-facts";

/*
 * Terms, Privacy and Risk. The text starts from the kit's legal draft and is
 * a draft until a lawyer has reviewed it (`site.legal.reviewed`). Facts the
 * owner has not confirmed come from `owner-facts.ts`: they are left out or
 * stated as unpublished, never filled in. What Privacy says about email
 * addresses follows `site.earlyAccess.state`.
 */

export type LegalDocument = { title: string; lede: string; sections: LongFormSection[] };

const { earlyAccess, legal, links, referral } = site;
const handle = links.telegramBotHandle;
const name = site.name;

const ELIGIBILITY = "You must be of legal age and allowed to use these services where you live. Checking that is your responsibility.";
const THIRD_PARTY_SERVICES = "RPC providers, Jupiter, Jito, Pump.fun, DexScreener and X";
const FEES = `Using the bot can carry fees charged by ${name}, and every trade carries Solana network costs and price impact. Fees are not published on this website.`;

function section(id: string, heading: string, content: ReactNode): LongFormSection {
  return { id, heading, content };
}

/** The scope paragraph every document opens with, plus the operator once the owner has confirmed it. */
function scope(covers: string, within: "In it" | "In them"): ReactNode {
  return (
    <>
      <p>
        {covers} {within}, “{name}”, “we” and “us” mean the operator of the bot and the site, and “you” means the person
        using them.
      </p>
      {operatorStatement !== null && <p>{operatorStatement}</p>}
      {!legal.reviewed && (
        <p>This text is a draft. It has not been reviewed by a lawyer, and it is not final policy.</p>
      )}
    </>
  );
}

function openItems(items: string[]): LongFormSection[] {
  if (items.length === 0) return [];
  return [
    section(
      "open-items",
      "Open items in this draft",
      <>
        <p>These points have to be settled before this text is final:</p>
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>,
    ),
  ];
}

function contact(purpose: string): LongFormSection[] {
  if (supportContact === null) return [];
  return [
    section(
      "contact",
      "Contact",
      <p>
        {purpose} <a href={supportContact.href}>{supportContact.label}</a>.
      </p>,
    ),
  ];
}

function memeRadarRiskNote(): string {
  const radar = getFeature("meme-radar");
  return radar.status === "early_access" || radar.status === "limited"
    ? `${radar.title} alerts are automated. They can be wrong or late.`
    : `${radar.title} is ${featureStatusMeta[radar.status].label.toLowerCase()} and is not available.`;
}

/** What Privacy says about the early access form. On hold there is no form, and the page says so. */
function earlyAccessPrivacy(): { paragraphs: string[]; openItems: string[] } {
  switch (earlyAccess.state) {
    case "on_hold":
      return {
        paragraphs: [
          "Early access sign-up is not open yet. This site has no forms, and it collects no email addresses.",
          "When sign-up opens, this section will say what the form collects and how it is used.",
        ],
        openItems: [],
      };
    case "open":
      return {
        paragraphs: [
          `The early access form asks for one thing: your email address. It is used to contact you about ${name} early access.`,
          `The form sends your email address to ${new URL(earlyAccessDestination()).host}.`,
          `If you opened this site through a link with a referral code (?${referral.queryParam}=), the code is sent with your sign-up. It is kept in your browser’s session storage until you close the tab.`,
          "To be removed from the list, see “Your requests” below.",
        ],
        openItems: ["How long email addresses from the early access form are kept."],
      };
  }
}

export const terms: LegalDocument = {
  title: "Terms of use",
  lede: `The terms for using the ${name} Telegram bot and this website.`,
  sections: [
    section(
      "about",
      "About these terms",
      <>
        {scope(`These terms cover the ${name} Telegram bot (${handle}) and this website.`, "In them")}
        <p>By using the bot you agree to these terms. If you do not agree, do not use it.</p>
      </>,
    ),
    section(
      "service",
      `What ${name} is`,
      <>
        <p>
          {site.productLine} It is a software tool that sends your own instructions to the Solana network from a chat.
          It is not a financial adviser, a broker or an exchange.
        </p>
        <p>
          {name} is not open to everyone yet. {site.stage.notice} Each feature on this site carries a status label, and
          a feature that is not marked as in early access may not work.
        </p>
        <p>This website is for information. {legal.websiteNote}</p>
      </>,
    ),
    section(
      "eligibility",
      "Who can use it",
      <>
        <p>{ELIGIBILITY}</p>
        {restrictedLocationsStatement !== null && <p>{restrictedLocationsStatement}</p>}
      </>,
    ),
    section(
      "fees",
      "Fees",
      <>
        <p>{FEES}</p>
        <p>{refundStatement}</p>
      </>,
    ),
    section(
      "wallets",
      "Wallets and keys",
      <>
        <p>
          The bot creates or imports a Solana wallet for you and holds its key, so that it can sign the trades you
          confirm. {getFeature("account-security").summary}
        </p>
        <p>
          You are responsible for exporting your key, storing it safely and keeping your Telegram account secure.
          Anyone who has your key or your Telegram account can move your funds.
        </p>
        <p>{legal.antiImpersonation}</p>
      </>,
    ),
    section(
      "responsibilities",
      "Your responsibilities",
      <>
        <p>You are responsible for:</p>
        <ul>
          <li>your trading decisions and their results;</li>
          <li>your settings, including any automatic buying or selling you switch on;</li>
          <li>following the laws and tax rules that apply to you;</li>
          <li>not using {name} to break the law.</li>
        </ul>
      </>,
    ),
    section(
      "no-advice",
      "No advice",
      <p>
        Nothing on this site or in the bot is financial, investment, legal or tax advice. A result such as “Passed the
        safety check” describes the outcome of automated checks. It is not a recommendation to buy or sell anything.
      </p>,
    ),
    section(
      "risk",
      "Risk",
      <p>
        Trading crypto assets is high risk, and meme coins especially. You can lose everything you trade. The{" "}
        <Link href="/risk/">risk disclosure</Link> is part of these terms. Read it before you trade.
      </p>,
    ),
    section(
      "third-parties",
      "Third-party services",
      <>
        <p>
          {name} relies on services it does not control, including Telegram, the Solana network, {THIRD_PARTY_SERVICES}.
          They can be slow, change or fail.
        </p>
        <p>{legal.nonAffiliation}</p>
      </>,
    ),
    section(
      "changes",
      "Changes and availability",
      <>
        <p>
          {name} is provided as it is. There is no promise that it will always be available, that it is free of errors,
          or that a check, an alert or an order will work as intended.
        </p>
        <p>
          Features, limits and fees can change, and the bot can be paused or withdrawn. These terms can change too. The
          current version is the one on this page.
        </p>
      </>,
    ),
    ...contact("Questions about these terms:"),
    ...openItems(
      openLegalItems(["Governing law and how disputes are handled.", "Fees.", ...refundOpenItem, ...locationsOpenItem]),
    ),
  ],
};

const signup = earlyAccessPrivacy();

export const privacy: LegalDocument = {
  title: "Privacy policy",
  lede: `What this website and the ${name} bot store, and what they do not.`,
  sections: [
    section("scope", "What this covers", scope(`This policy covers the ${name} Telegram bot (${handle}) and this website.`, "In it")),
    section(
      "early-access",
      "Early access sign-up",
      <>
        {signup.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </>,
    ),
    section(
      "website",
      "This website",
      <>
        <p>This site has no accounts, no wallet connection and no payments.</p>
        <p>{analyticsStatement} Fonts and images are served from this site, not from other companies.</p>
        <p>
          Like any website, the company that hosts this one processes standard request data, such as your IP address
          and browser type, in order to deliver pages.
        </p>
      </>,
    ),
    section(
      "bot-data",
      "What the bot stores",
      <ul>
        <li>your Telegram user ID and username;</li>
        <li>your wallets’ public addresses;</li>
        <li>your wallet keys, encrypted;</li>
        <li>your settings, orders and trade history;</li>
        <li>referral relationships: who referred whom.</li>
      </ul>,
    ),
    section(
      "not-stored",
      "What the bot does not store",
      <ul>
        <li>your action password in plain text: only a hash is kept;</li>
        <li>card details;</li>
        <li>your phone number.</li>
      </ul>,
    ),
    section(
      "third-parties",
      "Who else is involved",
      <>
        <p>
          To work, the bot sends trades and lookups to Solana RPC providers, Jupiter, Jito and market-data services.
        </p>
        <p>Telegram carries every message between you and the bot.</p>
      </>,
    ),
    section(
      "on-chain",
      "On-chain data is public",
      <p>
        Transactions on Solana are public and permanent. Anyone can see a wallet’s address and its history, and nobody,{" "}
        {name} included, can delete them.
      </p>,
    ),
    section(
      "requests",
      "Your requests",
      supportContact === null ? (
        <p>
          A contact for access and deletion requests has not been published yet. This policy is not final without one.
        </p>
      ) : (
        <p>
          To ask what is stored about you, or to have it deleted, contact{" "}
          <a href={supportContact.href}>{supportContact.label}</a>.
        </p>
      ),
    ),
    ...openItems(
      openLegalItems([...signup.openItems, "How long data is kept.", "Where data is stored and processed."]),
    ),
  ],
};

export const risk: LegalDocument = {
  title: "Risk disclosure",
  lede: `Read this before you trade. It applies to everything ${name} does.`,
  sections: [
    section(
      "no-advice",
      "No advice",
      <>
        {scope(`This disclosure covers the ${name} Telegram bot (${handle}) and this website.`, "In it")}
        <p>
          {name} provides automated tools and information only. A result such as “Passed the safety check” describes
          the outcome of automated checks. It is not a recommendation to buy any asset.
        </p>
      </>,
    ),
    section(
      "high-risk",
      "High risk",
      <p>
        Meme coins are speculative and volatile. Most lose all their value. You can lose all the SOL you trade. Only
        trade what you can afford to lose.
      </p>,
    ),
    section(
      "final",
      "Transactions are final",
      <p>
        Transactions on Solana cannot be reversed once they confirm. A trade sent to the wrong token, at the wrong size
        or at a bad price cannot be undone.
      </p>,
    ),
    section(
      "checks",
      "Checks are heuristics",
      <p>
        The Safety Check reads on-chain and public data that can be missing, delayed or manipulated. It cannot detect
        every scam, including private bundles, social engineering, or what a developer does later. A check that could
        not be read is not a pass, and a pass is not approval to buy.
      </p>,
    ),
    section(
      "automation",
      "Alerts and automation",
      <>
        <p>
          Sniper, Copy Trade, automatic selling and alerts act on fast-moving data and on third-party services such as{" "}
          {THIRD_PARTY_SERVICES}. They can be delayed, they can fail, and an order can fill at a worse price than you
          expected. You are responsible for your settings, including any automatic buying you switch on.
        </p>
        <p>{memeRadarRiskNote()}</p>
      </>,
    ),
    section(
      "early-software",
      "Early software",
      <p>{site.stage.notice} Early software can have errors, including errors that cost money.</p>,
    ),
    section(
      "keys",
      "Your keys",
      <p>
        {getFeature("account-security").summary} You are responsible for exporting your key and keeping it secure.
        Anyone who has it controls your funds. {legal.antiImpersonation}
      </p>,
    ),
    section(
      "fees",
      "Fees",
      <>
        <p>{FEES}</p>
        <p>{refundStatement}</p>
      </>,
    ),
    section(
      "eligibility",
      "Eligibility",
      <>
        <p>{ELIGIBILITY}</p>
        {restrictedLocationsStatement !== null && <p>{restrictedLocationsStatement}</p>}
      </>,
    ),
    section(
      "third-parties",
      "Third parties",
      <p>
        {legal.nonAffiliation} It is also not affiliated with, endorsed by or sponsored by Jupiter, Pump.fun, Raydium,
        Meteora or DexScreener, or by any account whose posts it reads.
      </p>,
    ),
    ...openItems(openLegalItems(["Fees.", ...refundOpenItem, ...locationsOpenItem])),
  ],
};
