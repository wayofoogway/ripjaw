import { ledger } from "@/content/meme-radar";
import { Reveal } from "../ui/reveal";
import { Section } from "../ui/section";

/** Three plain statements of where the feature stands, before the walkthrough starts. */
export function Ledger() {
  return (
    <Section spacing="tight" labelledBy="ledger-title">
      <h2 id="ledger-title" className="text-eyebrow text-rj-dim">
        {ledger.label}
      </h2>
      <dl className="mt-8 grid gap-x-8 gap-y-8 md:grid-cols-3">
        {ledger.items.map((item, index) => (
          <Reveal key={item.term} delay={index * 0.06} distance={16} className="border-t border-rj-line-strong pt-5">
            <dt className="text-display-3">{item.term}</dt>
            <dd className="mt-3 max-w-[24rem] text-base leading-relaxed text-rj-dim">{item.detail}</dd>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}
