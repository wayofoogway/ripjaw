import { Info } from "lucide-react";
import { site } from "@/config/site";
import { feesCommandNote } from "@/content/home";
import { costs } from "@/content/pricing";
import { Reveal } from "../ui/reveal";
import { Section, SectionHeading } from "../ui/section";

/** The two kinds of cost side by side: the access fee, paid once, and what each trade carries. */
export function Costs() {
  const { once, perTrade, timeline } = costs;
  const { speedFees } = site;

  return (
    <Section id="costs" labelledBy="costs-title" className="border-y border-rj-line bg-rj-surface/40">
      <Reveal>
        <SectionHeading id="costs-title" eyebrow={costs.eyebrow} title={costs.title} lede={costs.lede} />
      </Reveal>

      <Reveal className="mt-12 lg:mt-16">
        {/* One mark for the access fee, then a mark for every trade after it. */}
        <div aria-hidden="true" className="mb-5 hidden grid-cols-12 gap-x-6 lg:grid">
          <div className="col-span-4 flex items-center gap-3">
            <span className="size-3 shrink-0 rounded-full bg-[image:var(--rj-gradient)] shadow-[0_0_0_5px_rgb(153_69_255/0.16)]" />
            <span className="text-eyebrow text-rj-dim">{timeline.once}</span>
            <span className="h-px flex-1 bg-linear-to-r from-rj-purple/50 to-rj-line-strong" />
          </div>
          <div className="col-span-8 flex items-center gap-3">
            <span className="text-eyebrow text-rj-dim">{timeline.trades}</span>
            <span className="flex h-3 flex-1 items-center justify-between border-b border-rj-line-strong">
              {Array.from({ length: 14 }, (_, index) => (
                <span key={index} className="h-3 w-px bg-white/20" />
              ))}
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <article className="edge-gradient flex flex-col rounded-[22px] bg-rj-surface p-6 sm:p-8 lg:col-span-4">
            <h3 className="text-eyebrow text-rj-caption">{once.label}</h3>
            <p className="mt-4 -ml-1 flex items-baseline gap-2">
              <span className="text-gradient px-1 font-display text-[4.5rem] leading-none font-bold lg:text-[8rem]">
                {once.amount}
              </span>
              <span className="font-mono text-[1.5rem] font-medium text-rj-dim">{once.unit}</span>
            </p>
            <p className="mt-2 text-[1.0625rem] font-medium text-rj-text lg:mt-4">{once.name}</p>
            <p className="mt-3 text-base leading-relaxed text-rj-dim lg:text-[0.9375rem]">{once.detail}</p>
            <p className="mt-6 border-t border-rj-line pt-4 text-[0.9375rem] text-rj-dim lg:mt-auto">
              {perTrade.columns.goesTo}: <span className="text-rj-text">{once.goesTo}</span>
            </p>
          </article>

          <article className="panel rounded-[22px] p-6 sm:p-8 lg:col-span-8">
            <h3 className="text-eyebrow text-rj-caption">{perTrade.label}</h3>
            <table className="mt-4 block w-full text-left sm:table">
              <thead className="sr-only sm:not-sr-only sm:table-header-group">
                <tr className="font-mono text-[0.6875rem] tracking-[0.12em] text-rj-caption uppercase">
                  <th scope="col" className="pb-3 font-medium">
                    {perTrade.columns.cost}
                  </th>
                  <th scope="col" className="pb-3 pl-6 font-medium">
                    {perTrade.columns.goesTo}
                  </th>
                  <th scope="col" className="pb-3 pl-6 text-right font-medium">
                    {perTrade.columns.amount}
                  </th>
                </tr>
              </thead>
              <tbody className="block divide-y divide-rj-line border-t border-rj-line sm:table-row-group">
                {perTrade.rows.map((row) => (
                  <tr key={row.name} className="block py-4 sm:table-row sm:py-0">
                    <th scope="row" className="block font-normal sm:table-cell sm:py-4 sm:align-top">
                      <span className="block text-base font-medium text-rj-text lg:text-[0.9375rem]">{row.name}</span>
                      <span className="mt-1 block max-w-[26rem] text-base leading-relaxed text-rj-dim lg:text-[0.9375rem]">
                        {row.detail}
                      </span>
                    </th>
                    <td className="mt-2 block text-base text-rj-dim sm:mt-0 sm:table-cell sm:py-4 sm:pl-6 sm:align-top sm:whitespace-nowrap lg:text-[0.9375rem]">
                      <span className="sm:hidden">{perTrade.columns.goesTo}: </span>
                      <span className="text-rj-text sm:text-rj-dim">{row.goesTo}</span>
                    </td>
                    <td className="mt-1 block font-mono text-base text-rj-text sm:mt-0 lg:text-[0.875rem] sm:table-cell sm:w-[13.5rem] sm:py-4 sm:pl-6 sm:text-right sm:align-top">
                      <span className="font-sans text-base text-rj-dim sm:hidden">{perTrade.columns.amount}: </span>
                      {row.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </div>
      </Reveal>

      <Reveal className="mt-8">
        <div className="flex max-w-[52rem] items-start gap-3 text-base leading-relaxed text-rj-dim lg:text-[0.9375rem]">
          <Info aria-hidden="true" className="mt-1 size-4 shrink-0 text-rj-caption" strokeWidth={1.75} />
          <div className="space-y-2">
            <p className="text-rj-text">{site.access.disclosure}</p>
            <p>{speedFees.pendingVerification ? speedFees.pendingCopy : speedFees.publishedNote}</p>
            {feesCommandNote !== null && <p>{feesCommandNote}</p>}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
