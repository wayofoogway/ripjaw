"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a media query. Returns false on the server and during
 * hydration, so server-rendered markup is always the static, motion-free
 * version and effects switch on afterwards.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True when the visitor has not asked for reduced motion. */
export function useMotionAllowed(): boolean {
  return useMediaQuery("(prefers-reduced-motion: no-preference)");
}

/** True from the `lg` breakpoint up, where sticky storytelling is used. */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

/** True for a mouse or trackpad, where hover and pointer tilt make sense. */
export function useFinePointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/**
 * True when sticky scroll storytelling is active. Mirrors the `pinned:` CSS
 * variant in globals.css: desktop width and motion allowed.
 */
export function usePinned(): boolean {
  return useMediaQuery("(min-width: 64rem) and (prefers-reduced-motion: no-preference)");
}
