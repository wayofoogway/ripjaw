import { ArrowRight } from "lucide-react";
import { getRoute } from "@/config/site";
import { faq } from "@/content/home";
import { Accordion } from "../ui/accordion";
import { ButtonLink } from "../ui/button";
import { Reveal } from "../ui/reveal";
import { Section, SectionHeading } from "../ui/section";

/** Eight short answers. Each answer is in the page HTML whether or not its panel is open. */
export function Faq() {
  const faqRoute = getRoute("/faq/");

  return (
    <Section id="faq" labelledBy="faq-title">
      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <SectionHeading id="faq-title" eyebrow="FAQ" title="Questions, answered plainly." />
          <ButtonLink href={faqRoute.path} className="mt-8">
            All questions
            <ArrowRight aria-hidden="true" className="size-4 text-rj-dim" />
          </ButtonLink>
        </Reveal>
        <Reveal delay={0.06} className="lg:col-span-7 lg:col-start-6">
          <Accordion
            defaultOpen={[faq[0]?.id].filter((id) => id !== undefined)}
            items={faq.map((entry) => ({ id: entry.id, title: entry.question, content: <p>{entry.answer}</p> }))}
          />
        </Reveal>
      </div>
    </Section>
  );
}
