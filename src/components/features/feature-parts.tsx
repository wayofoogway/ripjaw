import { ArrowRight } from "lucide-react";
import { featureStatusMeta, type Feature } from "@/config/site";
import { labels, type FeatureDetail } from "@/content/features";
import { cn } from "@/lib/cn";
import { ButtonLink } from "../ui/button";
import { Icon } from "../ui/icon";
import { StatusBadge } from "../ui/status-badge";

/** Icon tile and status badge. The badge wording comes from the site config. */
export function FeatureHead({ feature, size = "md" }: { feature: Feature; size?: "sm" | "md" }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-xl border border-rj-line bg-rj-surface-2 text-rj-text",
          size === "md" ? "size-12" : "size-10",
        )}
      >
        <Icon name={feature.icon} className={size === "md" ? "size-6" : "size-5"} />
      </span>
      <StatusBadge status={feature.status} label={featureStatusMeta[feature.status].label} size={size} />
    </div>
  );
}

/** The stated limitation, shown only for a tool in limited beta. */
export function FeatureLimitation({ feature }: { feature: Feature }) {
  if (feature.status !== "limited_beta") return null;
  if (!feature.limitation) throw new Error(`features: "${feature.id}" is limited_beta and has no limitation`);
  return (
    <p className="mt-3 border-l-2 border-rj-blue/60 pl-4 text-base leading-relaxed text-rj-text">
      {labels.limitation}: {feature.limitation}
    </p>
  );
}

export function FeaturePoints({ points, className }: { points: string[]; className?: string }) {
  return (
    <ul className={cn("space-y-2.5", className)}>
      {points.map((point) => (
        <li key={point} className="relative pl-5 text-base leading-relaxed text-rj-dim">
          <span aria-hidden="true" className="absolute top-[0.7em] left-0 h-px w-2.5 bg-rj-muted" />
          {point}
        </li>
      ))}
    </ul>
  );
}

/** Where the tool sits in the bot's menu, and a link when it has its own page. */
export function FeatureFooter({ detail, className }: { detail: FeatureDetail; className?: string }) {
  if (!detail.menu && !detail.link) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-4", className)}>
      {detail.link && (
        <ButtonLink href={detail.link.href}>
          {detail.link.label}
          <ArrowRight aria-hidden="true" className="size-4 text-rj-dim" />
        </ButtonLink>
      )}
      {detail.menu && (
        <p className="flex items-center gap-2.5 text-[0.8125rem] text-rj-caption">
          {labels.menu}
          <span className="rounded-[9px] bg-tg-button px-2.5 py-1.5 text-[0.8125rem] font-medium text-white">{detail.menu}</span>
        </p>
      )}
    </div>
  );
}
