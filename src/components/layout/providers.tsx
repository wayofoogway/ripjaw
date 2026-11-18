"use client";

import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { ReferralProvider, type ReferralSettings } from "@/lib/referral";

/** Client-side context for the whole site: lazy Motion features, reduced-motion handling and referrals. */
export function Providers({ referral, children }: { referral: ReferralSettings; children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <ReferralProvider settings={referral}>{children}</ReferralProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
