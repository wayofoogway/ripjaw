"use client";

import { Check, Copy, X } from "lucide-react";
import { useEffect, useState } from "react";

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
      className="inline-flex h-11 min-w-[6.5rem] shrink-0 items-center justify-end gap-2 text-[0.9375rem] font-medium text-rj-dim transition-[color] duration-200 hover:text-rj-text"
    >
      <Glyph aria-hidden="true" className="size-3.5" strokeWidth={2} />
      <span aria-live="polite">{labels[state]}</span>
      <span className="sr-only"> {value}</span>
    </button>
  );
}
