"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type AnchorNavProps = {
  /** Accessible name of the landmark, e.g. "On this page". */
  label: string;
  /** Sections on the current page, in order. Each `id` must exist in the document. */
  items: { id: string; label: string; count?: number }[];
};

/**
 * In-page section links for long product pages. A plain scrollable row on
 * small screens; from `lg` it sticks under the site nav and marks the section
 * being read. The links are ordinary anchors, so they work without script.
 */
export function AnchorNav({ label, items }: AnchorNavProps) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const inBand = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        setActive([...items].reverse().find((item) => inBand.has(item.id))?.id ?? null);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    for (const item of items) {
      const target = document.getElementById(item.id);
      if (!target) throw new Error(`AnchorNav: no element with id "${item.id}"`);
      observer.observe(target);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label={label}
      className="relative z-30 border-y border-rj-line bg-rj-bg lg:sticky lg:top-(--nav-height) lg:bg-rj-bg/80 lg:backdrop-blur-lg"
    >
      <div className="container-rj">
        <ul className="-mx-6 flex gap-1 overflow-x-auto px-6 [scrollbar-width:none] lg:mx-0 lg:-ml-3.5 lg:px-0">
          {items.map((item) => {
            const current = active === item.id;
            return (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  aria-current={current ? "location" : undefined}
                  className={cn(
                    "relative flex h-12 items-center gap-2 px-3.5 text-[0.9375rem] font-medium whitespace-nowrap transition-colors duration-200",
                    current ? "text-rj-text" : "text-rj-dim hover:text-rj-text",
                  )}
                >
                  {item.label}
                  {item.count !== undefined && (
                    <span className="font-mono text-[0.6875rem] text-rj-caption">{item.count}</span>
                  )}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-3.5 bottom-0 h-px origin-left bg-[image:var(--rj-gradient)] transition-transform duration-300 ease-out-soft",
                      current ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
