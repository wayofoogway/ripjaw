import { ArrowDown } from "lucide-react";
import { site } from "@/config/site";
import { hero } from "@/content/home";
import { assets } from "@/lib/assets";
import { Emoji } from "../telegram/chat";
import { ButtonLink } from "../ui/button";
import { ParallaxLayer, ParallaxScene } from "../ui/parallax";
import { PhoneMockup } from "../ui/phone-mockup";
import { Picture } from "../ui/picture";
import { Pill } from "../ui/status-badge";
import { TelegramCta } from "../ui/telegram-cta";
import { HeroPhones } from "./hero-phones";

/*
 * Five planes, back to front:
 *   background  kit aurora, pans slowly
 *   atmosphere  glows, one ring, fine grid
 *   product     two kit phones (home menu, Safety Check)
 *   detail      two small pieces of real bot UI
 *   content     headline and calls to action, which do not move
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate -mt-(--nav-height) overflow-clip">
      <ParallaxScene
        track="from-top"
        className="flex min-h-[max(45rem,calc(100svh-2.5rem))] flex-col pt-(--nav-height) lg:max-h-[62rem]"
      >
        {/* Background plane */}
        <ParallaxLayer y={[0, 36]} scale={[1.02, 1.08]} className="absolute inset-0 -z-30 origin-top" aria-hidden>
          <Picture
            asset={assets.heroBgDesktop}
            alt=""
            sizes="100vw"
            priority
            className="hidden lg:block"
            imgClassName="absolute inset-0 size-full object-cover object-[78%_50%]"
          />
          <Picture
            asset={assets.heroBgMobile}
            alt=""
            sizes="100vw"
            priority
            className="lg:hidden"
            imgClassName="absolute inset-0 size-full object-cover object-bottom opacity-70"
          />
        </ParallaxLayer>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(11_12_16/0.9)_0%,rgb(11_12_16/0.72)_45%,rgb(11_12_16/0.2)_78%,var(--color-rj-bg)_100%)] lg:bg-[linear-gradient(90deg,var(--color-rj-bg)_0%,rgb(11_12_16/0.96)_30%,rgb(11_12_16/0.55)_56%,rgb(11_12_16/0.18)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-20 hidden h-56 bg-linear-to-b from-transparent to-rj-bg lg:block"
        />

        {/* Atmosphere plane */}
        <ParallaxLayer y={[0, -56]} className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute top-[52%] left-1/2 hidden w-[1200px] -translate-x-1/2 -translate-y-1/2 lg:block">
            <div className="absolute top-1/2 right-[-8%] size-[620px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(153_69_255/0.26),transparent)]" />
            <div className="absolute top-1/2 right-[-14%] size-[420px] translate-y-[6%] rounded-full bg-[radial-gradient(closest-side,rgb(20_241_149/0.12),transparent)]" />
            <div className="absolute top-1/2 right-[-4%] size-[640px] -translate-y-1/2 rounded-full border border-white/[0.07]" />
            <div className="fine-grid absolute top-1/2 right-[-12%] size-[760px] -translate-y-1/2 [mask-image:radial-gradient(closest-side,#000,transparent)]" />
          </div>
          <div className="absolute inset-x-0 bottom-[8%] mx-auto size-[420px] rounded-full bg-[radial-gradient(closest-side,rgb(153_69_255/0.22),transparent)] lg:hidden" />
        </ParallaxLayer>

        <div className="container-rj grid flex-1 items-center gap-y-14 pt-10 pb-16 lg:grid-cols-12 lg:gap-x-6 lg:pt-6 lg:pb-24">
          {/* Content plane */}
          <div className="lg:col-span-6">
            <Pill tone="beta">{site.beta.eyebrow}</Pill>
            <h1 id="hero-title" className="text-display-1 mt-6 lg:mt-7">
              {hero.headline.lead}
              <br />
              <span className="text-gradient">{hero.headline.accent}</span>
            </h1>
            <p className="text-lede mt-6 max-w-[33rem] lg:mt-7">{hero.subhead}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-10">
              <TelegramCta label={site.cta.primary.label} location="hero" size="lg" />
              <ButtonLink href={site.cta.secondary.href} size="lg" variant="secondary">
                {site.cta.secondary.label}
                <ArrowDown aria-hidden="true" className="size-4 text-rj-dim" />
              </ButtonLink>
            </div>

            <p className="mt-6 font-mono text-[0.8125rem] leading-relaxed text-rj-dim">{site.cta.microcopy}</p>
            <p className="mt-3 max-w-[30rem] text-[0.8125rem] leading-relaxed text-rj-caption">{site.beta.notice}</p>
          </div>

          {/* Product and detail planes */}
          <div className="lg:col-span-6">
            <HeroPhones>
              <figure className="relative mx-auto aspect-[56/66] w-full max-w-[21.5rem] sm:max-w-[26rem] lg:mr-0 lg:max-w-[35rem]">
                <ParallaxLayer y={[0, -44]} className="absolute top-[9%] left-[1%] w-[47%]">
                  <div className="-rotate-[7deg] brightness-[0.82]">
                    <PhoneMockup
                      asset={assets.phoneSafetyCheck}
                      alt="Ripjaw Safety Check in Telegram: a report for the token BONK marked incomplete, 60 out of 100, with each check listed as passed or unread."
                      sizes="(min-width: 1024px) 420px, 60vw"
                      priority
                      grounded
                    />
                  </div>
                </ParallaxLayer>

                <ParallaxLayer y={[0, -92]} scale={[1, 1.035]} className="absolute top-0 right-[1%] w-[53%]">
                  <div className="rotate-[4deg]">
                    <PhoneMockup
                      asset={assets.phoneHomeMenu}
                      alt="Ripjaw main menu in Telegram, with buttons for Buy/Sell, Limit Orders, Wallet, Copy Trade, Snipe, Safety Check, Settings and more."
                      sizes="(min-width: 1024px) 480px, 68vw"
                      priority
                      grounded
                    />
                  </div>
                </ParallaxLayer>

                <ParallaxLayer y={[0, -136]} className="absolute bottom-[3%] left-[-9%] w-[44%] min-w-[10.5rem]" aria-hidden>
                  <div className="glass rounded-2xl p-3 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)]">
                    <p className="mb-2 font-mono text-[0.625rem] tracking-[0.12em] text-rj-caption uppercase">Safety Check</p>
                    <ul className="space-y-1 text-[0.8125rem] leading-snug text-rj-text">
                      <li><Emoji>✅</Emoji> Mint revoked</li>
                      <li><Emoji>✅</Emoji> Freeze revoked</li>
                      <li><Emoji>❔</Emoji> Metadata unread</li>
                    </ul>
                  </div>
                </ParallaxLayer>

                <ParallaxLayer y={[0, -70]} className="absolute top-[1%] left-[14%] hidden sm:block" aria-hidden>
                  <div className="rounded-[14px] rounded-br-[4px] bg-tg-bubble-out px-3 py-1.5 font-mono text-[0.8125rem] text-white shadow-[0_18px_40px_-16px_rgb(0_0_0/0.9)]">
                    /start <span className="ml-1 text-[0.625rem] text-[#7DA8D3]">9:41 ✓✓</span>
                  </div>
                </ParallaxLayer>

                <figcaption className="absolute inset-x-0 -bottom-9 text-center font-mono lg:text-right text-[0.6875rem] tracking-[0.08em] text-rj-caption lg:-bottom-8">
                  {hero.mockupCaption}
                </figcaption>
              </figure>
            </HeroPhones>
          </div>
        </div>

        <a
          href={site.cta.secondary.href}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 rounded-lg px-3 py-1 font-mono text-[0.625rem] tracking-[0.3em] text-rj-caption uppercase transition-colors duration-200 hover:text-rj-text lg:flex"
        >
          {hero.scrollCue}
          <span aria-hidden="true" className="relative h-10 w-px overflow-hidden bg-white/10">
            <span className="absolute inset-x-0 top-0 h-4 animate-[scroll-cue_2.6s_var(--ease-out-soft)_infinite] bg-linear-to-b from-transparent to-rj-green" />
          </span>
        </a>
      </ParallaxScene>
    </section>
  );
}
