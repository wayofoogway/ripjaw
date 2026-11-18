"use client";

import { Minus, Plus } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  /** Item ids that start open. */
  defaultOpen?: string[];
};

/**
 * Disclosure list between thin dividers. Several items can be open at once.
 * Each trigger is a real button with `aria-expanded`; Up, Down, Home and End
 * move between triggers. Closed answers stay in the HTML.
 */
export function Accordion({ items, defaultOpen = [] }: AccordionProps) {
  const baseId = useId();
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set(defaultOpen));
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    const target =
      event.key === "ArrowDown"
        ? index === last ? 0 : index + 1
        : event.key === "ArrowUp"
          ? index === 0 ? last : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (target === null) return;
    event.preventDefault();
    triggers.current[target]?.focus();
  };

  return (
    <div className="divide-y divide-rj-line border-y border-rj-line">
      {items.map((item, index) => {
        const isOpen = open.has(item.id);
        const triggerId = `${baseId}-trigger-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;
        const Glyph = isOpen ? Minus : Plus;
        return (
          <div key={item.id}>
            <h2 className="font-sans">
              <button
                ref={(node) => {
                  triggers.current[index] = node;
                }}
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className="flex min-h-14 w-full items-center justify-between gap-6 py-4 text-left text-[1.0625rem] font-medium text-rj-text"
              >
                <span>{item.title}</span>
                <Glyph aria-hidden="true" className="size-4 shrink-0 text-rj-caption" strokeWidth={2} />
              </button>
            </h2>
            <div id={panelId} role="region" aria-labelledby={triggerId} hidden={!isOpen}>
              <div className="max-w-[60ch] pb-6 text-base leading-relaxed text-rj-dim [&_p+p]:mt-2">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
