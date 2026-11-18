import { anatomy, resultMarks } from "@/content/safety";
import { CalloutNumber } from "../telegram/callout";
import { SafetyReport } from "../telegram/safety-report";
import { ParallaxLayer, ParallaxScene } from "../ui/parallax";
import { Reveal } from "../ui/reveal";
import { ResultMarkGlyph } from "../ui/result-mark";
import { Section, SectionHeading } from "../ui/section";

const markLabels = {
  pass: resultMarks.pass.label,
  unknown: resultMarks.unknown.label,
  fail: resultMarks.fail.label,
  info: resultMarks.info.label,
};

/** The full report as real text, with a numbered note for each block. */
export function ReportAnatomy() {
  const { report } = anatomy;

  return (
    <Section id="report" labelledBy="report-title">
      <ParallaxScene track="through-view" className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <SectionHeading id="report-title" eyebrow={anatomy.eyebrow} title={anatomy.title} lede={anatomy.lede} />
          </Reveal>

          <ol className="mt-10 divide-y divide-rj-line border-y border-rj-line">
            {report.sections.map((section, index) => (
              <li key={section.title}>
                <Reveal delay={index * 0.04} distance={16} className="flex gap-4 py-5">
                  <CalloutNumber n={index + 1} className="mt-0.5" />
                  <div>
                    <h3 className="font-sans text-[1.0625rem] font-semibold tracking-normal text-rj-text">
                      {section.note.title}
                    </h3>
                    <p className="mt-1.5 max-w-[32rem] text-base leading-relaxed text-rj-dim">{section.note.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>

          <dl className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {(["pass", "unknown", "fail", "info"] as const).map((mark) => (
              <div key={mark}>
                <dt>
                  <ResultMarkGlyph mark={mark} label={resultMarks[mark].label} showLabel />
                </dt>
                <dd className="mt-1 text-base leading-relaxed text-rj-dim lg:text-[0.875rem]">{resultMarks[mark].meaning}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <figure className="lg:sticky lg:top-[calc(var(--nav-height)+4.5rem)] short:lg:static">
            <ParallaxLayer y={[14, -14]}>
              <div className="fine-grid rounded-[22px] border border-rj-line bg-[#0C0E13] p-3 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.95)] sm:p-5">
                <SafetyReport
                  title={report.title}
                  address={report.address}
                  time={report.time}
                  blocks={report.sections}
                  markLabels={markLabels}
                  numbered
                />
              </div>
            </ParallaxLayer>
            <figcaption className="mt-4 text-[0.8125rem] leading-relaxed text-rj-caption">
              <span className="font-mono text-[0.6875rem] tracking-[0.08em]">{anatomy.caption}</span>
              <br />
              {anatomy.marksNote}
            </figcaption>
          </figure>
        </div>
      </ParallaxScene>
    </Section>
  );
}
