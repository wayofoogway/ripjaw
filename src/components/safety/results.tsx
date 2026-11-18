import { safety as homeSafety } from "@/content/home";
import { resultMarks, results } from "@/content/safety";
import { cn } from "@/lib/cn";
import { SafetyReport } from "../telegram/safety-report";
import { Reveal } from "../ui/reveal";
import { RESULT_MARK } from "../ui/result-mark";
import { Section, SectionHeading } from "../ui/section";

const markLabels = {
  pass: resultMarks.pass.label,
  unknown: resultMarks.unknown.label,
  fail: resultMarks.fail.label,
  info: resultMarks.info.label,
};

/** The three results, each beside the report lines that decide it and a plain statement of what it does not mean. */
export function Results() {
  return (
    <Section id="results" labelledBy="results-title">
      <Reveal>
        <SectionHeading id="results-title" eyebrow={results.eyebrow} title={results.title} lede={results.lede} />
      </Reveal>

      <ol className="mt-10 lg:mt-16">
        {homeSafety.verdicts.map((verdict, index) => {
          const tone = RESULT_MARK[verdict.tone];
          const Glyph = tone.icon;
          const detail = results.detail[verdict.tone];
          return (
            <li key={verdict.tone} className="border-t border-rj-line">
              <Reveal className="grid gap-x-8 gap-y-8 py-10 lg:grid-cols-12 lg:py-14">
                <div className="lg:col-span-6">
                  <p aria-hidden="true" className="font-mono text-[0.8125rem] text-rj-caption">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className={cn("text-display-3 mt-3 flex items-center gap-3", tone.text)}>
                    <Glyph aria-hidden="true" className="size-6 shrink-0" strokeWidth={2} />
                    {verdict.label}
                  </h3>
                  <p className="text-lede mt-4 max-w-[32rem]">{verdict.meaning}</p>
                  <p className="text-eyebrow mt-7 text-rj-caption">{results.notMeanLabel}</p>
                  <p className="mt-2 max-w-[32rem] text-base leading-relaxed text-rj-text">{detail.notMean}</p>
                </div>
                <figure className="lg:col-span-5 lg:col-start-8">
                  <figcaption className="text-eyebrow mb-3 text-rj-caption">{results.decidedBy}</figcaption>
                  <SafetyReport blocks={[{ lines: detail.lines }]} markLabels={markLabels} tone={verdict.tone} />
                </figure>
              </Reveal>
            </li>
          );
        })}
      </ol>
      <p className="border-t border-rj-line pt-6 font-mono text-[0.6875rem] tracking-[0.08em] text-rj-caption">
        {results.caption}
      </p>
    </Section>
  );
}
