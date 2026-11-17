import { ArrowRight, CircleCheck, CircleHelp, OctagonX, type LucideIcon } from "lucide-react";
import { featureStatusMeta, getFeature } from "@/config/site";
import { safety } from "@/content/home";
import { assets } from "@/lib/assets";
import { cn } from "@/lib/cn";
import { TgBubble } from "../telegram/chat";
import { ButtonLink } from "../ui/button";
import { ParallaxLayer, ParallaxScene } from "../ui/parallax";
import { PhoneMockup } from "../ui/phone-mockup";
import { Picture } from "../ui/picture";
import { Reveal } from "../ui/reveal";
import { Section, SectionHeading } from "../ui/section";
import { StatusBadge } from "../ui/status-badge";

const VERDICT: Record<"pass" | "unknown" | "fail", { icon: LucideIcon; text: string; edge: string }> = {
  pass: { icon: CircleCheck, text: "text-rj-pass", edge: "border-t-rj-pass/70" },
  unknown: { icon: CircleHelp, text: "text-rj-warn", edge: "border-t-rj-warn/70" },
  fail: { icon: OctagonX, text: "text-rj-fail", edge: "border-t-rj-fail/70" },
};

/** Methodical and calm: what is checked, what a result means, and the limits. Light parallax only. */
export function Safety() {
  const feature = getFeature("safety-check");

  return (
    <Section id="safety" labelledBy="safety-title" className="overflow-clip">
      <ParallaxScene track="through-view" className="grid items-center gap-x-8 gap-y-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <StatusBadge status={feature.status} label={featureStatusMeta[feature.status].label} className="mb-6" />
            <SectionHeading id="safety-title" eyebrow={safety.eyebrow} title={safety.title} lede={safety.lede} />
          </Reveal>

          <Reveal className="mt-10">
            <dl className="divide-y divide-rj-line border-y border-rj-line">
              {safety.checks.map((check) => (
                <div key={check.name} className="grid gap-x-6 gap-y-1 py-3.5 sm:grid-cols-[11rem_1fr]">
                  <dt className="text-[0.9375rem] font-medium text-rj-text">{check.name}</dt>
                  <dd className="text-[0.9375rem] leading-relaxed text-rj-dim">{check.detail}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <figure className="relative mx-auto w-full max-w-[30rem] lg:col-span-6 lg:max-w-none">
          <ParallaxLayer y={[16, -16]} className="relative" aria-hidden>
            <Picture
              asset={assets.safetyShieldConcept}
              alt=""
              sizes="(min-width: 1024px) 600px, 100vw"
              imgClassName="block h-auto w-full opacity-60 [mask-image:radial-gradient(closest-side,#000_45%,transparent)] lg:scale-110"
            />
          </ParallaxLayer>
          <ParallaxLayer y={[30, -30]} className="absolute top-1/2 left-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2 lg:w-[44%]">
            <PhoneMockup
              asset={assets.phoneSafetyCheck}
              alt="Ripjaw Safety Check in Telegram for the token BONK: incomplete, 60 out of 100, 10 of 15 checks read. Mint and freeze revoked, LP locked, sell test passed; metadata, dev wallet and socials unread."
              sizes="(min-width: 1024px) 440px, 72vw"
              grounded
            />
          </ParallaxLayer>
        </figure>
      </ParallaxScene>

      <Reveal className="mt-16 lg:mt-24">
        <div className="grid gap-x-12 gap-y-4 border-t border-rj-line pt-10 lg:grid-cols-12">
          <h3 className="text-display-2 lg:col-span-6">{safety.principle}</h3>
          <p className="text-lede lg:col-span-6 lg:pt-2">{safety.principleBody}</p>
        </div>
      </Reveal>

      <ul className="mt-10 grid gap-4 md:grid-cols-3 lg:mt-14 lg:gap-6">
        {safety.verdicts.map((verdict, index) => {
          const tone = VERDICT[verdict.tone];
          const Glyph = tone.icon;
          return (
            <li key={verdict.tone}>
              <Reveal delay={index * 0.07} className="h-full">
                <article className={cn("panel flex h-full flex-col border-t-2 p-5 lg:p-6", tone.edge)}>
                  <h4 className={cn("flex items-center gap-2.5 font-sans text-[1.0625rem] font-semibold tracking-normal", tone.text)}>
                    <Glyph aria-hidden="true" className="size-5 shrink-0" strokeWidth={2} />
                    {verdict.label}
                  </h4>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-rj-dim">{verdict.meaning}</p>
                  <div className="mt-5 rounded-2xl bg-tg-bg p-2.5 md:mt-auto md:translate-y-0">
                    <TgBubble>{verdict.excerpt}</TgBubble>
                  </div>
                </article>
              </Reveal>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[0.6875rem] tracking-[0.08em] text-rj-caption">{safety.excerptNote}</p>
        <ButtonLink href={safety.cta.href}>
          {safety.cta.label}
          <ArrowRight aria-hidden="true" className="size-4 text-rj-dim" />
        </ButtonLink>
      </div>
    </Section>
  );
}
