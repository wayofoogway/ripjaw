import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { FaqEntry } from "@/content/faq";
import { Accordion } from "../ui/accordion";

type FaqAccordionProps = {
  entries: FaqEntry[];
  /** Entry ids that start open. */
  defaultOpen?: string[];
  headingLevel?: "h3" | "h4";
  /** Route the accordion is on. An answer's "more" link is left out when it points back at this page. */
  currentPath: string;
  className?: string;
};

/** FAQ entries in the shared accordion: the answer as text, then a link to the page that says more. */
export function FaqAccordion({ entries, defaultOpen, headingLevel, currentPath, className }: FaqAccordionProps) {
  return (
    <Accordion
      className={className}
      defaultOpen={defaultOpen}
      headingLevel={headingLevel}
      items={entries.map((entry) => ({
        id: entry.id,
        title: entry.question,
        content: (
          <>
            <p>{entry.answer}</p>
            {entry.more && entry.more.href.split("#")[0] !== currentPath && (
              <p>
                <Link href={entry.more.href} className="inline-flex min-h-11 items-center gap-1.5 font-medium">
                  {entry.more.label}
                  <ArrowRight aria-hidden="true" className="size-4 text-rj-dim" />
                </Link>
              </p>
            )}
          </>
        ),
      }))}
    />
  );
}
