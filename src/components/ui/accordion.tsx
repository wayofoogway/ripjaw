"use client";

import { Plus } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  /** Item ids that start open. */
  defaultOpen?: string[];
  /** Heading level wrapping each trigger, to fit the page outline. */
  headingLevel?: "h3" | "h4";
  className?: string;
};

/**
 * Disclosure list. Several items can be open at once. Each trigger is a real
 * button with `aria-expanded`; Up, Down, Home and End move between triggers.
 */
export function Accordion({ items, defaultOpen = [], headingLevel: Heading = "h3", className }: AccordionProps) {
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
    <div className={cn("divide-y divide-rj-line border-y border-rj-line", className)}>
      {items.map((item, index) => {
        const isOpen = open.has(item.id);
        const triggerId = `${baseId}-trigger-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;
        return (
          <div key={item.id}>
            <Heading className="font-sans tracking-normal">
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
                className="group flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left text-[1.0625rem] font-medium text-rj-text transition-colors duration-200 hover:text-white"
              >
                <span>{item.title}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border border-rj-line-strong text-rj-dim transition-[transform,border-color,color] duration-300 ease-out-soft group-hover:border-white/30 group-hover:text-rj-text",
                    isOpen && "rotate-45 border-rj-purple/60 text-rj-text",
                  )}
                >
                  <Plus className="size-4" strokeWidth={2} />
                </span>
              </button>
            </Heading>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              inert={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out-soft",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="max-w-[62ch] pb-6 text-base leading-relaxed text-rj-dim [&_a]:text-rj-text [&_a]:underline [&_a]:underline-offset-4 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-rj-text [&_p+p]:mt-3">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
