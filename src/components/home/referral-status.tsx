"use client";

import { Link2 } from "lucide-react";
import { useReferral } from "@/lib/referral";

/** Tells a visitor who arrived with a valid referral code that the Telegram buttons carry it. */
export function ReferralStatus() {
  const { code } = useReferral();
  if (code === null) return null;
  return (
    <p
      data-referral-active=""
      className="mt-5 flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-rj-dim"
    >
      <Link2 aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#8FAEFF]" strokeWidth={1.75} />
      <span>
        You opened this site with the referral code <span className="font-mono text-rj-text">{code}</span>. Telegram
        buttons on this site carry it.
      </span>
    </p>
  );
}
