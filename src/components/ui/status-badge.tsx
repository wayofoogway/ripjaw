import { BadgeCheck, CalendarClock, CircleDot, FlaskConical, Hourglass, type LucideIcon } from "lucide-react";
import type { FeatureStatus } from "@/config/site";
import { cn } from "@/lib/cn";

const TONES: Record<FeatureStatus, { icon: LucideIcon; className: string }> = {
  available_beta: {
    icon: BadgeCheck,
    className: "border-rj-blue/50 bg-rj-blue/10 text-rj-text [&>svg]:text-[#8FAEFF]",
  },
  limited_beta: {
    icon: CircleDot,
    className: "border-rj-blue/35 bg-transparent text-rj-text [&>svg]:text-[#8FAEFF]",
  },
  in_development: {
    icon: FlaskConical,
    className: "border-rj-purple/55 bg-rj-purple/10 text-[#DCC8FF] [&>svg]:text-[#C39BFF]",
  },
  planned: {
    icon: CalendarClock,
    className: "border-dashed border-rj-line-strong bg-transparent text-rj-dim",
  },
  unverified: {
    icon: Hourglass,
    className: "border-rj-line-strong bg-white/[0.03] text-rj-dim",
  },
};

type StatusBadgeProps = {
  status: FeatureStatus;
  /** Text from `featureStatusMeta[status].label` (or `.short`). The label, not the colour, carries the meaning. */
  label: string;
  size?: "sm" | "md";
  className?: string;
};

/** Availability pill. Each status has its own icon and wording, so it never relies on colour alone. */
export function StatusBadge({ status, label, size = "md", className }: StatusBadgeProps) {
  const tone = TONES[status];
  const Glyph = tone.icon;
  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border font-mono font-medium tracking-[0.08em] uppercase",
        size === "sm" ? "h-6 px-2 text-[0.625rem]" : "h-7 px-2.5 text-[0.6875rem]",
        tone.className,
        className,
      )}
    >
      <Glyph aria-hidden="true" strokeWidth={2} className={size === "sm" ? "size-3" : "size-3.5"} />
      {label}
    </span>
  );
}

/** Neutral outlined pill for labels that are not a feature status, e.g. "Public Beta" or "Demo · sample data". */
export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "beta";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-full border px-3 font-mono text-[0.6875rem] font-medium tracking-[0.14em] uppercase",
        tone === "beta"
          ? "border-rj-purple/55 bg-rj-purple/[0.08] text-[#DCC8FF]"
          : "border-rj-line-strong bg-white/[0.03] text-rj-dim",
        className,
      )}
    >
      {children}
    </span>
  );
}
