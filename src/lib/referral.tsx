"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

/**
 * Referral pass-through.
 *
 * A visitor who lands on `/?ref=ABC123` keeps that code for the browser
 * session, and every Telegram call to action becomes
 * `https://t.me/RipjawBot?start=ref_ABC123`. Codes that do not match the
 * pattern are ignored and the standard bot link is used.
 */
export type ReferralSettings = {
  botUrl: string;
  queryParam: string;
  codePattern: string;
  startPrefix: string;
};

type ReferralState = { href: string; code: string | null };

const STORAGE_KEY = "ripjaw.referral";
const ReferralContext = createContext<ReferralState | null>(null);

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

export function ReferralProvider({ settings, children }: { settings: ReferralSettings; children: ReactNode }) {
  const code = useSyncExternalStore(
    subscribe,
    () => resolveCode(settings),
    () => null,
  );
  const state = useMemo<ReferralState>(
    () => ({
      code,
      href: code === null ? settings.botUrl : `${settings.botUrl}?start=${settings.startPrefix}${code}`,
    }),
    [code, settings.botUrl, settings.startPrefix],
  );
  return <ReferralContext.Provider value={state}>{children}</ReferralContext.Provider>;
}

/** The Telegram bot link for this visitor, and the referral code it carries, if any. */
export function useReferral(): ReferralState {
  const state = useContext(ReferralContext);
  if (!state) throw new Error("useReferral must be used inside <ReferralProvider>");
  return state;
}
