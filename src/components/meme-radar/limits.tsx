import { featureStatusMeta, visibleFeatures } from "@/config/site";
import { limits } from "@/content/meme-radar";
import { Icon } from "../ui/icon";
import { Reveal } from "../ui/reveal";
import { Section, SectionHeading } from "../ui/section";
import { StatusBadge } from "../ui/status-badge";

/** What the feature is not, stated one item at a time, with the planned track record beside them. */
export function Limits() {
  const trackRecord = visibleFeatures().find((feature) => feature.id === "radar-track-record");

  return (
    <Section id="limits" labelledBy="limits-title">
      <Reveal>
        <SectionHeading id="limits-title" eyebrow={limits.eyebrow} title={limits.title} lede={limits.lede} />
      </Reveal>

      <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
        {limits.items.map((item, index) => (
          <li key={item.title}>
            <Reveal delay={(index % 3) * 0.05} className="h-full border-t border-rj-line-strong pt-5">
              <p aria-hidden="true" className="font-mono text-[0.8125rem] text-rj-caption">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="text-display-3 mt-3">{item.title}</h3>
              <p className="mt-3 max-w-[24rem] text-base leading-relaxed text-rj-dim">{item.body}</p>
            </Reveal>
          </li>
        ))}
        {trackRecord && (
          <li>
            <Reveal delay={0.1} className="h-full">
              <article className="panel h-full p-5 lg:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl border border-rj-line bg-rj-surface-2 text-rj-text">
                    <Icon name={trackRecord.icon} className="size-5" />
                  </span>
                  <StatusBadge status={trackRecord.status} label={featureStatusMeta[trackRecord.status].label} />
                </div>
                <h3 className="mt-5 font-sans text-[1.125rem] font-semibold tracking-normal text-rj-text">
                  {trackRecord.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-rj-dim">{trackRecord.summary}</p>
                {trackRecord.status === "limited_beta" && trackRecord.limitation && (
                  <p className="mt-2 text-base leading-relaxed text-rj-dim">Limitation: {trackRecord.limitation}</p>
                )}
                {(trackRecord.status === "planned" || trackRecord.status === "in_development") && (
                  <p className="mt-2 text-base leading-relaxed text-rj-dim">{limits.trackRecordNote}</p>
                )}
              </article>
            </Reveal>
          </li>
        )}
      </ul>
    </Section>
  );
}
