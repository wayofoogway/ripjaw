import Link from "next/link";
import { EarlyAccessColumn, EarlyAccessIntro } from "@/components/early-access/early-access";
import { Fade } from "@/components/ui/fade";
import { Screenshot } from "@/components/ui/screenshot";
import { Rows, Section } from "@/components/ui/section";
import { capabilities, hero, platform, safety } from "@/content/home";
import { routeMetadata, softwareApplicationJsonLd } from "@/lib/metadata";

export const metadata = routeMetadata("/");

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd()) }}
      />

      {/* The visual sits beside the headline from `md` up. On a phone it comes after the early access line. */}
      <Fade className="container-rj grid items-center gap-x-12 gap-y-12 pt-16 pb-16 md:grid-cols-12 lg:pt-12 lg:pb-20">
        <div className="max-w-[40rem] md:col-span-7">
          <h1 className="text-display">
            {hero.headline.lead} <span className="text-gradient block w-fit">{hero.headline.accent}</span>
          </h1>
          <p className="text-lede mt-6">{hero.line}</p>
          <EarlyAccessIntro />
        </div>
        <Screenshot
          asset="phoneSafetyCheck"
          variant="phone"
          alt={hero.visual.alt}
          caption={hero.visual.caption}
          priority
          className="mx-auto md:col-span-5 md:mr-0"
        />
      </Fade>

      <Section id="what-it-does" title={capabilities.title}>
        <Rows rows={capabilities.items.map((item) => ({ key: item.name, term: item.name, detail: item.line }))} />
        <p className="mt-6 text-rj-dim">{capabilities.radarLine}</p>
        <p className="mt-2">
          <Link href={capabilities.link.href} className="link">
            {capabilities.link.label}
          </Link>
        </p>
      </Section>

      <Section id="safety" title={safety.title}>
        <div className="grid gap-x-12 gap-y-4 sm:grid-cols-2">
          <p className="text-lg text-rj-dim">{safety.line}</p>
          <div>
            <p className="text-lg text-rj-dim">{safety.caveat}</p>
            <p className="mt-2">
              <Link href={safety.link.href} className="link">
                {safety.link.label}
              </Link>
            </p>
          </div>
        </div>
      </Section>

      {/* The two closing sections share a row from `md` up, so neither leaves half the page empty. */}
      <div className="border-t border-rj-line">
        <Fade className="container-rj grid md:grid-cols-2">
          <section id="platform" aria-labelledby="platform-title" className="py-14 md:pr-12 lg:py-20">
            <h2 id="platform-title" className="text-heading">
              {platform.headline}
            </h2>
            <p className="mt-6 max-w-[30rem] text-lg text-rj-dim">{platform.line}</p>
          </section>
          <EarlyAccessColumn className="border-t border-rj-line py-14 max-md:-mx-6 max-md:px-6 md:border-t-0 md:border-l md:pl-12 lg:py-20" />
        </Fade>
      </div>
    </>
  );
}
