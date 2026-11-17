"use client";

import { useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import * as m from "motion/react-m";
import { createContext, useContext, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useIsDesktop, useMotionAllowed } from "@/lib/use-media-query";

/*
 * The site's one motion strategy: Motion scroll progress mapped to transforms.
 *
 * A <ParallaxScene> measures its own scroll progress (0 to 1). Every
 * <ParallaxLayer> inside maps that progress to translate, scale, rotate or
 * opacity. Planes get their depth from how far they travel:
 *   far 10-30px, middle 30-70px, near 50-110px, foreground text stays put.
 *
 * With reduced motion the layers render as plain static elements. Below the
 * `lg` breakpoint travel distances are halved.
 */

type Track = "from-top" | "through-view" | "pinned";

const OFFSETS = {
  /** 0 when the scene's top meets the viewport top, 1 when it has scrolled out. For heroes. */
  "from-top": ["start start", "end start"],
  /** 0 as the scene enters at the bottom, 0.5 centred, 1 as it leaves at the top. */
  "through-view": ["start end", "end start"],
  /** 0 when the scene's top pins, 1 when its bottom releases. For tall sticky stories. */
  pinned: ["start start", "end end"],
} as const;

const SceneContext = createContext<MotionValue<number> | null>(null);

/** Scroll progress (0 to 1) of the nearest <ParallaxScene>. */
export function useSceneProgress(): MotionValue<number> {
  const progress = useContext(SceneContext);
  if (!progress) throw new Error("useSceneProgress must be used inside <ParallaxScene>");
  return progress;
}

type ParallaxSceneProps = {
  track: Track;
  className?: string;
  children: ReactNode;
};

export function ParallaxScene({ track, className, children }: ParallaxSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: [...OFFSETS[track]] });
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 40, mass: 0.35, restDelta: 0.0004 });
  return (
    <SceneContext.Provider value={progress}>
      <div ref={ref} className={cn("relative", className)}>
        {children}
      </div>
    </SceneContext.Provider>
  );
}

type Range = readonly [from: number, to: number];

type ParallaxLayerProps = {
  /** Vertical travel in px across the scene's progress, e.g. [0, -90]. */
  y?: Range;
  x?: Range;
  scale?: Range;
  /** Degrees. Keep it restrained. */
  rotate?: Range;
  opacity?: Range;
  /** Portion of the scene's progress this layer responds to. Defaults to all of it. */
  span?: Range;
  className?: string;
  children?: ReactNode;
  "aria-hidden"?: boolean;
};

const STILL: Range = [0, 0];
const MOBILE_TRAVEL = 0.5;

export function ParallaxLayer({
  y = STILL,
  x = STILL,
  scale,
  rotate = STILL,
  opacity,
  span = [0, 1],
  className,
  children,
  ...rest
}: ParallaxLayerProps) {
  const progress = useSceneProgress();
  const allowed = useMotionAllowed();
  const travel = useIsDesktop() ? 1 : MOBILE_TRAVEL;
  const input = [span[0], span[1]];
  const clamp = { clamp: true };

  const yValue = useTransform(progress, input, [y[0] * travel, y[1] * travel], clamp);
  const xValue = useTransform(progress, input, [x[0] * travel, x[1] * travel], clamp);
  const rotateValue = useTransform(progress, input, [rotate[0], rotate[1]], clamp);
  const scaleValue = useTransform(progress, input, scale ? [scale[0], scale[1]] : [1, 1], clamp);
  const opacityValue = useTransform(progress, input, opacity ? [opacity[0], opacity[1]] : [1, 1], clamp);

  return (
    <m.div
      className={className}
      style={
        allowed
          ? { x: xValue, y: yValue, rotate: rotateValue, scale: scaleValue, opacity: opacity ? opacityValue : undefined }
          : undefined
      }
      {...rest}
    >
      {children}
    </m.div>
  );
}
