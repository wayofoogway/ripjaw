import type { Feature, FeatureCategory } from "@/config/site";
import { categoryIntro, labels, type DeepDive as DeepDiveContent } from "@/content/features";
import { cn } from "@/lib/cn";
import { Reveal } from "../ui/reveal";
import { DeepDive } from "./deep-dive";
import { FeatureRow } from "./feature-row";

type CategoryProps = {
  category: { id: FeatureCategory; label: string };
  /** Position on the page, starting at 1. */
  number: number;
  features: Feature[];
  dives: { feature: Feature; dive: DeepDiveContent; flip: boolean }[];
};

/** One chapter of the page: a category title, its illustrated deep dives, then every other tool in the category. */
export function Category({ category, number, features, dives }: CategoryProps) {
  const titleId = `${category.id}-title`;
  const featured = new Set(dives.map(({ feature }) => feature.id));
  const rest = features.filter((feature) => !featured.has(feature.id));

  return (
    <section id={category.id} aria-labelledby={titleId} className="relative border-t border-rj-line py-20 lg:py-28">
      <div className="container-rj">
        <Reveal>
          <header className="grid gap-x-8 gap-y-5 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p aria-hidden="true" className="font-mono text-[0.8125rem] text-rj-caption">
                {String(number).padStart(2, "0")}
              </p>
              <h2 id={titleId} className="text-display-1 mt-3">
                {category.label}
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-lede">{categoryIntro[category.id]}</p>
              <p className="mt-3 font-mono text-[0.75rem] tracking-[0.12em] text-rj-caption uppercase">
                {labels.count(features.length)}
              </p>
            </div>
          </header>
        </Reveal>

        {dives.length > 0 && (
          <div className="mt-6 divide-y divide-rj-line lg:mt-10">
            {dives.map(({ feature, dive, flip }) => (
              <DeepDive key={feature.id} feature={feature} dive={dive} flip={flip} />
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <>
            {dives.length > 0 && <p className="text-eyebrow mt-10 text-rj-dim lg:mt-14">{labels.more(category.label)}</p>}
            <ul className={cn("mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-10", rest.length > 4 && "lg:grid-cols-3")}>
              {rest.map((feature, index) => (
                <li key={feature.id}>
                  <Reveal delay={(index % 3) * 0.05} distance={16} className="h-full">
                    <FeatureRow feature={feature} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
