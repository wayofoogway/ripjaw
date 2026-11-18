import { Category } from "@/components/features/category";
import { FeaturesHero } from "@/components/features/hero";
import { FinalCta } from "@/components/home/final-cta";
import { AnchorNav } from "@/components/ui/anchor-nav";
import { getFeature, site, visibleFeatures } from "@/config/site";
import { deepDives, sectionNavLabel } from "@/content/features";
import { routeMetadata } from "@/lib/metadata";

export const metadata = routeMetadata("/features/");

export default function FeaturesPage() {
  const features = visibleFeatures();
  const visibleIds = new Set(features.map((feature) => feature.id));
  /* Deep dives alternate sides down the whole page, not per category. */
  const dives = deepDives
    .filter((dive) => visibleIds.has(dive.featureId))
    .map((dive, index) => ({ feature: getFeature(dive.featureId), dive, flip: index % 2 === 1 }));
  const categories = site.featureCategories
    .map((category) => ({ category, features: features.filter((feature) => feature.category === category.id) }))
    .filter((entry) => entry.features.length > 0);

  return (
    <>
      <FeaturesHero />
      <AnchorNav
        label={sectionNavLabel}
        items={categories.map(({ category, features: list }) => ({ id: category.id, label: category.label, count: list.length }))}
      />
      {categories.map(({ category, features: list }, index) => (
        <Category
          key={category.id}
          category={category}
          number={index + 1}
          features={list}
          dives={dives.filter(({ feature }) => feature.category === category.id)}
        />
      ))}
      <FinalCta />
    </>
  );
}
