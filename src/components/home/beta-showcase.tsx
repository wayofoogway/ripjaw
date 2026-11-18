import { featureStatusMeta, getFeature } from "@/config/site";
import { showcase } from "@/content/home";
import { assets } from "@/lib/assets";
import { Reveal } from "../ui/reveal";
import { Section, SectionHeading } from "../ui/section";
import { ShowcaseTabs } from "./showcase-tabs";

/** "What works in beta": core tools with real bot screens and their current status. */
export function BetaShowcase() {
  const items = showcase.items.map((item) => {
    const feature = getFeature(item.featureId);
    return {
      id: feature.id,
      title: feature.title,
      summary: feature.summary,
      status: feature.status,
      statusLabel: featureStatusMeta[feature.status].label,
      limitation: feature.limitation,
      asset: assets[item.asset],
      alt: item.alt,
      caption: item.caption,
    };
  });
  const allVerified = items.every((item) => item.status === "available_beta" || item.status === "limited_beta");

  return (
    <Section id="beta" labelledBy="beta-title">
      <Reveal>
        <SectionHeading
          id="beta-title"
          eyebrow={showcase.eyebrow}
          title={showcase.title}
          lede={allVerified ? showcase.ledeVerified : showcase.ledeUnverified}
        />
      </Reveal>
      <Reveal className="mt-12 lg:mt-16">
        <ShowcaseTabs items={items} />
      </Reveal>
    </Section>
  );
}
