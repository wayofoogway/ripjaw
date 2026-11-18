import Link from "next/link";
import { EarlyAccessSection } from "@/components/early-access/early-access";
import { Screenshot } from "@/components/ui/screenshot";
import { PageIntro, Rows, Section } from "@/components/ui/section";
import { StatusLabel } from "@/components/ui/status-label";
import { featureStatusMeta, site, visibleFeatures } from "@/config/site";
import { featureLinks, intro, legend, limitationLabel } from "@/content/features";
import { routeMetadata } from "@/lib/metadata";

export const metadata = routeMetadata("/features/");

export default function FeaturesPage() {
  const features = visibleFeatures();
  const categories = site.featureCategories
    .map((category) => ({ category, features: features.filter((feature) => feature.category === category.id) }))
    .filter((entry) => entry.features.length > 0);

  return (
    <>
      <PageIntro
        title={intro.title}
        lede={intro.lede}
        aside={
          <Screenshot
            asset="chatHomeMenu"
            alt={intro.screenshot.alt}
            caption={intro.screenshot.caption}
            priority
            className="lg:ml-auto"
          />
        }
      >
        <div className="mt-10">
          <h2 className="text-label mb-3 text-rj-caption">{legend.label}</h2>
          <Rows
            rows={legend.items.map((item) => ({ key: item.status, term: item.label, detail: item.explanation }))}
          />
        </div>
      </PageIntro>

      {categories.map(({ category, features: list }) => (
        <Section key={category.id} id={category.id} title={category.label}>
          <Rows
            rows={list.map((feature) => {
              const link = featureLinks[feature.id];
              return {
                key: feature.id,
                id: feature.id,
                term: feature.title,
                detail: (
                  <>
                    <p>{feature.summary}</p>
                    {feature.limitation && (
                      <p className="mt-1">
                        {limitationLabel}: {feature.limitation}
                      </p>
                    )}
                    {link && (
                      <p>
                        <Link href={link.href} className="link">
                          {link.label}
                        </Link>
                      </p>
                    )}
                  </>
                ),
                note: <StatusLabel status={feature.status} label={featureStatusMeta[feature.status].label} />,
              };
            })}
          />
        </Section>
      ))}

      <EarlyAccessSection />
    </>
  );
}
