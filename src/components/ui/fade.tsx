import type { ReactNode } from "react";

/**
 * The site's only motion: content fades in once when it enters the viewport.
 * The styling lives in globals.css under `[data-fade]`, and the script that
 * sets `data-fade="in"` is `fadeScript`, inlined in the document head. Without
 * script, or with reduced motion, the content is visible from the start.
 */
export function Fade({ className, children }: { className?: string; children: ReactNode }) {
  return (
    // The head script may have set `data-fade="in"` before React hydrates.
    <div data-fade="" className={className} suppressHydrationWarning>
      {children}
    </div>
  );
}
