import { cn } from "@/lib/cn";
import { RESULT_MARK, ResultMarkGlyph, type ResultMark } from "../ui/result-mark";
import { CalloutNumber } from "./callout";
import { Emoji, TgBubble } from "./chat";

export type ReportLine = { text: string; mark: ResultMark };
export type ReportBlock = { emoji?: string; title?: string; lines: ReportLine[] };

type SafetyReportProps = {
  /** Message heading and token address, for a full report. Leave out for an excerpt. */
  title?: string;
  address?: string;
  time?: string;
  blocks: ReportBlock[];
  /** Words for the marks, from `resultMarks` in content/safety.ts. */
  markLabels: Record<ResultMark, string>;
  /** Number each block in the gutter, to match a list of notes beside the report. */
  numbered?: boolean;
  /** Edges the frame in a result's colour, for an excerpt that illustrates that result. */
  tone?: ResultMark;
  className?: string;
};

/**
 * A Safety Check report as real text, recreated from the kit's report mockups.
 * The mark at the end of each line is added by the site to show how the line
 * reads; the wording of the lines is the bot's.
 */
export function SafetyReport({ title, address, time, blocks, markLabels, numbered = false, tone, className }: SafetyReportProps) {
  return (
    <div
      className={cn(
        "rounded-[18px] border bg-tg-bg p-2.5",
        tone ? cn("border-l-2", RESULT_MARK[tone].edge) : "border-rj-line",
        numbered && "pl-10",
        className,
      )}
    >
      <TgBubble time={time} className="flow-root">
        {title && (
          <p>
            <Emoji>📋</Emoji> <b>{title}</b>
          </p>
        )}
        {address && <p className="font-mono text-[0.75rem] break-all text-tg-link">{address}</p>}
        {blocks.map((block, index) => (
          <div key={index} className={cn("relative", (index > 0 || title) && "mt-3.5")}>
            {numbered && <CalloutNumber n={index + 1} className="absolute top-0 -left-[2.625rem]" />}
            {block.title && (
              <p>
                {block.emoji && (
                  <>
                    <Emoji>{block.emoji}</Emoji>{" "}
                  </>
                )}
                <b>{block.title}</b>
              </p>
            )}
            <ul>
              {block.lines.map((line) => (
                <li key={line.text} className="flex items-start justify-between gap-3">
                  <span className="min-w-0">{line.text}</span>
                  <ResultMarkGlyph mark={line.mark} label={markLabels[line.mark]} className="mt-[0.2rem]" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </TgBubble>
    </div>
  );
}
