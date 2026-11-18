"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";

type RevealProps = {
  /** Seconds. Stagger siblings by passing `index * 0.06`. */
  delay?: number;
  /** Rise distance in px. Keep it small on dense content. */
  distance?: number;
  className?: string;
  children: ReactNode;
};

/**
 * Fades content up once as it scrolls into view. With reduced motion the rise
 * is dropped and only the fade remains. Without JavaScript the content is
 * simply visible (see the <noscript> rule in the root layout).
 */
export function Reveal({ delay = 0, distance = 24, className, children }: RevealProps) {
  return (
    <m.div
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </m.div>
  );
}
