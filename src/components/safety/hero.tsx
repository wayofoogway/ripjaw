import { ArrowDown } from "lucide-react";
import { featureStatusMeta, getFeature, site } from "@/config/site";
import { hero, resultMarks } from "@/content/safety";
import { assets } from "@/lib/assets";
import { ButtonLink } from "../ui/button";
import { ParallaxLayer, ParallaxScene } from "../ui/parallax";
import { PhoneMockup } from "../ui/phone-mockup";
import { Picture } from "../ui/picture";
import { ResultMarkGlyph } from "../ui/result-mark";
import { StatusBadge } from "../ui/status-badge";
import { TelegramCta } from "../ui/telegram-cta";

/** Calm opening: the kit shield drifts slowly behind one upright Safety Check phone. Text does not move. */
export function SafetyHero() {
  const feature = getFeature("safety-check");

  return (
    <section aria-labelledby="page-title" className="relative isolate -mt-(--nav-height) overflow-clip">
      <ParallaxScene track="from-top" className="pt-(--nav-height)">
        <ParallaxLayer
          y={[0, 26]}
          className="pointer-events-none absolute top-[38%] left-1/2 -z-10 w-[150%] max-w-[46rem] -translate-x-1/2 lg:top-1/2 lg:left-[74%] lg:w-[58rem] lg:max-w-none lg:-translate-y-1/2"
          aria-hidden
        >
          <Picture
            asset={assets.safetyShieldConcept}
            alt=""
            sizes="(min-width: 1024px) 928px, 150vw"
            priority
            imgClassName="h-auto w-full opacity-45 [mask-image:radial-gradient(closest-side,#000_38%,transparent)] lg:opacity-70"
          />
        </ParallaxLayer>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--color-rj-bg)_0%,rgb(11_12_16/0.5)_30%,rgb(11_12_16/0.35)_70%,var(--color-rj-bg)_100%)] lg:bg-[linear-gradient(90deg,var(--color-rj-bg)_0%,rgb(11_12_16/0.92)_36%,rgb(11_12_16/0.2)_70%,rgb(11_12_16/0.55)_100%)]"
        />

        <div className="container-rj grid items-center gap-y-14 pt-12 pb-20 lg:min-h-[44rem] lg:grid-cols-12 lg:gap-x-6 lg:pt-10 lg:pb-24">
          <div className="lg:col-span-6">
            <StatusBadge status={feature.status} label={featureStatusMeta[feature.status].label} />
            <p className="text-eyebrow mt-6 text-rj-dim">{hero.eyebrow}</p>
            <h1 id="page-title" className="text-display-1 mt-4 max-w-[11ch]">
              {hero.title}
            </h1>
            <p className="text-lede mt-6 max-w-[34rem] lg:mt-7">{hero.lede}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-10">
              <TelegramCta label={site.cta.primary.label} location="safety-hero" size="lg" />
              <ButtonLink href={hero.secondary.href} size="lg">
                {hero.secondary.label}
                <ArrowDown aria-hidden="true" className="size-4 text-rj-dim" />
              </ButtonLink>
            </div>
            <p className="mt-6 max-w-[30rem] text-base leading-relaxed text-rj-caption lg:text-[0.8125rem]">{hero.note}</p>
          </div>

          <figure className="relative mx-auto w-full max-w-[22rem] lg:col-span-5 lg:col-start-8 lg:max-w-[26rem]">
            <ParallaxLayer y={[0, -40]} className="mx-auto w-[62%]">
              <PhoneMockup
                asset={assets.phoneSafetyCheck}
                alt={hero.phoneAlt}
                sizes="(min-width: 1024px) 420px, 60vw"
                priority
                grounded
              />
            </ParallaxLayer>
            <ParallaxLayer y={[0, -72]} className="absolute bottom-[9%] left-0 lg:-left-[4%]">
              <div className="glass rounded-2xl px-4 py-3.5 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)]">
                <p className="font-mono text-[0.625rem] tracking-[0.12em] text-rj-caption uppercase">{hero.legendLabel}</p>
                <ul className="mt-2.5 space-y-1.5">
                  {(["pass", "unknown", "fail"] as const).map((mark) => (
                    <li key={mark}>
                      <ResultMarkGlyph mark={mark} label={resultMarks[mark].label} showLabel />
                    </li>
                  ))}
                </ul>
              </div>
            </ParallaxLayer>
            <figcaption className="mt-10 text-center font-mono text-[0.6875rem] tracking-[0.08em] text-rj-caption">
              {hero.caption}
            </figcaption>
          </figure>
        </div>
      </ParallaxScene>
    </section>
  );
}
