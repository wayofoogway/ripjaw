import { philosophy } from "@/content/home";
import { Reveal } from "../ui/reveal";
import { Section, SectionHeading } from "../ui/section";

/** Typography-led pause: four plain reasons, no imagery. */
export function Philosophy() {
  return (
    <Section labelledBy="why-title" className="border-y border-rj-line bg-rj-surface/40">
      <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal className="lg:sticky lg:top-[calc(var(--nav-height)+3rem)]">
            <SectionHeading id="why-title" eyebrow={philosophy.eyebrow} title={philosophy.title} />
          </Reveal>
        </div>
        <ol className="lg:col-span-6 lg:col-start-7">
          {philosophy.principles.map((principle, index) => (
            <li key={principle.title} className="border-t border-rj-line first:border-t-0">
              <Reveal delay={index * 0.05} className="flex gap-6 py-7 lg:gap-10 lg:py-9">
                <span aria-hidden="true" className="pt-1.5 font-mono text-[0.8125rem] text-rj-caption">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-display-3">{principle.title}</h3>
                  <p className="mt-2.5 max-w-[30rem] text-base leading-relaxed text-rj-dim lg:text-[1.0625rem]">
                    {principle.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
