import "server-only";
import { site } from "@/config/site";

/*
 * Sentences built from facts only the owner can confirm. Each reads its fact
 * from the site config. An unconfirmed fact is never guessed: the statement
 * is either absent (null) or says plainly that the fact is not published.
 */

const { legal, support, analytics } = site;

export const operatorStatement: string | null = legal.entityName.confirmed
  ? `${site.name} is operated by ${legal.entityName.value}.`
  : null;

export const restrictedLocationsStatement: string | null = legal.restrictedJurisdictions.confirmed
  ? `${site.name} is not offered in: ${legal.restrictedJurisdictions.value}.`
  : null;

const IRREVERSIBLE = "Solana transactions cannot be reversed once they confirm.";

export const refundStatement: string = legal.refundPolicy.confirmed
  ? `${legal.refundPolicy.value} ${IRREVERSIBLE}`
  : `Refund terms have not been published yet. ${IRREVERSIBLE}`;

export const supportContact: { label: string; href: string } | null = support.contact.confirmed
  ? support.contact.value
  : null;

export const analyticsStatement: string = analytics.provider.confirmed
  ? `This site uses ${analytics.provider.value} to count page views.`
  : "This site loads no analytics or advertising scripts, and the site itself sets no cookies.";

/** What still has to be settled before a legal draft is final. Empty once the legal pages are marked reviewed. */
export function openLegalItems(extra: string[]): string[] {
  if (legal.reviewed) return [];
  return [
    "Review by a lawyer.",
    ...(legal.entityName.confirmed ? [] : ["The legal name of the operator."]),
    ...(supportContact === null ? ["A published contact."] : []),
    ...extra,
  ];
}

export const refundOpenItem: string[] = legal.refundPolicy.confirmed ? [] : ["Refund terms."];
export const locationsOpenItem: string[] = legal.restrictedJurisdictions.confirmed
  ? []
  : [`Any locations where ${site.name} is not offered.`];

export const draftNotice: string | undefined = legal.reviewed ? undefined : legal.draftNotice;
