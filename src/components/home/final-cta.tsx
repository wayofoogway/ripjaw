import { site } from "@/config/site";
import { finalCta } from "@/content/home";
import { assets } from "@/lib/assets";
import { ParallaxLayer, ParallaxScene } from "../ui/parallax";
import { Picture } from "../ui/picture";
import { Reveal } from "../ui/reveal";
import { Pill } from "../ui/status-badge";
import { TelegramCta } from "../ui/telegram-cta";

/** Closing scene: one headline, one action, a slow far plane behind it. */
export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-title" className="relative overflow-clip border-t border-rj-line">
      <ParallaxScene track="through-view" className="flex min-h-[38rem] items-center py-24 lg:min-h-[46rem] lg:py-40">
        <ParallaxLayer y={[-48, 48]} scale={[1.08, 1.02]} className="pointer-events-none absolute inset-0" aria-hidden>
          <Picture
            asset={assets.speedOneTapConcept}
            alt=""
            sizes="100vw"
            className="absolute inset-0"
            imgClassName="size-full object-cover opacity-45"
          />
        </ParallaxLayer>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_50%,rgb(11_12_16/0.72),rgb(11_12_16/0.35)_60%,rgb(11_12_16/0.9)),linear-gradient(to_bottom,var(--color-rj-bg),transparent_22%,transparent_78%,var(--color-rj-bg))]"
        />
        <ParallaxLayer
          y={[40, -40]}
          className="pointer-events-none absolute top-1/2 left-1/2 size-[min(90vw,44rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]"
          aria-hidden
        />

        <div className="container-rj relative text-center">
          <Reveal>
            <Pill tone="beta">{site.cta.reminder}</Pill>
            <h2 id="final-cta-title" className="text-display-1 mx-auto mt-7 max-w-[16ch]">
              {finalCta.title}
            </h2>
            <p className="text-lede mx-auto mt-6 max-w-[32rem]">{finalCta.body}</p>
            <div className="mt-10">
              <TelegramCta label={site.cta.primary.label} location="final" size="lg" />
            </div>
            <p className="mx-auto mt-6 max-w-[30rem] text-[0.8125rem] leading-relaxed text-rj-dim">{site.cta.microcopy}</p>
          </Reveal>
        </div>
      </ParallaxScene>
    </section>
  );
}
