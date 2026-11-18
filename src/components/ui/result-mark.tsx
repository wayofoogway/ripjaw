import { CircleCheck, CircleHelp, OctagonX, type LucideIcon } from "lucide-react";

/** The three results a Safety Check can land on. */
export type ResultMark = "pass" | "unknown" | "fail";

const MARKS: Record<ResultMark, { icon: LucideIcon; className: string }> = {
  pass: { icon: CircleCheck, className: "text-rj-pass" },
  unknown: { icon: CircleHelp, className: "text-rj-warn" },
  fail: { icon: OctagonX, className: "text-rj-fail" },
};

/** The icon for a result. Decorative: the result's name is always written beside it. */
export function ResultMarkIcon({ mark }: { mark: ResultMark }) {
  const { icon: Glyph, className } = MARKS[mark];
  return <Glyph aria-hidden="true" data-result={mark} strokeWidth={2} className={`size-4 shrink-0 ${className}`} />;
}
