"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ScrollRowProps = {
  /** Accessible name of the list. */
  label: string;
  className?: string;
  children: ReactNode;
};

/**
 * An ordered list that may scroll sideways on small screens. It joins the tab
 * order only while it actually overflows, so keyboard users can scroll it
 * where it scrolls and skip it where it does not.
 */
export function ScrollRow({ label, className, children }: ScrollRowProps) {
  const ref = useRef<HTMLOListElement>(null);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const measure = () => setScrollable(list.scrollWidth > list.clientWidth + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    measure();
    return () => observer.disconnect();
  }, []);

  return (
    <ol ref={ref} aria-label={label} tabIndex={scrollable ? 0 : undefined} className={className}>
      {children}
    </ol>
  );
}
