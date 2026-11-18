import { CircleCheck, CircleHelp, Minus, OctagonX, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/** How one line of a check result reads. `info` is a figure shown for context. */
export type ResultMark = "pass" | "unknown" | "fail" | "info";

export const RESULT_MARK: Record<ResultMark, { icon: LucideIcon; text: string; edge: string }> = {
  pass: { icon: CircleCheck, text: "text-rj-pass", edge: "border-rj-pass/60" },
  unknown: { icon: CircleHelp, text: "text-rj-warn", edge: "border-rj-warn/60" },
  fail: { icon: OctagonX, text: "text-rj-fail", edge: "border-rj-fail/60" },
  info: { icon: Minus, text: "text-rj-caption", edge: "border-rj-line-strong" },
};

type ResultMarkGlyphProps = {
  mark: ResultMark;
  /** The word for the mark, e.g. "Passed". Read by assistive tech; shown beside the icon when `showLabel` is set. */
  label: string;
  showLabel?: boolean;
  className?: string;
};

/** A result mark as an icon plus its word, so the result never depends on colour alone. */
export function ResultMarkGlyph({ mark, label, showLabel = false, className }: ResultMarkGlyphProps) {
  const tone = RESULT_MARK[mark];
  const Glyph = tone.icon;
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5", tone.text, className)}>
      <Glyph aria-hidden="true" strokeWidth={2} className="size-4" />
      <span className={showLabel ? "text-[0.8125rem] font-medium" : "sr-only"}>{label}</span>
    </span>
  );
}
