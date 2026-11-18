import type { Feature } from "@/config/site";
import { detailFor } from "@/content/features";
import { FeatureFooter, FeatureHead, FeatureLimitation, FeaturePoints } from "./feature-parts";

/** A tool without a deep dive: status, what it does, and the detail that matters. */
export function FeatureRow({ feature }: { feature: Feature }) {
  const detail = detailFor(feature);
  const titleId = `${feature.id}-title`;

  return (
    <article
      id={feature.id}
      aria-labelledby={titleId}
      className="flex h-full scroll-mt-4 flex-col border-t border-rj-line-strong pt-6 transition-colors duration-500 target:border-rj-purple lg:scroll-mt-16"
    >
      <FeatureHead feature={feature} size="sm" />
      <h3 id={titleId} className="mt-5 font-sans text-[1.25rem] leading-snug font-semibold tracking-normal text-rj-text">
        {feature.title}
      </h3>
      <p className="mt-2 max-w-[34rem] text-base leading-relaxed text-rj-text">{feature.summary}</p>
      <FeatureLimitation feature={feature} />
      <FeaturePoints points={detail.points} className="mt-4 max-w-[34rem]" />
      <FeatureFooter detail={detail} className="mt-auto pt-6" />
    </article>
  );
}
