"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { FeatureCategory, FeatureStatus, IconName } from "@/config/site";
import { assets } from "@/lib/assets";
import { cn } from "@/lib/cn";
import { Icon } from "../ui/icon";
import { Picture } from "../ui/picture";
import { StatusBadge } from "../ui/status-badge";

type Cell = {
  id: string;
  title: string;
  summary: string;
  category: FeatureCategory;
  icon: IconName;
  status: FeatureStatus;
  statusLabel: string;
  limitation?: string;
  href: string;
  size: "featured" | "wide" | "standard";
};

type BentoGridProps = {
  cells: Cell[];
  categories: { id: FeatureCategory; label: string }[];
  all: { label: string; href: string; count: number };
};

const SPAN: Record<Cell["size"], string> = {
  featured: "sm:col-span-2 lg:row-span-2",
  wide: "sm:col-span-2",
  standard: "",
};

/** Bento of feature cards with a category filter. Cards link to the page that explains the feature. */
export function BentoGrid({ cells, categories, all }: BentoGridProps) {
  const [category, setCategory] = useState<FeatureCategory | "all">("all");
  const shown = category === "all" ? cells : cells.filter((cell) => cell.category === category);

  return (
    <div className="mt-10 lg:mt-14">
      <div role="group" aria-label="Filter features by category" className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none]">
        {[{ id: "all" as const, label: "All" }, ...categories].map((option) => {
          const pressed = category === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={pressed}
              onClick={() => setCategory(option.id)}
              className={cn(
                "h-11 shrink-0 rounded-full border px-4.5 text-[0.9375rem] font-medium transition-colors duration-200",
                pressed
                  ? "border-rj-text bg-rj-text text-rj-bg"
                  : "border-rj-line-strong text-rj-dim hover:border-white/30 hover:text-rj-text",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        Showing {shown.length} of {cells.length} features
      </p>

      <ul className="mt-6 grid grid-flow-dense gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {shown.map((cell) => (
          <li key={cell.id} className={cn("min-w-0", SPAN[cell.size])}>
            <Link
              href={cell.href}
              className={cn(
                "panel card-hover group relative flex h-full flex-col overflow-hidden p-5",
                cell.size === "featured" ? "min-h-[20rem] lg:p-7" : "min-h-[11.5rem]",
              )}
            >
              {cell.size === "featured" && (
                <span aria-hidden="true" className="pointer-events-none absolute inset-0">
                  <Picture
                    asset={assets.memeRadarConcept}
                    alt=""
                    sizes="(min-width: 1024px) 600px, 100vw"
                    imgClassName="absolute inset-0 size-full object-cover object-[60%_50%] opacity-55 transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-0 bg-linear-to-t from-rj-surface via-rj-surface/75 to-transparent" />
                </span>
              )}
              {cell.size === "wide" && (
                <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 sm:block">
                  <Picture
                    asset={assets.safetyShieldConcept}
                    alt=""
                    sizes="320px"
                    imgClassName="absolute inset-0 size-full object-cover opacity-45 [mask-image:linear-gradient(to_right,transparent,#000_70%)] transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
                  />
                </span>
              )}

              <span className="relative flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "grid shrink-0 place-items-center rounded-xl border border-rj-line bg-rj-surface-2 text-rj-text",
                    cell.size === "featured" ? "size-12" : "size-10",
                  )}
                >
                  <Icon name={cell.icon} className={cell.size === "featured" ? "size-6" : "size-5"} />
                </span>
                <StatusBadge size="sm" status={cell.status} label={cell.statusLabel} />
              </span>

              <span className={cn("relative mt-auto block pt-5", cell.size === "wide" && "sm:max-w-[62%]")}>
                <span
                  className={cn(
                    "flex items-center gap-1.5 font-display font-semibold tracking-tight text-rj-text",
                    cell.size === "featured" ? "text-[1.75rem] leading-tight lg:text-[2rem]" : "text-[1.0625rem] leading-snug",
                  )}
                >
                  {cell.title}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-rj-muted transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-rj-text"
                  />
                </span>
                <span
                  className={cn(
                    "mt-1.5 block leading-relaxed text-rj-dim",
                    cell.size === "featured" ? "max-w-[30rem] text-[0.9375rem]" : "text-[0.8125rem]",
                    cell.size === "standard" && "line-clamp-3",
                  )}
                >
                  {cell.summary}
                </span>
                {cell.status === "limited_beta" && cell.limitation && (
                  <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-rj-dim">Limitation: {cell.limitation}</span>
                )}
              </span>
            </Link>
          </li>
        ))}

        <li className="min-w-0">
          <Link
            href={all.href}
            className="edge-gradient card-hover group flex h-full min-h-[11.5rem] flex-col justify-between rounded-[20px] bg-rj-surface-2 p-5"
          >
            <span className="font-mono text-[0.6875rem] tracking-[0.14em] text-rj-caption uppercase">
              {all.count} tools, each with its status
            </span>
            <span className="flex items-center justify-between gap-3 font-display text-[1.375rem] font-semibold tracking-tight text-rj-text">
              {all.label}
              <span className="grid size-10 place-items-center rounded-full border border-rj-line-strong transition-colors duration-200 group-hover:border-white/40">
                <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
