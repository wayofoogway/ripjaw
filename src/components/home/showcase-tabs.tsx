"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { FeatureStatus } from "@/config/site";
import type { RasterAsset } from "@/lib/assets";
import { cn } from "@/lib/cn";
import { Picture } from "../ui/picture";
import { StatusBadge } from "../ui/status-badge";

type ShowcaseItem = {
  id: string;
  title: string;
  summary: string;
  status: FeatureStatus;
  statusLabel: string;
  limitation?: string;
  asset: RasterAsset;
  alt: string;
  caption: string;
};

/** Tabs: pick a tool on the left, see its real bot screen on the right. Arrow keys move between tabs. */
export function ShowcaseTabs({ items }: { items: ShowcaseItem[] }) {
  const baseId = useId();
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = items[selected];
  if (!current) throw new Error("ShowcaseTabs needs at least one item");

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = items.length - 1;
    const next =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? selected === last ? 0 : selected + 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? selected === 0 ? last : selected - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      <div
        role="tablist"
        aria-label="Beta tools"
        className="-mx-6 flex snap-x gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:col-span-5 lg:mx-0 lg:flex-col lg:gap-0 lg:divide-y lg:divide-rj-line lg:overflow-visible lg:border-y lg:border-rj-line lg:px-0 lg:pb-0"
      >
        {items.map((item, index) => {
          const isSelected = index === selected;
          return (
            <button
              key={item.id}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelected(index)}
              onKeyDown={onKeyDown}
              className={cn(
                "group relative shrink-0 snap-start rounded-full border px-4 text-left transition-colors duration-200 lg:rounded-none lg:border-0 lg:py-6 lg:pr-4 lg:pl-6",
                "h-11 lg:h-auto",
                isSelected
                  ? "border-rj-purple/60 bg-rj-purple/10 text-rj-text lg:bg-transparent"
                  : "border-rj-line-strong text-rj-dim hover:text-rj-text",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-y-0 left-0 hidden w-px origin-top bg-linear-to-b from-rj-purple to-rj-green transition-transform duration-300 ease-out-soft lg:block",
                  isSelected ? "scale-y-100" : "scale-y-0",
                )}
              />
              <span className="flex items-center justify-between gap-4">
                <span className="font-display text-[0.9375rem] font-semibold whitespace-nowrap lg:text-[1.375rem] lg:tracking-tight">
                  {item.title}
                </span>
                <StatusBadge size="sm" status={item.status} label={item.statusLabel} className="hidden lg:inline-flex" />
              </span>
              <span
                className={cn(
                  "mt-2 hidden text-[0.9375rem] leading-relaxed lg:block",
                  isSelected ? "text-rj-dim" : "text-rj-caption",
                )}
              >
                {item.summary}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${current.id}`}
        tabIndex={0}
        className="rounded-[22px] lg:col-span-7"
      >
        <div className="mb-5 lg:hidden">
          <StatusBadge size="sm" status={current.status} label={current.statusLabel} />
          <p className="mt-3 text-base leading-relaxed text-rj-dim">{current.summary}</p>
        </div>
        {current.status === "limited_beta" && current.limitation && (
          <p className="mb-4 text-[0.875rem] leading-relaxed text-rj-dim">Limitation: {current.limitation}</p>
        )}
        <figure className="panel relative overflow-hidden rounded-[22px] bg-[#0C0E13]">
          <figcaption className="flex h-12 items-center justify-between gap-4 border-b border-rj-line px-5">
            <span className="text-[0.875rem] font-medium text-rj-text">{current.caption}</span>
            <span className="font-mono text-[0.625rem] tracking-[0.14em] text-rj-caption uppercase">
              Ripjaw bot · sample data
            </span>
          </figcaption>
          <div className="fine-grid relative h-[26rem] overflow-hidden sm:h-[32rem] lg:h-[34rem]">
            <div
              key={current.id}
              className="mx-auto w-[min(100%,23rem)] animate-[panel-in_420ms_var(--ease-out-soft)] pt-6 lg:w-[25rem] lg:pt-8"
            >
              <Picture
                asset={current.asset}
                alt={current.alt}
                sizes="(min-width: 1024px) 400px, 368px"
                imgClassName="block h-auto w-full rounded-t-2xl border border-b-0 border-rj-line shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)]"
              />
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-b from-transparent to-[#0C0E13]"
            />
          </div>
        </figure>
      </div>
    </div>
  );
}
