import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ParallaxLayer, ParallaxScene } from "@/components/ui/parallax";
import { Reveal } from "@/components/ui/reveal";
import { TelegramCta } from "@/components/ui/telegram-cta";
import { site } from "@/config/site";

const copy = {
  code: "404",
  eyebrow: "Error 404 · Page not found",
  title: "This page got rugged.",
  body: "The link is broken or the page has moved. Your funds are not involved: this site never connects to a wallet.",
  home: "Head back home",
  elsewhere: "Or go to",
};

export const metadata: Metadata = {
  title: { absolute: `Page not found — ${site.seo.titleSuffix}` },
  description: "This page does not exist. Head back to the Ripjaw home page.",
  robots: { index: false, follow: true },
};

const destinations = site.routes.filter((route) => route.nav || route.path === "/faq/" || route.path === "/docs/");

export default function NotFound() {
  if (destinations.length === 0) throw new Error("not-found: no routes to link to");

  return (
    <div className="relative overflow-clip">
      <ParallaxScene
        track="from-top"
        className="flex min-h-[calc(100svh-var(--nav-height))] items-center py-20 lg:py-28"
      >
        <ParallaxLayer y={[0, 36]} className="fine-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_38%,rgb(153_69_255/0.16),transparent_70%),linear-gradient(to_bottom,transparent_55%,var(--color-rj-bg))]"
        />
        <ParallaxLayer
          y={[0, -70]}
          className="pointer-events-none absolute inset-x-0 top-[8%] flex justify-center select-none lg:top-[4%]"
          aria-hidden
        >
          <span className="font-display text-[clamp(11rem,38vw,34rem)] leading-none font-bold tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.12)]">
            {copy.code}
          </span>
        </ParallaxLayer>

        <div className="container-rj relative text-center">
          <Reveal>
            <p className="text-eyebrow text-rj-dim">{copy.eyebrow}</p>
            <h1 className="text-display-1 mx-auto mt-6 max-w-[14ch]">{copy.title}</h1>
            <p className="text-lede mx-auto mt-6 max-w-[34rem]">{copy.body}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <ButtonLink href="/" variant="primary" size="lg">
                {copy.home}
                <ArrowRight aria-hidden="true" className="size-[1.05em]" />
              </ButtonLink>
              <TelegramCta label={site.cta.primary.label} location="not-found" variant="secondary" size="lg" />
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <nav aria-label="Other pages" className="mx-auto mt-14 max-w-[44rem] border-t border-rj-line pt-8">
              <p className="text-eyebrow text-rj-caption">{copy.elsewhere}</p>
              <ul className="mt-4 flex flex-wrap justify-center gap-2.5">
                {destinations.map((route) => (
                  <li key={route.path}>
                    <Link
                      href={route.path}
                      className="inline-flex min-h-11 items-center rounded-full border border-rj-line bg-white/[0.02] px-4 text-[0.9375rem] text-rj-dim transition-colors duration-200 hover:border-white/25 hover:text-rj-text"
                    >
                      {route.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>
        </div>
      </ParallaxScene>
    </div>
  );
}
