import type { FeatureStatus } from "@/config/site";
import { cn } from "@/lib/cn";

type StatusLabelProps = {
  status: FeatureStatus;
  /** Text from `featureStatusMeta[status].label`. The words carry the meaning; there is no colour code. */
  label: string;
  className?: string;
};

/** A feature's status as plain small text. */
export function StatusLabel({ status, label, className }: StatusLabelProps) {
  return (
    <span data-status={status} className={cn("text-label text-rj-caption", className)}>
      {label}
    </span>
  );
}
