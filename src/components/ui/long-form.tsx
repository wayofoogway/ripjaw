import type { ReactNode } from "react";
import { Fade } from "./fade";

export type LongFormSection = {
  /** Anchor id, used by the table of contents. */
  id: string;
  heading: string;
  content: ReactNode;
};

type LongFormProps = {
  title: string;
  lede?: ReactNode;
  /** A line under the title, e.g. the legal draft notice from the site config. */
  notice?: string;
  sections: LongFormSection[];
};

/**
 * Reading layout for docs and legal text: one h1, a 720px column, and a table
 * of contents that stays beside the text on desktop. Body content is styled
 * by the `.prose-rj` rules in globals.css.
 */
export function LongForm({ title, lede, notice, sections }: LongFormProps) {
  return (
    <Fade className="container-rj pt-14 pb-16 lg:pt-20 lg:pb-24">
      <header className="max-w-[45rem]">
        <h1 className="text-title">{title}</h1>
        {lede && <p className="text-lede mt-5">{lede}</p>}
        {notice && <p className="text-label mt-6 text-rj-dim">{notice}</p>}
      </header>

      <div className="mt-12 grid gap-x-16 gap-y-10 lg:mt-16 lg:grid-cols-[13rem_minmax(0,45rem)]">
        <nav aria-label="On this page" className="lg:sticky lg:top-8 lg:self-start">
          <p className="text-label mb-3 text-rj-caption">On this page</p>
          <ol>
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex min-h-11 items-center text-base text-rj-dim underline-offset-4 transition-[color] duration-200 hover:text-rj-text hover:underline lg:min-h-9 lg:text-[0.9375rem]"
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
    </Fade>
  );
}
