import { ArrowDown } from "lucide-react";
import { featureStatusMeta, site } from "@/config/site";
import { referralsSection } from "@/content/home";
import { Reveal } from "../ui/reveal";
import { Section } from "../ui/section";
import { StatusBadge } from "../ui/status-badge";
import { ReferralStatus } from "./referral-status";

/** Referral explainer. Reward numbers are published only once the owner clears them in the config. */
export function Referrals() {
  const { referrals } = site;
  const host = new URL(site.url).host;
  const code = referralsSection.codePlaceholder;

  return (
    <Section id="referrals" labelledBy="referrals-title" spacing="tight">
      <div className="panel grid gap-x-8 gap-y-10 p-6 sm:p-8 lg:grid-cols-12 lg:p-12">
        <Reveal className="lg:col-span-6">
          <StatusBadge status={referrals.status} label={featureStatusMeta[referrals.status].label} />
          <p className="text-eyebrow mt-6 mb-4 text-rj-dim">{referralsSection.eyebrow}</p>
          <h2 id="referrals-title" className="text-display-3 lg:text-[2.25rem] lg:leading-[1.1]">
            {referrals.headline}
          </h2>
          <p className="mt-4 max-w-[32rem] text-base leading-relaxed text-rj-dim">{referrals.body}</p>

          <ol className="mt-7 space-y-3">
            {referralsSection.steps.map((step, index) => (
              <li key={step} className="flex gap-3.5 text-[0.9375rem] leading-relaxed text-rj-text">
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-rj-line-strong font-mono text-[0.6875rem] text-rj-dim"
                >
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          {referrals.rewards.pendingVerification ? (
            <p className="mt-7 text-[0.9375rem] leading-relaxed text-rj-dim">{referrals.rewards.pendingCopy}</p>
          ) : (
            <dl className="mt-7 divide-y divide-rj-line border-y border-rj-line">
              {referrals.rewards.items.map((item) => (
                <div key={item.label} className="flex items-baseline justify-between gap-6 py-2.5 text-[0.9375rem]">
                  <dt className="text-rj-dim">{item.label}</dt>
                  <dd className="text-right font-mono text-rj-text">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-6 lg:col-start-7 lg:self-center">
          <figure>
            <figcaption className="sr-only">How a referral code travels from a site link to the bot link</figcaption>
            <LinkRow label={referralsSection.siteLinkLabel} base={`${host}/?${referrals.queryParam}=`} code={code} />
            <div aria-hidden="true" className="ml-7 flex h-9 items-center border-l border-dashed border-rj-line-strong pl-5">
              <ArrowDown className="size-4 text-rj-caption" strokeWidth={1.75} />
            </div>
            <LinkRow
              label={referralsSection.botLinkLabel}
              base={`${site.links.telegramBot.replace("https://", "")}?start=${referrals.startPrefix}`}
              code={code}
            />
          </figure>
          <ReferralStatus />
        </Reveal>
      </div>
    </Section>
  );
}

function LinkRow({ label, base, code }: { label: string; base: string; code: string }) {
  return (
    <div className="rounded-2xl border border-rj-line bg-rj-bg/70 px-4 py-3.5 sm:px-5">
      <p className="font-mono text-[0.625rem] tracking-[0.14em] text-rj-caption uppercase">{label}</p>
      <p className="mt-1.5 font-mono text-[0.8125rem] break-all text-rj-dim sm:text-[0.9375rem]">
        {base}
        <span className="text-gradient font-medium">{code}</span>
      </p>
    </div>
  );
}
