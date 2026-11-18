import { glossary } from "@/content/safety";
import { Reveal } from "../ui/reveal";
import { Section, SectionHeading } from "../ui/section";

/** Plain definitions, each with its own anchor so other pages can link to a term. */
export function Glossary() {
  return (
    <Section id="glossary" labelledBy="glossary-title">
      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--nav-height)+5rem)]">
            <SectionHeading id="glossary-title" eyebrow={glossary.eyebrow} title={glossary.title} />
          </div>
        </Reveal>
        <Reveal delay={0.06} className="lg:col-span-7 lg:col-start-6">
          <dl className="grid gap-x-10 border-t border-rj-line sm:grid-cols-2">
            {glossary.terms.map((entry) => (
              <div key={entry.id} id={entry.id} className="scroll-mt-32 border-b border-rj-line py-5">
                <dt className="font-display text-[1.125rem] font-semibold tracking-tight text-rj-text">{entry.term}</dt>
                <dd className="mt-1.5 text-base leading-relaxed text-rj-dim">{entry.definition}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  );
}
