"use client";

import { Check, Copy, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type CopyButtonProps = {
  /** Text placed on the clipboard. */
  value: string;
  labels: { idle: string; done: string; failed: string };
};

type CopyState = "idle" | "done" | "failed";

const ICONS = { idle: Copy, done: Check, failed: X };
const RESET_AFTER_MS = 2000;

/**
 * Copies a bot command. The button reports what actually happened: when the
 * browser refuses clipboard access it says so, and the command beside it stays
 * selectable text.
 */
export function CopyButton({ value, labels }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), RESET_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState("done");
    } catch {
      setState("failed");
    }
  };

  const Glyph = ICONS[state];
  return (
    <button
      type="button"
      onClick={copy}
      data-copy-state={state}
      className={cn(
        "inline-flex h-11 min-w-[5.75rem] shrink-0 items-center justify-center gap-2 rounded-full border px-3.5 font-mono text-[0.75rem] font-medium tracking-[0.04em] transition-colors duration-200 lg:h-9",
        state === "idle" && "border-rj-line-strong text-rj-dim hover:border-white/30 hover:text-rj-text",
        state === "done" && "border-rj-blue/50 bg-rj-blue/10 text-rj-text",
        state === "failed" && "border-rj-warn/50 text-rj-warn",
      )}
    >
      <Glyph aria-hidden="true" className="size-3.5" strokeWidth={2} />
      <span aria-live="polite">{labels[state]}</span>
      <span className="sr-only"> {value}</span>
    </button>
  );
}
