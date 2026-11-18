import { ArrowDown } from "lucide-react";
import { featureStatusMeta, getFeature, site } from "@/config/site";
import { demoPost, hero, previewTag } from "@/content/meme-radar";
import { assets } from "@/lib/assets";
import { ButtonLink } from "../ui/button";
import { ParallaxLayer, ParallaxScene } from "../ui/parallax";
import { PhoneMockup } from "../ui/phone-mockup";
import { Picture } from "../ui/picture";
import { Pill, StatusBadge } from "../ui/status-badge";
import { TelegramCta } from "../ui/telegram-cta";

/** Opening scene: the kit radar art far back, one sweep turned by scroll, and the preview lock screen in front. */
export function MemeRadarHero() {
  const radar = getFeature("meme-radar");

  return (
    <section aria-labelledby="page-title" className="relative isolate -mt-(--nav-height) overflow-clip bg-[#090A0D]">
      <ParallaxScene track="from-top" className="pt-(--nav-height)">
        <ParallaxLayer
          y={[0, 30]}
          scale={[1, 1.08]}
          className="pointer-events-none absolute top-[58%] left-1/2 -z-10 aspect-video w-[210%] max-w-[60rem] -translate-x-1/2 -translate-y-1/2 lg:top-1/2 lg:left-[70%] lg:w-[min(92vw,1380px)] lg:max-w-none"
          aria-hidden
        >
          <Picture
            asset={assets.memeRadarConcept}
            alt=""
            sizes="(min-width: 1024px) 92vw, 210vw"
            priority
            imgClassName="size-full object-cover opacity-55 [mask-image:radial-gradient(closest-side,#000_40%,transparent)] lg:opacity-75"
          />
        </ParallaxLayer>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[58%] left-1/2 -z-10 size-[min(120vw,34rem)] -translate-x-1/2 -translate-y-1/2 lg:top-1/2 lg:left-[70%] lg:size-[min(78vh,44rem)]"
        >
          <div className="absolute inset-0 rounded-full border border-white/[0.07]" />
          <div className="absolute inset-[17%] rounded-full border border-white/[0.06]" />
          <div className="absolute inset-[34%] rounded-full border border-white/[0.05]" />
          <ParallaxLayer
            rotate={[20, 200]}
            className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_292deg,rgb(153_69_255/0.18)_336deg,rgb(20_241_149/0.34)_359deg,transparent_360deg)] [mask-image:radial-gradient(closest-side,transparent_12%,#000_13%,#000_99%,transparent)]"
            aria-hidden
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#090A0D_0%,rgb(9_10_13/0.72)_34%,rgb(9_10_13/0.2)_62%,#090A0D_100%)] lg:bg-[linear-gradient(90deg,#090A0D_0%,rgb(9_10_13/0.9)_34%,rgb(9_10_13/0.1)_66%,rgb(9_10_13/0.5)_100%)]"
        />

        <div className="container-rj grid items-center gap-y-12 pt-12 pb-16 lg:min-h-[46rem] lg:grid-cols-12 lg:gap-x-6 lg:pt-10 lg:pb-24">
          <div className="lg:col-span-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={radar.status} label={featureStatusMeta[radar.status].label} />
              <Pill>{demoPost.label}</Pill>
            </div>
            <p className="text-eyebrow mt-6 text-rj-dim">{hero.eyebrow}</p>
            <h1 id="page-title" className="text-display-1 mt-4 max-w-[10ch]">
              {hero.title}
            </h1>
            <p className="text-lede mt-6 max-w-[35rem] lg:mt-7">{hero.lede}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-10">
              <TelegramCta label={site.cta.primary.label} location="meme-radar-hero" size="lg" />
              <ButtonLink href={hero.secondary.href} size="lg">
                {hero.secondary.label}
                <ArrowDown aria-hidden="true" className="size-4 text-rj-dim" />
              </ButtonLink>
            </div>
            <p className="mt-6 max-w-[31rem] text-base leading-relaxed text-rj-dim lg:text-[0.9375rem]">{hero.note}</p>
          </div>

          <figure className="relative mx-auto w-full max-w-[22rem] lg:col-span-5 lg:col-start-8 lg:max-w-[27rem]">
            <ParallaxLayer y={[0, -46]} className="mx-auto w-[60%] -rotate-[4deg]">
              <PhoneMockup
                asset={assets.phoneLockscreenAlert}
                alt={hero.phoneAlt}
                sizes="(min-width: 1024px) 420px, 60vw"
                priority
                treatment="preview"
                grounded
              />
            </ParallaxLayer>
            <ParallaxLayer y={[0, -84]} className="absolute right-0 bottom-[12%] max-w-[13.5rem] lg:-right-[3%]">
              <div className="glass rounded-2xl px-4 py-3.5 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)]">
                <p className="text-[0.875rem] font-semibold text-rj-text">{hero.chip.title}</p>
                <p className="mt-1 text-[0.8125rem] leading-snug text-rj-dim">{hero.chip.body}</p>
              </div>
            </ParallaxLayer>
            <figcaption className="mt-10 text-center font-mono text-[0.6875rem] tracking-[0.16em] text-rj-caption uppercase">
              {previewTag}
            </figcaption>
          </figure>
        </div>
      </ParallaxScene>
    </section>
  );
}
