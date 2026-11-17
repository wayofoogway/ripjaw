"use client";

import { useSpring } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, type ReactNode } from "react";
import { useFinePointer, useIsDesktop, useMotionAllowed } from "@/lib/use-media-query";

const MAX_TILT_DEG = 4;
const SPRING = { stiffness: 90, damping: 18, mass: 0.6 };

/**
 * Holds the hero's product plane in a shallow 3D stage. On desktop with a
 * mouse it tilts a few degrees towards the pointer and eases back to rest
 * when the pointer leaves the hero. Touch devices and reduced motion get the
 * resting pose only.
 */
export function HeroPhones({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const enabled = [useMotionAllowed(), useIsDesktop(), useFinePointer()].every(Boolean);
  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);

  useEffect(() => {
    const hero = stage.current?.closest("section");
    if (!enabled || !hero) return;

    const onMove = (event: PointerEvent) => {
      const box = hero.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width - 0.5;
      const py = (event.clientY - box.top) / box.height - 0.5;
      rotateY.set(px * 2 * MAX_TILT_DEG);
      rotateX.set(-py * 2 * MAX_TILT_DEG);
    };
    const onLeave = () => {
      rotateX.set(0);
      rotateY.set(0);
    };

    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, [enabled, rotateX, rotateY]);

  return (
    <div ref={stage} className="[perspective:1600px]">
      <m.div
        className="relative [transform-style:preserve-3d]"
        style={enabled ? { rotateX, rotateY } : undefined}
      >
        {children}
      </m.div>
    </div>
  );
}
