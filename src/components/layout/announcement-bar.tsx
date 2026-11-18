"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type AnnouncementBarProps = {
  text: string;
  linkLabel: string;
  href: string;
};

/** Slim beta notice above the nav. Dismissing it lasts until the next full page load. */
export function AnnouncementBar({ text, linkLabel, href }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <aside aria-label="Announcement" className="relative z-[55] bg-rj-surface">
      <div className="container-rj flex min-h-11 items-center justify-center gap-x-3 py-2 pr-12 text-[0.8125rem] leading-snug text-rj-dim sm:pr-14">
        <p>
          {text}{" "}
          <Link
            href={href}
            className="group relative inline-flex items-center gap-1 font-medium whitespace-nowrap text-rj-text underline-offset-4 after:absolute after:-inset-x-2 after:-inset-y-3.5 hover:underline"
          >
            {linkLabel}
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-full text-rj-caption transition-colors duration-200 hover:text-rj-text sm:right-3"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
      <div aria-hidden="true" className="pointer-events-none h-px bg-[image:var(--rj-gradient)] opacity-50" />
    </aside>
  );
}
