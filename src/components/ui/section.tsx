import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Fade } from "./fade";

type SectionProps = {
  /** Anchor id. The heading gets `<id>-title`. */
  id: string;
  title: ReactNode;
  children: ReactNode;
};

/**
 * A page section: a thin divider, the heading on the left and the content on
 * the right from `lg` up, stacked below it.
 */
export function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-rj-line">
      <Fade className="container-rj grid gap-x-12 gap-y-6 py-14 lg:grid-cols-12 lg:py-20">
        <h2 id={`${id}-title`} className="text-heading lg:col-span-4">
          {title}
        </h2>
        <div className="lg:col-span-8">{children}</div>
      </Fade>
    </section>
  );
}

type PageIntroProps = {
  title: ReactNode;
  lede?: ReactNode;
  /** Sits beside the title from `lg` up, below it otherwise. */
  aside?: ReactNode;
  children?: ReactNode;
};

/** The top of a page: its one h1, a line under it, and optionally a screenshot beside them. */
export function PageIntro({ title, lede, aside, children }: PageIntroProps) {
  return (
    <Fade className="container-rj grid gap-x-12 gap-y-10 pt-14 pb-14 lg:grid-cols-12 lg:pt-20 lg:pb-20">
      <div className={cn("max-w-[40rem]", aside ? "lg:col-span-7" : "lg:col-span-12")}>
        <h1 className="text-title">{title}</h1>
        {lede && <p className="text-lede mt-5">{lede}</p>}
        {children}
      </div>
      {aside && <div className="lg:col-span-5">{aside}</div>}
    </Fade>
  );
}

type Row = { key: string; term: ReactNode; detail: ReactNode; note?: ReactNode; id?: string };

/** Plain rows between thin dividers: a term, what it means, and optionally a short note on the right. */
export function Rows({ rows, className }: { rows: Row[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-rj-line border-y border-rj-line", className)}>
      {rows.map((row) => (
        <div
          key={row.key}
          id={row.id}
          className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1 py-4 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_auto]"
        >
          <dt className="font-medium text-rj-text">{row.term}</dt>
          <dd className="col-span-2 row-start-2 text-rj-dim sm:col-span-1 sm:col-start-2 sm:row-start-1">
            {row.detail}
          </dd>
          {row.note && <dd className="col-start-2 row-start-1 text-right sm:col-start-3">{row.note}</dd>}
        </div>
      ))}
    </dl>
  );
}
