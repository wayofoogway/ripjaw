import { ArrowRight } from "lucide-react";
import { getRoute } from "@/config/site";
import { pricingFaq } from "@/content/faq";
import { pricingQuestions } from "@/content/pricing";
import { FaqAccordion } from "../faq/faq-accordion";
import { ButtonLink } from "../ui/button";
import { Reveal } from "../ui/reveal";
import { Section, SectionHeading } from "../ui/section";

/** The money questions from the FAQ, in one column under the costs. */
export function PricingFaq() {
  const [first] = pricingFaq;
  if (!first) throw new Error("PricingFaq: the pricing FAQ has no entries");

  return (
    <Section id="pricing-faq" labelledBy="pricing-faq-title">
      <div className="mx-auto max-w-[46rem]">
        <Reveal>
          <SectionHeading
            id="pricing-faq-title"
            eyebrow={pricingQuestions.eyebrow}
            title={pricingQuestions.title}
            align="center"
          />
        </Reveal>
        <Reveal delay={0.06} className="mt-10 lg:mt-12">
          <FaqAccordion entries={pricingFaq} defaultOpen={[first.id]} currentPath={getRoute("/pricing/").path} />
        </Reveal>
        <div className="mt-8 flex justify-center">
          <ButtonLink href={getRoute("/faq/").path}>
            {pricingQuestions.allLabel}
            <ArrowRight aria-hidden="true" className="size-4 text-rj-dim" />
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
