import { ArrowRight, EyeOff } from "lucide-react";
import { featureStatusMeta, getFeature } from "@/config/site";
import { limits } from "@/content/safety";
import { ButtonLink } from "../ui/button";
import { Icon } from "../ui/icon";
import { Reveal } from "../ui/reveal";
import { Section, SectionHeading } from "../ui/section";
import { StatusBadge } from "../ui/status-badge";

/** Explicit caveats, and the one safety setting that is not enforced yet. */
export function Limits() {
  const manualBuys = getFeature("block-failed-buys");

  return (
    <Section id="limits" labelledBy="limits-title" className="border-y border-rj-line bg-rj-surface/40">
      <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <SectionHeading id="limits-title" eyebrow={limits.eyebrow} title={limits.title} lede={limits.lede} />
          <p className="mt-10 border-l-2 border-rj-warn/70 pl-5 font-display text-[1.5rem] leading-tight font-semibold tracking-tight text-rj-text lg:text-[1.75rem]">
            {limits.rule}
          </p>
        </Reveal>

        <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-6 lg:col-start-7 lg:gap-5">
          {limits.items.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={index * 0.05} className="h-full">
                <article className="panel h-full p-5 lg:p-6">
                  <EyeOff aria-hidden="true" className="size-5 text-rj-caption" strokeWidth={1.75} />
                  <h3 className="mt-4 font-sans text-[1.0625rem] font-semibold tracking-normal text-rj-text">{item.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-rj-dim lg:text-[0.9375rem]">{item.body}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>

      <Reveal className="mt-12 lg:mt-16">
        <aside
          aria-labelledby="manual-buys-title"
          className="panel grid gap-x-8 gap-y-6 p-6 sm:p-8 lg:grid-cols-12 lg:items-center"
        >
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl border border-rj-line bg-rj-surface-2 text-rj-text">
                <Icon name={manualBuys.icon} className="size-5" />
              </span>
              <StatusBadge status={manualBuys.status} label={featureStatusMeta[manualBuys.status].label} />
            </div>
            <p id="manual-buys-title" className="text-eyebrow mt-6 text-rj-caption">
              {limits.manualBuys.title}
            </p>
            <h3 className="text-display-3 mt-2">{manualBuys.title}</h3>
            <p className="mt-3 max-w-[40rem] text-base leading-relaxed text-rj-dim">{manualBuys.summary}</p>
            {manualBuys.status === "limited_beta" && manualBuys.limitation && (
              <p className="mt-2 max-w-[40rem] text-base leading-relaxed text-rj-dim">Limitation: {manualBuys.limitation}</p>
            )}
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <ButtonLink href={limits.manualBuys.link.href}>
              {limits.manualBuys.link.label}
              <ArrowRight aria-hidden="true" className="size-4 text-rj-dim" />
            </ButtonLink>
          </div>
        </aside>
      </Reveal>
    </Section>
  );
}
