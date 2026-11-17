"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { FeatureStatus } from "@/config/site";
import { cn } from "@/lib/cn";
import { useIsDesktop } from "@/lib/use-media-query";
import { StatusBadge } from "../ui/status-badge";
import { TelegramCta } from "../ui/telegram-cta";
import { Lockup } from "./lockup";

export type NavItem = {
  path: string;
  label: string;
  /** Status chip shown beside the label, e.g. Meme Radar's "Preview". */
  chip?: { status: FeatureStatus; label: string };
};

type SiteNavProps = {
  items: NavItem[];
  ctaLabel: string;
  microcopy: string;
  xLink: { href: string; label: string };
};

function isCurrent(pathname: string, path: string): boolean {
  const normalised = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return normalised === path;
}

export function SiteNav({ items, ctaLabel, microcopy, xLink }: SiteNavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 48));

  return (
    <>
    <header
      className={cn(
        "sticky top-0 z-50 h-(--nav-height) border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-rj-line bg-rj-bg/75 backdrop-blur-lg backdrop-saturate-150"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="container-rj flex h-full items-center justify-between gap-6">
        <Link href="/" aria-label="Ripjaw home" className="-ml-1 flex h-11 items-center rounded-lg px-1">
          <Lockup className="h-7 w-auto" />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => {
              const current = isCurrent(pathname, item.path);
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-full px-3.5 text-[0.9375rem] font-medium transition-colors duration-200",
                      current ? "text-rj-text" : "text-rj-dim hover:text-rj-text",
                    )}
                  >
                    {item.label}
                    {item.chip && <StatusBadge size="sm" status={item.chip.status} label={item.chip.label} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <TelegramCta label={ctaLabel} location="nav" />
          </div>
          <button
            type="button"
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="-mr-2 grid size-11 place-items-center rounded-full text-rj-text transition-colors duration-200 hover:bg-white/[0.06] lg:hidden"
          >
            <Menu aria-hidden="true" className="size-6" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
    {/* Outside the header: its backdrop filter would otherwise contain this fixed panel. */}
    {menuOpen && (
      <MobileMenu
        items={items}
        pathname={pathname}
        ctaLabel={ctaLabel}
        microcopy={microcopy}
        xLink={xLink}
        onClose={() => setMenuOpen(false)}
      />
    )}
    </>
  );
}

type MobileMenuProps = Omit<SiteNavProps, "items"> & {
  items: NavItem[];
  pathname: string;
  onClose: () => void;
};

/**
 * Full-screen menu for small screens. It locks page scroll only while open,
 * keeps Tab inside the panel, closes on Escape or when the viewport reaches
 * the desktop breakpoint, and hands focus back to the menu button.
 */
function MobileMenu({ items, pathname, ctaLabel, microcopy, xLink, onClose }: MobileMenuProps) {
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, []);

  useEffect(() => {
    if (isDesktop) onClose();
  }, [isDesktop, onClose]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    if (event.key !== "Tab" || !panel.current) return;
    const focusable = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[70] flex animate-[menu-in_220ms_var(--ease-out-soft)] flex-col overflow-y-auto overscroll-contain bg-rj-bg lg:hidden"
    >
      <div className="container-rj flex h-(--nav-height) shrink-0 items-center justify-between">
        <Link href="/" aria-label="Ripjaw home" onClick={onClose} className="-ml-1 flex h-11 items-center rounded-lg px-1">
          <Lockup className="h-7 w-auto" />
        </Link>
        <button
          ref={closeButton}
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="-mr-2 grid size-11 place-items-center rounded-full text-rj-text transition-colors duration-200 hover:bg-white/[0.06]"
        >
          <X aria-hidden="true" className="size-6" strokeWidth={1.75} />
        </button>
      </div>

      <nav aria-label="Main" className="container-rj mt-4 flex-1">
        <ul className="divide-y divide-rj-line border-y border-rj-line">
          {items.map((item) => {
            const current = isCurrent(pathname, item.path);
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={onClose}
                  aria-current={current ? "page" : undefined}
                  className="flex min-h-16 items-center justify-between gap-4 font-display text-2xl font-semibold tracking-tight text-rj-text"
                >
                  {item.label}
                  {item.chip && <StatusBadge size="sm" status={item.chip.status} label={item.chip.label} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="container-rj safe-bottom mt-8 shrink-0">
        <div className="pb-8">
          <TelegramCta label={ctaLabel} location="mobile-menu" size="lg" className="w-full" />
          <p className="mt-4 text-center text-[0.8125rem] leading-relaxed text-rj-caption">{microcopy}</p>
          <a
            href={xLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto mt-3 flex h-11 w-fit items-center gap-1.5 text-[0.9375rem] text-rj-dim hover:text-rj-text"
          >
            {xLink.label}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
