import { featureStatusMeta, getFeature, site, visibleFeatures } from "@/config/site";
import { bento } from "@/content/home";
import { Reveal } from "../ui/reveal";
import { Section, SectionHeading } from "../ui/section";
import { BentoGrid } from "./bento-grid";

/** Feature overview by category. Every card shows the feature's status from the site config. */
export function FeaturesBento() {
  const visible = new Set(visibleFeatures().map((feature) => feature.id));
  const cells = bento.cells
    .filter((cell) => visible.has(cell.id))
    .map((cell) => {
      const feature = getFeature(cell.id);
      return {
        id: feature.id,
        title: feature.title,
        summary: feature.summary,
        category: feature.category,
        icon: feature.icon,
        status: feature.status,
        statusLabel: featureStatusMeta[feature.status].label,
        limitation: feature.limitation,
        href: feature.href,
        size: cell.size,
      };
    });

  return (
    <Section id="features" labelledBy="features-title">
      <Reveal>
        <SectionHeading id="features-title" eyebrow={bento.eyebrow} title={bento.title} lede={bento.lede} />
      </Reveal>
      <BentoGrid
        cells={cells}
        categories={site.featureCategories}
        all={{ label: bento.allLabel, href: "/features/", count: visible.size }}
      />
    </Section>
  );
}
