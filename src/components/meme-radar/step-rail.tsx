"use client";

import { useTransform } from "motion/react";
import * as m from "motion/react-m";
import { usePinned } from "@/lib/use-media-query";
import { useSceneProgress } from "../ui/parallax";

/**
 * The line from one workflow step to the next. On desktop with motion allowed
 * it draws as the step scrolls through the viewport; otherwise it is a plain
 * hairline.
 */
export function StepRail() {
  const progress = useSceneProgress();
  const pinned = usePinned();
  const scaleY = useTransform(progress, [0.3, 0.72], [0, 1], { clamp: true });

  return (
    <span aria-hidden="true" className="absolute top-12 bottom-0 left-[1.1875rem] hidden w-px bg-white/10 lg:block">
      <m.span
        className="absolute inset-0 hidden origin-top bg-linear-to-b from-rj-purple via-rj-blue to-rj-green/70 pinned:block"
        style={pinned ? { scaleY } : undefined}
      />
    </span>
  );
}
