import { ArrowDown, ArrowRight, AtSign, Image as ImageIcon, RadioTower, Type } from "lucide-react";
import type { ReactNode } from "react";
import { demoPost, demoTokens, previewTag, resultGroups, workflow } from "@/content/meme-radar";
import { resultMarks } from "@/content/safety";
import { cn } from "@/lib/cn";
import { CalloutNumber } from "../telegram/callout";
import { Emoji } from "../telegram/chat";
import { RadarAlert } from "../telegram/radar-alert";
import { ButtonLink } from "../ui/button";
import { ParallaxLayer, ParallaxScene } from "../ui/parallax";
import { Reveal } from "../ui/reveal";
import { ResultMarkGlyph, type ResultMark } from "../ui/result-mark";
import { Section, SectionHeading } from "../ui/section";
import { StepRail } from "./step-rail";

type DemoToken = (typeof demoTokens)[number];

const TOKEN_MARK: Record<DemoToken["result"], ResultMark> = { pass: "pass", flag: "fail", unknown: "unknown" };

/** The four acts as a numbered editorial sequence, each with its own diagram. Nothing is pinned here. */
export function Workflow() {
  const { post, match, check, alert } = workflow;

  return (
    <Section id="workflow" labelledBy="workflow-title" className="border-y border-rj-line bg-[#090A0D]">
      <Reveal>
        <SectionHeading id="workflow-title" eyebrow={workflow.eyebrow} title={workflow.title} lede={workflow.lede} />
      </Reveal>

      <ol className="mt-14 lg:mt-24">
        <Step n={1} step={post.step} title={post.title} body={post.body} visual={<PostDiagram />}>
          <DetailList label={workflow.detailLabels.reads} items={post.reads} />
          <Caveat>{post.caveat}</Caveat>
        </Step>

        <Step n={2} step={match.step} title={match.title} body={match.body} visual={<MatchTimeline />}>
          <p className="text-eyebrow mt-8 text-rj-caption">{workflow.detailLabels.signals}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {match.signals.map((signal) => (
              <li
                key={signal}
                className="rounded-full border border-rj-line-strong bg-white/[0.03] px-3.5 py-1.5 text-[0.9375rem] text-rj-text"
              >
                {signal}
              </li>
            ))}
          </ul>
          <Caveat>{match.caveat}</Caveat>
        </Step>

        <Step n={3} step={check.step} title={check.title} body={check.body} visual={<CheckMatrix />}>
          <p className="text-eyebrow mt-8 text-rj-caption">{workflow.detailLabels.reasons}</p>
          <dl className="mt-3 divide-y divide-rj-line border-y border-rj-line">
            {check.reasons.map((reason) => (
              <div key={reason.term} className="grid gap-x-4 gap-y-1 py-3 sm:grid-cols-[10rem_1fr]">
                <dt className="font-mono text-[0.875rem] text-rj-text">{reason.term}</dt>
                <dd className="text-base leading-relaxed text-rj-dim">{reason.detail}</dd>
              </div>
            ))}
          </dl>
          <ButtonLink href={check.link.href} className="mt-7">
            {check.link.label}
            <ArrowRight aria-hidden="true" className="size-4 text-rj-dim" />
          </ButtonLink>
        </Step>

        <Step n={4} step={alert.step} title={alert.title} body={alert.body} visual={<AlertFigure />} last>
          <ol className="mt-8 divide-y divide-rj-line border-y border-rj-line">
            {alert.notes.map((note, index) => (
              <li key={note.title} className="flex gap-4 py-4">
                <CalloutNumber n={index + 1} className="mt-0.5" />
                <div>
                  <h4 className="font-sans text-[1.0625rem] font-semibold tracking-normal text-rj-text">{note.title}</h4>
                  <p className="mt-1 text-base leading-relaxed text-rj-dim">{note.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Step>
      </ol>
    </Section>
  );
}

type StepProps = {
  n: number;
  step: string;
  title: string;
  body: string;
  visual: ReactNode;
  last?: boolean;
  children: ReactNode;
};

function Step({ n, step, title, body, visual, last = false, children }: StepProps) {
  return (
    <li>
      <ParallaxScene
        track="through-view"
        className={cn("grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-12", last ? "pb-0" : "pb-20 lg:pb-32")}
      >
        {!last && <StepRail />}
        <div className="lg:col-span-6">
          <Reveal className="relative lg:pr-6 lg:pl-[4.5rem] xl:pr-16">
            <p className="flex items-center gap-4 lg:block">
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-rj-purple/60 bg-[#151022] font-mono text-[0.875rem] font-medium text-[#DCC8FF] lg:absolute lg:top-0 lg:left-0">
                <span className="sr-only">Step </span>
                {n}
              </span>
              <span className="text-eyebrow text-rj-caption lg:flex lg:h-10 lg:items-center">{step}</span>
            </p>
            <h3 className="text-display-2 mt-5 lg:mt-2 lg:text-[clamp(1.875rem,2.6vw,2.5rem)]">{title}</h3>
            <p className="text-lede mt-5 max-w-[34rem]">{body}</p>
            {children}
          </Reveal>
        </div>
        <figure className="min-w-0 lg:col-span-6">
          <figcaption className="mb-4 font-mono text-[0.625rem] tracking-[0.16em] text-rj-caption uppercase">
            {previewTag}
          </figcaption>
          {visual}
        </figure>
      </ParallaxScene>
    </li>
  );
}

function DetailList({ label, items }: { label: string; items: string[] }) {
  return (
    <>
      <p className="text-eyebrow mt-8 text-rj-caption">{label}</p>
      <ul className="mt-3 divide-y divide-rj-line border-y border-rj-line">
        {items.map((item) => (
          <li key={item} className="py-3 text-base leading-relaxed text-rj-text">
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}

function Caveat({ children }: { children: string }) {
  return (
    <p className="mt-6 max-w-[34rem] border-l-2 border-rj-warn/70 pl-4 text-base leading-relaxed text-rj-dim">{children}</p>
  );
}

/* ───────────────────────────── 1 · Post ───────────────────────────── */

const INPUT_ICONS = [Type, ImageIcon];

function PostDiagram() {
  const { post } = workflow;

  return (
    <div className="relative">
      <ParallaxLayer y={[16, -16]}>
        <div className="panel p-5 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.95)] sm:p-6 lg:mr-16">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-rj-line-strong bg-rj-surface-2 text-rj-dim">
              <AtSign aria-hidden="true" className="size-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-rj-text">{post.accountLabel}</p>
              <p className="truncate font-mono text-[0.8125rem] text-rj-caption">{demoPost.handle}</p>
            </div>
          </div>
          <blockquote className="mt-5 font-display text-[1.625rem] leading-tight font-semibold tracking-tight text-rj-text sm:text-[2rem]">
            “{demoPost.text}”
          </blockquote>
          <ul className="mt-6 flex flex-wrap gap-2">
            {post.inputs.map((input, index) => {
              const Glyph = INPUT_ICONS[index];
              if (!Glyph) throw new Error(`workflow: no icon for post input "${input}"`);
              return (
                <li
                  key={input}
                  className="flex items-center gap-2 rounded-lg border border-rj-line bg-rj-bg px-3 py-2 font-mono text-[0.75rem] tracking-[0.08em] text-rj-dim uppercase"
                >
                  <Glyph aria-hidden="true" className="size-4" strokeWidth={1.75} />
                  {input}
                </li>
              );
            })}
          </ul>
        </div>
      </ParallaxLayer>

      <ParallaxLayer y={[44, -44]} className="relative -mt-3 lg:ml-24">
        <span
          aria-hidden="true"
          className="absolute -top-7 left-8 grid size-9 place-items-center rounded-full border border-rj-purple/60 bg-[#151022] text-[#DCC8FF]"
        >
          <ArrowDown className="size-4" strokeWidth={2} />
        </span>
        <div className="glass edge-gradient rounded-[20px] p-5 pt-7 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.95)] sm:p-6 sm:pt-8">
          <p className="text-eyebrow text-rj-caption">{post.readAsLabel}</p>
          <p className="text-display-3 mt-3">
            <Emoji>🧠</Emoji> {post.idea}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="font-mono text-[0.75rem] tracking-[0.08em] text-rj-caption uppercase">{post.keywordsLabel}</p>
            <ul className="flex flex-wrap gap-2">
              {post.keywords.map((keyword) => (
                <li
                  key={keyword}
                  className="rounded-full border border-rj-purple/50 bg-rj-purple/10 px-3 py-1 font-mono text-[0.8125rem] text-[#DCC8FF]"
                >
                  {keyword}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ParallaxLayer>
    </div>
  );
}

/* ───────────────────────────── 2 · Match ──────────────────────────── */

/** Minutes after the post, read from a demo token's `age` ("3m after post"). */
function minutesAfterPost(token: DemoToken): number {
  const minutes = Number.parseInt(token.age, 10);
  if (!Number.isInteger(minutes) || !workflow.match.minutes.includes(minutes)) {
    throw new Error(`workflow: demo token ${token.ticker} has an age the timeline cannot place: "${token.age}"`);
  }
  return minutes;
}

function MatchTimeline() {
  const { match } = workflow;
  const placed = demoTokens.map((token) => ({ token, minute: minutesAfterPost(token) }));

  return (
    <ParallaxLayer y={[22, -22]}>
      <div className="panel p-5 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.95)] sm:p-6">
        <p className="text-[0.9375rem] font-medium text-rj-text">{match.chartLabel}</p>
        <ol className="relative mt-6">
          <span aria-hidden="true" className="absolute top-3 bottom-3 left-[3.9375rem] w-px bg-white/10" />
          <li className="relative grid grid-cols-[3rem_1.875rem_1fr] items-center pb-5">
            <span className="font-mono text-[0.8125rem] text-rj-caption">0m</span>
            <span aria-hidden="true" className="relative z-10 size-2.5 justify-self-center rounded-full bg-rj-purple ring-4 ring-rj-surface" />
            <span className="flex items-center gap-2 text-[0.9375rem] font-medium text-rj-text">
              <RadioTower aria-hidden="true" className="size-4 text-[#C39BFF]" strokeWidth={1.75} />
              {match.postLabel}
            </span>
          </li>
          {match.minutes.map((minute) => (
            <li key={minute} className="relative grid grid-cols-[3rem_1.875rem_1fr] items-start pb-3 last:pb-0">
              <span className="pt-2.5 font-mono text-[0.8125rem] text-rj-caption">+{minute}m</span>
              <span aria-hidden="true" className="relative z-10 mt-4 size-1.5 justify-self-center rounded-full bg-rj-muted ring-4 ring-rj-surface" />
              <ul className="space-y-1.5">
                {placed.filter((entry) => entry.minute === minute).map(({ token }, index) => (
                  <li
                    key={index}
                    className="flex items-baseline gap-3 rounded-xl border border-rj-line bg-rj-surface-2/70 px-3 py-2.5"
                  >
                    <span className="w-14 shrink-0 font-mono text-[0.875rem] font-medium text-rj-text">{token.ticker}</span>
                    <span className="min-w-0 text-[0.875rem] text-rj-dim">{token.match}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </ParallaxLayer>
  );
}

/* ───────────────────────────── 3 · Check ──────────────────────────── */

/** A row's marks must agree with the token's overall result, so the table cannot contradict the alert. */
function rowMarks(token: DemoToken, index: number): ResultMark[] {
  const marks: ResultMark[] | undefined = workflow.check.marks[index];
  if (!marks || marks.length !== workflow.check.columns.length) {
    throw new Error(`workflow: demo token ${token.ticker} (row ${index + 1}) needs one mark per check column`);
  }
  const expected: ResultMark = marks.includes("fail") ? "fail" : marks.includes("unknown") ? "unknown" : "pass";
  if (expected !== TOKEN_MARK[token.result]) {
    throw new Error(`workflow: marks for ${token.ticker} (row ${index + 1}) do not add up to its result "${token.result}"`);
  }
  return marks;
}

function CheckMatrix() {
  const { check } = workflow;
  if (check.marks.length !== demoTokens.length) {
    throw new Error("workflow: check.marks needs exactly one row per demo token");
  }

  return (
    <ParallaxLayer y={[22, -22]}>
      <div className="panel overflow-hidden shadow-[0_40px_90px_-40px_rgb(0_0_0/0.95)]">
        <table className="w-full border-collapse text-left">
          <caption className="px-4 pt-5 pb-4 text-left text-[0.9375rem] font-medium text-rj-text sm:px-6">
            {check.tableLabel}
          </caption>
          <thead>
            <tr className="border-y border-rj-line bg-rj-surface-2/60 font-mono text-[0.6875rem] tracking-[0.08em] text-rj-caption uppercase">
              <th scope="col" className="py-3 pr-2 pl-4 align-bottom font-medium sm:pl-6">
                {check.tokenColumn}
              </th>
              {check.columns.map((column) => (
                <th key={column} scope="col" className="w-10 px-1 py-3 text-center align-bottom font-medium sm:w-auto sm:px-2">
                  <span className="inline-block max-sm:rotate-180 max-sm:[writing-mode:vertical-rl]">{column}</span>
                </th>
              ))}
              <th scope="col" className="py-3 pr-4 pl-2 text-right align-bottom font-medium sm:pr-6">
                {check.resultColumn}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rj-line">
            {demoTokens.map((token, index) => {
              const result = TOKEN_MARK[token.result];
              return (
                <tr key={index}>
                  <th scope="row" className="py-3 pr-2 pl-4 align-middle font-normal sm:pl-6">
                    <span className="block font-mono text-[0.9375rem] font-medium text-rj-text">{token.ticker}</span>
                    <span className="block text-[0.8125rem] leading-snug text-rj-dim">{token.reason}</span>
                  </th>
                  {rowMarks(token, index).map((mark, column) => (
                    <td key={column} className="px-1 py-3 text-center align-middle sm:px-2">
                      <ResultMarkGlyph mark={mark} label={resultMarks[mark].label} className="justify-center" />
                    </td>
                  ))}
                  <td className="py-3 pr-4 pl-2 text-right align-middle sm:pr-6">
                    <ResultMarkGlyph
                      mark={result}
                      label={resultGroups[token.result]}
                      showLabel
                      className="justify-end [&>span]:max-sm:sr-only"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ParallaxLayer>
  );
}

/* ───────────────────────────── 4 · Alert ──────────────────────────── */

function AlertFigure() {
  const { alert } = workflow;
  const passed = demoTokens.filter((token) => token.result === "pass");
  if (passed.length !== alert.message.pickStats.length) {
    throw new Error("workflow: alert.message.pickStats needs one entry per demo token that passed");
  }

  return (
    <ParallaxLayer y={[22, -22]}>
      <div className="relative sm:rounded-[22px] sm:border sm:border-rj-line sm:bg-[#0C0E13] sm:p-5 sm:shadow-[0_40px_90px_-40px_rgb(0_0_0/0.95)]">
        <span aria-hidden="true" className="fine-grid absolute inset-0 hidden rounded-[22px] sm:block" />
        <RadarAlert
          className="relative mx-auto max-w-[25rem]"
          handle={demoPost.handle}
          post={demoPost.text}
          idea={workflow.post.idea}
          picks={passed.map((token, index) => ({ ticker: token.ticker, stats: alert.message.pickStats[index]! }))}
          flagged={demoTokens.filter((token) => token.result === "flag")}
          text={alert.message}
        />
      </div>
      <p className="mt-4 font-mono text-[0.6875rem] tracking-[0.08em] text-rj-caption">{alert.caption}</p>
    </ParallaxLayer>
  );
}
