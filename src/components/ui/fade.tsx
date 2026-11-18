"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The site's only motion: content fades in once when it enters the viewport.
 * The styling lives in globals.css under `[data-fade]`. Without script, or
 * with reduced motion, the content is visible from the start.
 */
export function Fade({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setShown(true);
        observer.disconnect();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-fade={shown ? "in" : ""} className={className}>
      {children}
    </div>
  );
}
