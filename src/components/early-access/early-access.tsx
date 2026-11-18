import { earlyAccessDestination, site } from "@/config/site";
import { signupCopy } from "@/content/early-access";
import { Section } from "../ui/section";
import { SignupForm } from "./signup-form";

/**
 * What sits under an early access heading. On hold: one plain line, no form,
 * nothing collected. Open: a line and the email form.
 */
function EarlyAccessBody() {
  const { earlyAccess, referral } = site;
  if (earlyAccess.state === "on_hold") {
    return (
      <p data-early-access="on_hold" className="text-lg text-rj-dim">
        {earlyAccess.onHoldLine}
      </p>
    );
  }
  return (
    <div data-early-access="open">
      <p className="text-lg text-rj-dim">{earlyAccess.openLine}</p>
      <SignupForm destination={earlyAccessDestination()} referral={referral} copy={signupCopy} />
      <noscript>
        <p className="mt-3 text-base text-rj-dim">{signupCopy.noScript}</p>
      </noscript>
    </div>
  );
}

/** Early access under the home headline. */
export function EarlyAccessIntro() {
  return (
    <section aria-labelledby="early-access-intro-title" className="mt-10 border-t border-rj-line pt-8">
      <h2 id="early-access-intro-title" className="text-label mb-3 text-rj-caption">
        {site.earlyAccess.heading}
      </h2>
      <EarlyAccessBody />
    </section>
  );
}

/** Early access as the closing section of a page. */
export function EarlyAccessSection() {
  return (
    <Section id="early-access" title={site.earlyAccess.heading}>
      <EarlyAccessBody />
    </Section>
  );
}
