"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { TelegramCta } from "../ui/telegram-cta";

type StickyMobileCtaProps = {
  label: string;
  reminder: string;
  /** Element id that hides the bar while it is on screen. The footer has its own Telegram button. */
  hideWhenVisibleId: string;
};

const SHOW_AFTER_PX = 640;

/**
 * Telegram call to action pinned to the bottom of small screens. It appears
 * once the first screen has scrolled away, and steps aside for the footer.
 */
export function StickyMobileCta({ label, reminder, hideWhenVisibleId }: StickyMobileCtaProps) {
  const [pastFirstScreen, setPastFirstScreen] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setPastFirstScreen(y > SHOW_AFTER_PX));

  useEffect(() => {
    const target = document.getElementById(hideWhenVisibleId);
    if (!target) throw new Error(`StickyMobileCta: no element with id "${hideWhenVisibleId}"`);
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(Boolean(entry?.isIntersecting)));
    observer.observe(target);
    return () => observer.disconnect();
  }, [hideWhenVisibleId]);

  const visible = pastFirstScreen && !footerVisible;

  return (
    <div
      inert={!visible}
      className={cn(
        "safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-rj-line bg-rj-bg/90 backdrop-blur-lg transition-transform duration-300 ease-out-soft lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="container-rj flex items-center justify-between gap-4 py-2.5">
        <p className="text-xs leading-snug text-rj-dim">{reminder}</p>
        <TelegramCta label={label} location="sticky-mobile" className="shrink-0" />
      </div>
    </div>
  );
}
