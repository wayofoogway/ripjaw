import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Telegram dark-theme pieces recreated from the kit's `mockups/src/*.html`
 * (colours, radii and type sizes are taken from that CSS). They are real text
 * for screen readers and stay sharp at any size. They illustrate the bot; none
 * of them is an interactive control.
 */

/** Emoji as the bot uses them, hidden from assistive tech because the text beside them carries the meaning. */
export function Emoji({ children }: { children: string }) {
  return (
    <span aria-hidden="true" className="font-[system-ui,'Apple_Color_Emoji','Segoe_UI_Emoji','Noto_Color_Emoji',sans-serif]">
      {children}
    </span>
  );
}

/** An incoming bot message. */
export function TgBubble({ time, className, children }: { time?: string; className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-[14px] rounded-bl-[4px] bg-tg-bubble px-3 py-2 text-[0.875rem] leading-[1.42] text-[#F5F5F5] [&_a]:text-tg-link [&_b]:font-semibold",
        className,
      )}
    >
      {children}
      {time && <span className="float-right mt-2 -mb-1 ml-2.5 text-[0.6875rem] text-tg-meta">{time}</span>}
    </div>
  );
}

/** One row of the bot's inline keyboard, drawn as static labels. */
export function TgKeyboardRow({ labels, className }: { labels: ReactNode[]; className?: string }) {
  return (
    <div className={cn("flex gap-1", className)}>
      {labels.map((label, index) => (
        <span
          key={index}
          className="flex-1 truncate rounded-[9px] bg-tg-button/90 px-2 py-2 text-center text-[0.8125rem] font-medium text-white"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
