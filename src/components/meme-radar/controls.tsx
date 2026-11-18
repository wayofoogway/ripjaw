import { MoonStar, MousePointerClick, ShieldCheck, UserPlus, Zap, type LucideIcon } from "lucide-react";
import { controls } from "@/content/meme-radar";
import { Reveal } from "../ui/reveal";
import { Section, SectionHeading } from "../ui/section";
import { Pill } from "../ui/status-badge";

type ControlIcon = (typeof controls.items)[number]["icon"];

const ICONS: Record<ControlIcon, LucideIcon> = {
  accounts: UserPlus,
  quiet: MoonStar,
  confirm: ShieldCheck,
  "double-tap": MousePointerClick,
  auto: Zap,
};

/** The settings the design gives the user, as a plain list. Worded as intended behaviour while the feature is in development. */
export function Controls() {
  return (
    <Section id="controls" labelledBy="controls-title" className="border-y border-rj-line bg-rj-surface/40">
      <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--nav-height)+5.5rem)]">
            <SectionHeading id="controls-title" eyebrow={controls.eyebrow} title={controls.title} lede={controls.lede} />
          </div>
        </Reveal>

        <ul className="divide-y divide-rj-line border-y border-rj-line lg:col-span-6 lg:col-start-7">
          {controls.items.map((item, index) => {
            const Glyph = ICONS[item.icon];
            return (
              <li key={item.title}>
                <Reveal delay={index * 0.04} distance={16} className="flex gap-5 py-6 lg:py-7">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-rj-line bg-rj-surface-2 text-rj-text">
                    <Glyph aria-hidden="true" className="size-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <h3 className="font-sans text-[1.125rem] font-semibold tracking-normal text-rj-text">{item.title}</h3>
                      {item.tag && <Pill>{item.tag}</Pill>}
                    </div>
                    <p className="mt-2 max-w-[34rem] text-base leading-relaxed text-rj-dim">{item.body}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
