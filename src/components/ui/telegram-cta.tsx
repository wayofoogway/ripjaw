"use client";

import { Send } from "lucide-react";
import { useReferral } from "@/lib/referral";
import { buttonClasses, ButtonSheen, type ButtonSize, type ButtonVariant } from "./button";

type TelegramCtaProps = {
  label: string;
  /** Where on the page this call to action sits, e.g. "hero". Emitted as `data-cta-location`. */
  location: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

/**
 * The one way to link to the Telegram bot. It reads the visitor's referral
 * code, so every instance carries `?start=ref_<CODE>` when a valid code is
 * present and the standard bot link otherwise.
 */
export function TelegramCta({ label, location, variant = "primary", size = "md", className }: TelegramCtaProps) {
  const { href } = useReferral();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cta="telegram"
      data-cta-location={location}
      className={buttonClasses({ variant, size, className })}
    >
      {variant === "primary" && <ButtonSheen />}
      <span className="relative inline-flex items-center gap-2.5">
        <Send aria-hidden="true" strokeWidth={2} className="size-[1.05em] -translate-x-px translate-y-px" />
        {label}
        <span className="sr-only"> (opens Telegram)</span>
      </span>
    </a>
  );
}
