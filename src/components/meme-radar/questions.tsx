import { questions } from "@/content/meme-radar";
import { Accordion } from "../ui/accordion";
import { Reveal } from "../ui/reveal";
import { Section, SectionHeading } from "../ui/section";

/** Short answers about the preview. Each answer is in the page HTML whether or not its panel is open. */
export function Questions() {
  const [first] = questions.items;
  if (!first) throw new Error("meme-radar: questions.items is empty");

  return (
    <Section id="questions" labelledBy="questions-title" className="border-t border-rj-line">
      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <SectionHeading id="questions-title" eyebrow={questions.eyebrow} title={questions.title} />
        </Reveal>
        <Reveal delay={0.06} className="lg:col-span-7 lg:col-start-6">
          <Accordion
            defaultOpen={[first.id]}
            items={questions.items.map((entry) => ({ id: entry.id, title: entry.question, content: <p>{entry.answer}</p> }))}
          />
        </Reveal>
      </div>
    </Section>
  );
}
