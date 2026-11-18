import { EarlyAccessSection } from "@/components/early-access/early-access";
import { ResultMarkIcon } from "@/components/ui/result-mark";
import { Screenshot } from "@/components/ui/screenshot";
import { PageIntro, Rows, Section } from "@/components/ui/section";
import { checks, intro, limits, results } from "@/content/safety";
import { routeMetadata } from "@/lib/metadata";

export const metadata = routeMetadata("/safety/");

export default function SafetyPage() {
  return (
    <>
      <PageIntro
        title={intro.title}
        lede={intro.lede}
        aside={
          <Screenshot
            asset="chatSafetyCheck"
            alt={intro.screenshot.alt}
            caption={intro.screenshot.caption}
            priority
            className="lg:ml-auto"
          />
        }
      />

      <Section id="checks" title={checks.title}>
        <Rows rows={checks.items.map((item) => ({ key: item.name, term: item.name, detail: item.reads }))} />
      </Section>

      <Section id="results" title={results.title}>
        <Rows
          rows={results.items.map((item) => ({
            key: item.mark,
            term: (
              <span className="flex items-center gap-2.5">
                <ResultMarkIcon mark={item.mark} />
                {item.label}
              </span>
            ),
            detail: item.meaning,
          }))}
        />
      </Section>

      <Section id="limits" title={limits.title}>
        <Rows rows={limits.items.map((item) => ({ key: item.name, term: item.name, detail: item.detail }))} />
        <p className="mt-6 text-lg text-rj-text">{limits.rule}</p>
        <p className="mt-2 text-rj-dim">{limits.manualBuys}</p>
      </Section>

      <EarlyAccessSection />
    </>
  );
}
