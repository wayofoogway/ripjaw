import type { ReactNode } from "react";
import { Pill } from "./status-badge";

export type LongFormSection = {
  /** Anchor id, used by the table of contents. */
  id: string;
  heading: string;
  content: ReactNode;
};

type LongFormProps = {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  /** Shown as a pill under the title, e.g. the legal draft notice from the site config. */
  notice?: string;
  sections: LongFormSection[];
};

/**
 * Reading layout for legal and other long text: one h1, a 720px column, and a
 * table of contents that sticks beside the text on desktop. Body content is
 * styled by the `.prose-rj` rules in globals.css.
 */
export function LongForm({ eyebrow, title, lede, notice, sections }: LongFormProps) {
  return (
    <div className="container-rj pt-16 pb-24 lg:pt-24 lg:pb-32">
      <header className="max-w-[45rem]">
        {eyebrow && <p className="text-eyebrow mb-5 text-rj-dim">{eyebrow}</p>}
        <h1 className="text-display-2">{title}</h1>
        {lede && <p className="text-lede mt-5">{lede}</p>}
        {notice && <Pill className="mt-6 h-auto py-1.5 leading-snug">{notice}</Pill>}
      </header>

      <div className="mt-12 grid gap-x-16 gap-y-10 lg:mt-16 lg:grid-cols-[13rem_minmax(0,45rem)]">
        <nav aria-label="On this page" className="lg:sticky lg:top-[calc(var(--nav-height)+2rem)] lg:self-start">
          <p className="text-eyebrow mb-4 text-rj-caption">On this page</p>
          <ol className="space-y-1 border-l border-rj-line">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="-ml-px flex min-h-11 items-center border-l border-transparent pl-4 text-[0.9375rem] text-rj-dim transition-colors duration-200 hover:border-rj-purple hover:text-rj-text lg:min-h-9"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="prose-rj">
          {sections.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`}>
              <h2 id={`${section.id}-heading`}>{section.heading}</h2>
              {section.content}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
