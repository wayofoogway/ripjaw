import type { Feature } from "@/config/site";
import { detailFor, type DeepDive as DeepDiveContent } from "@/content/features";
import { cn } from "@/lib/cn";
import { ParallaxScene } from "../ui/parallax";
import { Reveal } from "../ui/reveal";
import { FeatureMedia } from "./feature-media";
import { FeatureFooter, FeatureHead, FeatureLimitation, FeaturePoints } from "./feature-parts";

type DeepDiveProps = {
  feature: Feature;
  dive: DeepDiveContent;
  /** Puts the picture on the left from `lg`. Dives alternate down the page. */
  flip: boolean;
};

/** One tool with room to explain itself: text on one side, kit imagery on the other. */
export function DeepDive({ feature, dive, flip }: DeepDiveProps) {
  const detail = detailFor(feature);
  const titleId = `${feature.id}-title`;

  return (
    <article id={feature.id} aria-labelledby={titleId} className="scroll-mt-4 lg:scroll-mt-16">
      <ParallaxScene track="through-view" className="grid items-center gap-x-8 gap-y-10 py-12 lg:grid-cols-12 lg:py-20">
        <div className={cn("lg:col-span-5 lg:row-start-1", flip && "lg:col-start-8")}>
          <Reveal>
            <FeatureHead feature={feature} />
            <h3 id={titleId} className="text-display-2 mt-6 lg:text-[clamp(2rem,3vw,2.75rem)]">
              {feature.title}
            </h3>
            <p className="text-lede mt-4">{feature.summary}</p>
            <FeatureLimitation feature={feature} />
            <FeaturePoints points={detail.points} className="mt-7 border-t border-rj-line pt-6" />
            <FeatureFooter detail={detail} className="mt-8" />
          </Reveal>
        </div>
        <figure className={cn("lg:col-span-6 lg:row-start-1", flip ? "lg:col-start-1" : "lg:col-start-7")}>
          <FeatureMedia media={dive.media} alt={dive.alt} />
          <figcaption className="mt-4 font-mono text-[0.6875rem] tracking-[0.08em] text-rj-caption">{dive.caption}</figcaption>
        </figure>
      </ParallaxScene>
    </article>
  );
}
