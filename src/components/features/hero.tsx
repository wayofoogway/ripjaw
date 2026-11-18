import { ArrowDown } from "lucide-react";
import { featureStatusMeta, site, visibleFeatures, type FeatureStatus } from "@/config/site";
import { hero } from "@/content/features";
import { assets } from "@/lib/assets";
import { ButtonLink } from "../ui/button";
import { ParallaxLayer, ParallaxScene } from "../ui/parallax";
import { Picture } from "../ui/picture";
import { StatusBadge } from "../ui/status-badge";
import { TelegramCta } from "../ui/telegram-cta";

/** Opening scene: the bot's own menu as the far plane, and the key to the status labels in front of it. */
export function FeaturesHero() {
  const features = visibleFeatures();
  const firstCategory = site.featureCategories[0];
  if (!firstCategory) throw new Error("features: site.featureCategories is empty");
  const statuses = (Object.keys(featureStatusMeta) as FeatureStatus[])
    .map((status) => ({ status, count: features.filter((feature) => feature.status === status).length }))
    .filter((entry) => entry.count > 0);

  return (
    <section aria-labelledby="page-title" className="relative isolate -mt-(--nav-height) overflow-clip">
      <ParallaxScene track="from-top" className="pt-(--nav-height)">
        <ParallaxLayer y={[0, 34]} className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="fine-grid absolute inset-0 [mask-image:radial-gradient(70%_70%_at_70%_40%,#000,transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(42%_52%_at_78%_38%,rgb(153_69_255/0.2),transparent_70%),radial-gradient(36%_46%_at_92%_78%,rgb(20_241_149/0.1),transparent_70%)]" />
        </ParallaxLayer>

        <div className="container-rj grid items-center gap-y-14 pt-12 pb-20 lg:min-h-[42rem] lg:grid-cols-12 lg:gap-x-6 lg:pt-10 lg:pb-24">
          <div className="lg:col-span-6">
            <p className="text-eyebrow text-rj-dim">{hero.eyebrow}</p>
            <h1 id="page-title" className="text-display-1 mt-5 max-w-[11ch]">
              {hero.title}
            </h1>
            <p className="text-lede mt-6 max-w-[35rem] lg:mt-7">{hero.lede}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-10">
              <TelegramCta label={site.cta.primary.label} location="features-hero" size="lg" />
              <ButtonLink href={`#${firstCategory.id}`} size="lg">
                {hero.secondary.label}
                <ArrowDown aria-hidden="true" className="size-4 text-rj-dim" />
              </ButtonLink>
            </div>
            <p className="mt-6 max-w-[31rem] text-[0.8125rem] leading-relaxed text-rj-caption">{hero.note}</p>
          </div>

          <div className="relative mx-auto w-full max-w-[25rem] pb-24 lg:col-span-5 lg:col-start-8 lg:max-w-[27rem] lg:pb-16">
            <ParallaxLayer y={[0, -34]}>
              <figure className="rotate-[2deg]">
                <div className="overflow-hidden rounded-[22px] border border-rj-line bg-tg-bg shadow-[0_50px_110px_-40px_rgb(0_0_0/0.95)] [mask-image:linear-gradient(to_bottom,#000_58%,transparent_96%)]">
                  <Picture
                    asset={assets.chatHomeMenu}
                    alt={hero.visualAlt}
                    sizes="(min-width: 1024px) 432px, 90vw"
                    priority
                    imgClassName="block h-auto w-full"
                  />
                </div>
                <figcaption className="sr-only">{hero.caption}</figcaption>
              </figure>
            </ParallaxLayer>
            <ParallaxLayer y={[0, -78]} className="absolute right-[6%] bottom-0 left-0 lg:right-[14%] lg:-left-[16%]">
              <div className="glass rounded-[20px] p-5 shadow-[0_30px_70px_-24px_rgb(0_0_0/0.95)]">
                <p className="font-mono text-[0.6875rem] tracking-[0.12em] text-rj-caption uppercase">{hero.legendTitle}</p>
                <dl className="mt-4 space-y-4">
                  {statuses.map(({ status, count }) => (
                    <div key={status}>
                      <dt className="flex items-center justify-between gap-3">
                        <StatusBadge status={status} label={featureStatusMeta[status].label} />
                        <span className="font-mono text-[0.75rem] text-rj-caption">{hero.legendCount(count)}</span>
                      </dt>
                      <dd className="mt-1.5 text-base leading-snug text-rj-dim lg:text-[0.875rem]">{featureStatusMeta[status].explanation}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </ParallaxLayer>
          </div>
        </div>
      </ParallaxScene>
    </section>
  );
}
