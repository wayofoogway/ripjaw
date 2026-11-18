import Link from "next/link";
import { EarlyAccessIntro, EarlyAccessSection } from "@/components/early-access/early-access";
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

      <Fade className="container-rj pt-16 pb-16 lg:pt-28 lg:pb-24">
        <div className="max-w-[40rem]">
          <h1 className="text-display">
            {hero.headline.lead} <span className="text-gradient block w-fit">{hero.headline.accent}</span>
          </h1>
          <p className="text-lede mt-6">{hero.line}</p>
          <EarlyAccessIntro />
        </div>
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
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-[30rem]">
            {safety.lines.map((line) => (
              <p key={line} className="text-lg text-rj-dim not-first:mt-4">
                {line}
              </p>
            ))}
            <p className="mt-4">
              <Link href={safety.link.href} className="link">
                {safety.link.label}
              </Link>
            </p>
          </div>
          <Screenshot asset="chatSafetyCheck" alt={safety.screenshot.alt} caption={safety.screenshot.caption} className="md:w-[20rem]" />
        </div>
      </Section>

      <Section id="platform" title={platform.headline}>
        <p className="max-w-[30rem] text-lg text-rj-dim">{platform.line}</p>
      </Section>

      <EarlyAccessSection />
    </>
  );
}
