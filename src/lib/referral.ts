"use client";

import { useSyncExternalStore } from "react";

/**
 * Referral codes for the early access form.
 *
 * A visitor who lands on `/?ref=ABC123` keeps that code for the browser
 * session, and the form sends it with the sign-up. A code that does not match
 * the pattern is ignored. Nothing here runs while early access is on hold,
 * because the form is not rendered.
 */
export type ReferralSettings = { queryParam: string; codePattern: string };

const STORAGE_KEY = "ripjaw.referral";

function readStored(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function store(code: string): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* Storage can be blocked. The code still applies to this page view. */
  }
}

function resolveCode(settings: ReferralSettings): string | null {
  const pattern = new RegExp(settings.codePattern);
  const fromUrl = new URLSearchParams(window.location.search).get(settings.queryParam);
  if (fromUrl !== null && pattern.test(fromUrl)) {
    if (readStored() !== fromUrl) store(fromUrl);
    return fromUrl;
  }
  const stored = readStored();
  return stored !== null && pattern.test(stored) ? stored : null;
}

const subscribe = () => () => {};

/** The visitor's valid referral code, or null. Always null on the server and during hydration. */
export function useReferralCode(settings: ReferralSettings): string | null {
  return useSyncExternalStore(
    subscribe,
    () => resolveCode(settings),
    () => null,
  );
}
