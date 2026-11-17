import { pillars } from "@/content/home";
import { Icon } from "../ui/icon";
import { Reveal } from "../ui/reveal";
import { Section } from "../ui/section";

/** A calm pause after the hero: three compact statements of what Ripjaw is for. */
export function Pillars() {
  return (
    <Section spacing="tight" labelledBy="pillars-title">
      <h2 id="pillars-title" className="sr-only">
        What Ripjaw does
      </h2>
      <ul className="grid gap-4 md:grid-cols-3 lg:gap-6">
        {pillars.map((pillar, index) => (
          <li key={pillar.title}>
            <Reveal delay={index * 0.07} className="h-full">
              <article className="panel card-hover flex h-full gap-4 p-5 md:flex-col md:gap-5 md:p-6 lg:p-7">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-rj-line bg-rj-surface-2 text-rj-text">
                  <Icon name={pillar.icon} className="size-5" />
                </span>
                <div>
                  <h3 className="font-display text-[1.25rem] leading-tight font-semibold">{pillar.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-rj-dim">{pillar.body}</p>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
