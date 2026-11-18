import { Check, Info } from "lucide-react";
import { site } from "@/config/site";
import { feesCommandNote } from "@/content/home";
import { Reveal } from "../ui/reveal";
import { Section } from "../ui/section";
import { Pill } from "../ui/status-badge";
import { TelegramCta } from "../ui/telegram-cta";

/** One price, one card. Speed-fee amounts appear only once the owner publishes them in the config. */
export function Pricing() {
  const { access, speedFees } = site;

  return (
    <Section id="pricing" labelledBy="pricing-title">
      <div className="grid items-center gap-x-8 gap-y-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <p className="text-eyebrow mb-5 text-rj-dim">{access.eyebrow}</p>
          <h2 id="pricing-title" className="text-display-2">
            {access.headline}
          </h2>
          <p className="text-lede mt-5 max-w-[34rem]">{access.body}</p>
          <p className="mt-8 flex max-w-[34rem] items-start gap-3 text-base leading-relaxed text-rj-dim lg:text-[0.9375rem]">
            <Info aria-hidden="true" className="mt-1 size-4 shrink-0 text-rj-caption" strokeWidth={1.75} />
            {access.paymentNote}
          </p>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-6 lg:col-start-7 xl:col-span-5 xl:col-start-8">
          <article className="edge-gradient relative overflow-hidden rounded-[22px] bg-rj-surface p-6 shadow-[0_50px_120px_-50px_rgb(153_69_255/0.5)] sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-32 -right-24 size-80 rounded-full bg-[radial-gradient(closest-side,rgb(153_69_255/0.22),transparent)]"
            />
            <div className="relative">
              <Pill tone="beta">{site.beta.stageLabel}</Pill>
              <p className="mt-7 flex items-baseline gap-3">
                <span className="font-mono text-[4rem] leading-none font-medium tracking-tight text-rj-text sm:text-[4.75rem]">
                  {access.amountSol}
                </span>
                <span className="font-mono text-[1.5rem] font-medium text-rj-dim">SOL</span>
              </p>
              <p className="mt-3 text-[1.0625rem] font-medium text-rj-text">{access.descriptor}</p>

              <ul className="mt-7 space-y-3 border-t border-rj-line pt-7">
                {access.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-base leading-relaxed text-rj-text lg:text-[0.9375rem]">
                    <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#8FAEFF]" strokeWidth={2.25} />
                    {point}
                  </li>
                ))}
              </ul>

              <TelegramCta label={site.cta.pricing.label} location="pricing" size="lg" className="mt-8 w-full" />

              <div className="mt-7 border-t border-rj-line pt-6">
                <h3 className="text-eyebrow text-rj-caption">Trading costs are separate</h3>
                <p className="mt-3 text-base leading-relaxed text-rj-dim lg:text-[0.9375rem]">{access.disclosure}</p>
                {speedFees.pendingVerification && (
                  <p className="mt-2 text-base leading-relaxed text-rj-dim lg:text-[0.9375rem]">{speedFees.pendingCopy}</p>
                )}
                {feesCommandNote !== null && (
                  <p className="mt-2 text-base leading-relaxed text-rj-dim lg:text-[0.9375rem]">{feesCommandNote}</p>
                )}
              </div>

              {!speedFees.pendingVerification && (
                <details className="group mt-5 border-t border-rj-line pt-4">
                  <summary className="flex min-h-11 cursor-pointer items-center justify-between text-[0.9375rem] font-medium text-rj-text">
                    Speed fees per trade
                    <span aria-hidden="true" className="font-mono text-rj-dim transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <table className="mt-2 w-full text-left text-[0.9375rem]">
                    <thead className="sr-only">
                      <tr>
                        <th scope="col">Speed mode</th>
                        <th scope="col">Ripjaw fee per trade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rj-line">
                      {speedFees.tiers.map((tier) => (
                        <tr key={tier.mode}>
                          <th scope="row" className="py-2.5 font-normal text-rj-dim">
                            {tier.mode}
                          </th>
                          <td className="py-2.5 text-right font-mono text-rj-text">{tier.feeSol} SOL</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-3 text-[0.8125rem] leading-relaxed text-rj-dim">{speedFees.publishedNote}</p>
                </details>
              )}
            </div>
          </article>
        </Reveal>
      </div>
    </Section>
  );
}
