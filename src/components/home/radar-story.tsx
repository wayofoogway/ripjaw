"use client";

import { ArrowRight, AtSign, CircleCheck, CircleHelp, Image as ImageIcon, OctagonX, RadioTower, ScanSearch, ShieldCheck } from "lucide-react";
import { useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import * as m from "motion/react-m";
import { useState, type ReactNode } from "react";
import type { FeatureStatus } from "@/config/site";
import { assets } from "@/lib/assets";
import { cn } from "@/lib/cn";
import { usePinned } from "@/lib/use-media-query";
import { Emoji, TgBubble, TgKeyboardRow } from "../telegram/chat";
import { ButtonLink } from "../ui/button";
import { ParallaxScene, useSceneProgress } from "../ui/parallax";
import { PhoneMockup } from "../ui/phone-mockup";
import { Picture } from "../ui/picture";
import { Reveal } from "../ui/reveal";
import { Pill, StatusBadge } from "../ui/status-badge";

type TokenResult = "pass" | "flag" | "unknown";

type DemoToken = { ticker: string; match: string; age: string; result: TokenResult; reason: string };

export type RadarStoryProps = {
  eyebrow: string;
  status: FeatureStatus;
  statusLabel: string;
  demoLabel: string;
  title: string;
  lede: string;
  acts: { step: string; title: string; body: string }[];
  handle: string;
  post: string;
  tokens: DemoToken[];
  resultGroups: Record<TokenResult, string>;
  report: { title: string; lines: string[]; note: string };
  confirmNote: string;
  previewTag: string;
  feedLabel: string;
  feed: string[];
  disclaimer: string;
  cta: { label: string; href: string };
};

/*
 * Pinned mode (desktop, motion allowed): the section is 4.6 viewports tall and
 * its stage sticks. Scroll progress 0..1 is split into four equal acts. Each
 * act's visual cross-fades in the same place while its inner pieces move at
 * their own depths. The page scrolls normally throughout; nothing is hijacked.
 *
 * Stacked mode (mobile, reduced motion, no script): the same markup is a
 * plain numbered sequence, each act followed by its finished visual.
 */
const ACTS = 4;
const FADE = 0.035;

/** Progress window in which act `index` is on stage. */
function actWindow(index: number): [number, number] {
  return [index / ACTS, (index + 1) / ACTS];
}

/** Maps a slice of an act (0..1 within the act) onto scene progress. */
function within(index: number, from: number, to: number): [number, number] {
  const [start, end] = actWindow(index);
  const length = end - start;
  return [start + from * length, start + to * length];
}

function useRange(progress: MotionValue<number>, input: [number, number], output: [number, number]) {
  return useTransform(progress, input, output, { clamp: true });
}

const RESULT_STYLE: Record<TokenResult, { icon: typeof CircleCheck; text: string; ring: string }> = {
  pass: { icon: CircleCheck, text: "text-rj-pass", ring: "border-rj-pass/30" },
  flag: { icon: OctagonX, text: "text-rj-fail", ring: "border-rj-fail/30" },
  unknown: { icon: CircleHelp, text: "text-rj-warn", ring: "border-rj-warn/30" },
};

export function RadarStory(props: RadarStoryProps) {
  return (
    <section
      id="meme-radar"
      aria-labelledby="meme-radar-title"
      className="relative border-y border-rj-line bg-[#090A0D] pinned:h-[460vh]"
    >
      <ParallaxScene track="pinned" className="h-full">
        <Stage {...props} />
      </ParallaxScene>
    </section>
  );
}

function Stage(props: RadarStoryProps) {
  const progress = useSceneProgress();
  const pinned = usePinned();
  const [active, setActive] = useState(0);
  useMotionValueEvent(progress, "change", (value) => {
    setActive(Math.min(ACTS - 1, Math.max(0, Math.floor(value * ACTS))));
  });

  const artScale = useRange(progress, [0, 1], [1, 1.16]);
  const artRotate = useRange(progress, [0, 1], [-4, 8]);
  const artY = useRange(progress, [0, 1], [0, -24]);
  const sweepRotate = useRange(progress, [0, 1], [0, 320]);
  const feedX = useRange(progress, [0, 1], [0, -160]);

  return (
    <div className="relative overflow-clip pinned:sticky pinned:top-0 pinned:h-svh">
      {/* Far plane: kit concept art, barely moving */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <m.div
          className="absolute top-[-4%] left-1/2 aspect-video w-[min(150vw,1500px)] -translate-x-1/2 opacity-[0.22] [mask-image:radial-gradient(closest-side,#000_35%,transparent)] pinned:top-1/2 pinned:left-[66%] pinned:w-[min(88vw,1320px)] pinned:-translate-y-1/2 pinned:opacity-[0.3]"
          style={pinned ? { scale: artScale, rotate: artRotate, y: artY } : undefined}
        >
          <Picture
            asset={assets.memeRadarConcept}
            alt=""
            sizes="(min-width: 1024px) 88vw, 150vw"
            imgClassName="size-full object-cover"
          />
        </m.div>
        {/* Middle plane: one sweep, turned by scroll rather than by a timer */}
        <div className="absolute top-1/2 left-[66%] hidden size-[min(64vh,620px)] -translate-x-1/2 -translate-y-1/2 pinned:block">
          <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
          <div className="absolute inset-[16%] rounded-full border border-white/[0.05]" />
          <m.div
            className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,rgb(153_69_255/0.16)_340deg,rgb(20_241_149/0.3)_359deg,transparent_360deg)] [mask-image:radial-gradient(closest-side,transparent_18%,#000_19%,#000_99%,transparent)]"
            style={pinned ? { rotate: sweepRotate } : undefined}
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_50%,transparent_40%,#090A0D_100%)]" />
      </div>

      <div className="container-rj relative py-20 pinned:flex pinned:h-full pinned:flex-col pinned:pt-[calc(var(--nav-height)+2.5rem)] pinned:pb-0 pinned:short:pt-[calc(var(--nav-height)+1.25rem)]">
        <div className="pinned:flex pinned:min-h-0 pinned:flex-1 pinned:flex-col pinned:justify-center">
          <div className="mx-auto max-w-[46rem] pinned:mx-0 pinned:w-[41%]">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={props.status} label={props.statusLabel} />
                <Pill>{props.demoLabel}</Pill>
              </div>
              <p className="text-eyebrow mt-5 text-rj-dim">{props.eyebrow}</p>
              <h2 id="meme-radar-title" className="text-display-2 mt-4 pinned:text-[clamp(2.25rem,3.3vw,3rem)]">
                {props.title}
              </h2>
              <p className="text-lede mt-5 max-w-[34rem] pinned:text-[1.0625rem] pinned:short:hidden">{props.lede}</p>
            </header>

            <ol className="mt-12 space-y-16 pinned:mt-9 pinned:space-y-0 pinned:short:mt-6">
              {props.acts.map((act, index) => (
                <Act
                  key={act.step}
                  index={index}
                  act={act}
                  active={active === index}
                  reached={active >= index}
                  previewTag={props.previewTag}
                >
                  {index === 0 && <PostScene handle={props.handle} post={props.post} />}
                  {index === 1 && <CandidatesScene tokens={props.tokens} />}
                  {index === 2 && (
                    <ChecksScene tokens={props.tokens} groups={props.resultGroups} report={props.report} />
                  )}
                  {index === 3 && <AlertScene confirmNote={props.confirmNote} />}
                </Act>
              ))}
            </ol>

            <div className="mt-14 pinned:mt-8 pinned:short:mt-5">
              <ButtonLink href={props.cta.href} size="lg" className="w-full sm:w-auto pinned:h-11 pinned:px-5 pinned:text-[0.9375rem]">
                {props.cta.label}
                <ArrowRight aria-hidden="true" className="size-4 text-rj-dim" />
              </ButtonLink>
              <p className="mt-5 max-w-[34rem] text-[0.8125rem] leading-relaxed text-rj-caption pinned:hidden">
                {props.disclaimer}
              </p>
            </div>
          </div>
        </div>

        {/* Demo feed: static text, nudged sideways by scroll in pinned mode. Never a live ticker. */}
        <div className="mt-12 border-t border-rj-line pt-5 pinned:mt-0 pinned:flex pinned:h-14 pinned:shrink-0 pinned:items-center pinned:gap-6 pinned:pt-0">
          <p className="text-eyebrow shrink-0 text-rj-dim">{props.feedLabel}</p>
          <div className="pinned:min-w-0 pinned:flex-1 pinned:overflow-hidden pinned:[mask-image:linear-gradient(to_right,transparent,#000_2rem,#000_calc(100%-3rem),transparent)]">
            <m.ul
              aria-label={props.feedLabel}
              className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[0.8125rem] text-rj-caption pinned:mt-0 pinned:flex-nowrap pinned:gap-x-8 pinned:pl-8 pinned:whitespace-nowrap"
              style={pinned ? { x: feedX } : undefined}
            >
              {[...props.feed, ...props.feed].map((item, index) => (
                <li
                  key={index}
                  aria-hidden={index >= props.feed.length}
                  className={cn("flex items-center gap-2", index >= props.feed.length && "hidden pinned:flex")}
                >
                  <span aria-hidden="true" className="size-1 rounded-full bg-rj-muted" />
                  {item}
                </li>
              ))}
            </m.ul>
          </div>
          <p className="hidden max-w-[24rem] shrink-0 text-[0.6875rem] leading-snug text-rj-caption pinned:block xl:max-w-none">
            {props.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

type ActProps = {
  index: number;
  act: { step: string; title: string; body: string };
  active: boolean;
  reached: boolean;
  previewTag: string;
  children: ReactNode;
};

function Act({ index, act, active, reached, previewTag, children }: ActProps) {
  const progress = useSceneProgress();
  const pinned = usePinned();
  const [start, end] = actWindow(index);
  const first = index === 0;
  const last = index === ACTS - 1;

  const opacity = useTransform(
    progress,
    [start - FADE, start + FADE, end - FADE, end + FADE],
    [first ? 1 : 0, 1, 1, last ? 1 : 0],
    { clamp: true },
  );
  const y = useTransform(
    progress,
    [start - FADE, start + FADE, end - FADE, end + FADE],
    [first ? 0 : 56, 0, 0, last ? 0 : -56],
    { clamp: true },
  );
  const railFill = useRange(progress, [start, end], [0, 1]);

  return (
    <li className="relative pinned:static">
      <div className="relative flex gap-4 pinned:py-2.5">
        {/* Rail segment to the next step. It draws as this act scrolls by. */}
        {!last && (
          <span aria-hidden="true" className="absolute top-9 -bottom-2.5 left-[0.6875rem] hidden w-px bg-white/10 pinned:block">
            <m.span
              className="absolute inset-0 origin-top bg-linear-to-b from-rj-purple to-rj-blue"
              style={pinned ? { scaleY: railFill } : undefined}
            />
          </span>
        )}
        <span
          className={cn(
            "relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border bg-[#090A0D] font-mono text-[0.6875rem] transition-colors duration-300",
            "border-rj-line-strong text-rj-dim",
            reached && "pinned:border-rj-purple/70 pinned:text-rj-text",
          )}
        >
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="text-eyebrow text-rj-caption pinned:hidden">{act.step}</p>
          <h3
            className={cn(
              "text-display-3 mt-1.5 transition-colors duration-300 pinned:mt-0 pinned:text-[1.125rem] pinned:leading-6",
              !active && "pinned:text-rj-dim",
            )}
          >
            {act.title}
          </h3>
          <div
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-500 ease-out-soft",
              active ? "pinned:grid-rows-[1fr] pinned:opacity-100" : "pinned:grid-rows-[0fr] pinned:opacity-0",
            )}
          >
            <div className="overflow-hidden">
              <p className="mt-2 max-w-[30rem] text-base leading-relaxed text-rj-dim pinned:min-h-[6.2rem] pinned:text-[0.9375rem] pinned:xl:min-h-[4.7rem]">
                {act.body}
              </p>
            </div>
          </div>
        </div>
      </div>

      <m.div
        className={cn(
          "mt-7 pinned:absolute pinned:top-(--nav-height) pinned:right-6 pinned:bottom-14 pinned:mt-0 pinned:flex pinned:w-[55%] pinned:items-center pinned:justify-center",
          !first && "pinned:opacity-0",
          !active && "pinned:pointer-events-none",
        )}
        style={pinned ? { opacity, y } : undefined}
      >
        <figure className="relative w-full">
          <figcaption className="mb-3 font-mono text-[0.625rem] tracking-[0.16em] text-rj-caption uppercase pinned:mb-5 pinned:text-center">
            {previewTag}
          </figcaption>
          <Reveal distance={20}>{children}</Reveal>
        </figure>
      </m.div>
    </li>
  );
}

/* ───────────────────────────── Act 1 ───────────────────────────── */

function PostScene({ handle, post }: { handle: string; post: string }) {
  const progress = useSceneProgress();
  const pinned = usePinned();
  const cardY = useRange(progress, within(0, 0, 1), [18, -34]);
  const cardRotate = useRange(progress, within(0, 0, 1), [-2.5, 0.5]);
  const chipY = useRange(progress, within(0, 0, 1), [40, -70]);
  const ringScale = useRange(progress, within(0, 0, 1), [0.82, 1.18]);
  const ringOpacity = useRange(progress, within(0, 0, 0.9), [0.9, 0.15]);

  return (
    <div className="relative mx-auto w-full max-w-[27rem] pinned:max-w-[29rem]">
      <m.div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 hidden size-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-rj-purple/25 pinned:block"
        style={pinned ? { scale: ringScale, opacity: ringOpacity } : undefined}
      />
      <m.article
        className="glass edge-gradient relative rounded-[22px] p-5 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.95)] sm:p-6"
        style={pinned ? { y: cardY, rotate: cardRotate } : undefined}
      >
        <header className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-rj-line-strong bg-rj-surface-2 text-rj-dim">
            <AtSign aria-hidden="true" className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-rj-text">Sample account</p>
            <p className="truncate font-mono text-[0.8125rem] text-rj-caption">{handle}</p>
          </div>
          <span className="ml-auto font-mono text-[0.75rem] text-rj-caption">now</span>
        </header>
        <p className="mt-4 text-[1.375rem] leading-snug font-medium text-rj-text">{post}</p>
        <div className="relative mt-4 grid aspect-[16/8] place-items-center overflow-hidden rounded-xl border border-rj-line bg-rj-bg">
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(60%_90%_at_22%_20%,rgb(153_69_255/0.38),transparent_70%),radial-gradient(55%_80%_at_82%_85%,rgb(20_241_149/0.22),transparent_70%),radial-gradient(40%_60%_at_60%_30%,rgb(79_123_255/0.28),transparent_70%)]"
          />
          <span aria-hidden="true" className="fine-grid absolute inset-0 opacity-60" />
          <span className="relative flex items-center gap-2 rounded-full border border-white/15 bg-rj-bg/70 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.12em] text-rj-dim uppercase backdrop-blur-sm">
            <ImageIcon aria-hidden="true" className="size-4" strokeWidth={1.75} />
            Sample image
          </span>
        </div>
        <p className="mt-4 font-mono text-[0.6875rem] tracking-[0.12em] text-rj-caption uppercase">
          Concept preview / demo data
        </p>
      </m.article>
      <m.div
        className="absolute -right-2 -bottom-5 flex items-center gap-2 rounded-full border border-rj-purple/50 bg-rj-surface-2 px-3.5 py-2 text-[0.8125rem] font-medium text-rj-text shadow-[0_18px_40px_-18px_rgb(0_0_0/0.9)] sm:-right-6"
        style={pinned ? { y: chipY } : undefined}
      >
        <RadioTower aria-hidden="true" className="size-4 text-[#C39BFF]" strokeWidth={1.75} />
        Post detected
      </m.div>
    </div>
  );
}

/* ───────────────────────────── Act 2 ───────────────────────────── */

function CandidatesScene({ tokens }: { tokens: DemoToken[] }) {
  const progress = useSceneProgress();
  const pinned = usePinned();
  const scanY = useTransform(progress, within(1, 0.05, 0.85), ["-100%", "0%"], { clamp: true });
  const scanOpacity = useTransform(progress, [...within(1, 0, 0.08), ...within(1, 0.82, 0.92)], [0, 1, 1, 0], {
    clamp: true,
  });
  const panelY = useRange(progress, within(1, 0, 1), [22, -26]);

  return (
    <m.div
      className="panel relative mx-auto w-full max-w-[31rem] overflow-hidden p-4 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.95)] sm:p-5"
      style={pinned ? { y: panelY } : undefined}
    >
      <header className="flex items-center justify-between gap-3 pb-3">
        <p className="flex items-center gap-2 text-[0.9375rem] font-medium text-rj-text">
          <ScanSearch aria-hidden="true" className="size-4 text-rj-dim" strokeWidth={1.75} />
          Candidate matches
        </p>
        <p className="font-mono text-[0.75rem] text-rj-caption">{tokens.length} found</p>
      </header>
      <div className="relative">
        <ul className="space-y-1.5">
          {tokens.map((token, index) => (
            <CandidateRow key={index} token={token} index={index} count={tokens.length} />
          ))}
        </ul>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden pinned:block">
          <m.div className="absolute inset-0" style={pinned ? { y: scanY, opacity: scanOpacity } : undefined}>
            <span className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-transparent via-rj-purple/[0.06] to-rj-green/[0.16]" />
            <span className="absolute inset-x-0 bottom-0 h-px bg-[image:var(--rj-gradient)]" />
          </m.div>
        </div>
      </div>
      <p className="mt-3 text-[0.75rem] leading-relaxed text-rj-caption">
        Matching is a best effort. It can miss tokens and surface unrelated ones.
      </p>
    </m.div>
  );
}

function CandidateRow({ token, index, count }: { token: DemoToken; index: number; count: number }) {
  const progress = useSceneProgress();
  const pinned = usePinned();
  const at = 0.04 + (index / count) * 0.6;
  const opacity = useRange(progress, within(1, at, at + 0.1), [0, 1]);
  const x = useRange(progress, within(1, at, at + 0.14), [36, 0]);

  return (
    <m.li
      className="flex items-center gap-3 rounded-xl border border-rj-line bg-rj-surface-2/70 px-3 py-2.5"
      style={pinned ? { opacity, x } : undefined}
    >
      <span className="w-14 shrink-0 font-mono text-[0.875rem] font-medium text-rj-text">{token.ticker}</span>
      <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-rj-dim">{token.match}</span>
      <span className="shrink-0 font-mono text-[0.6875rem] text-rj-caption">{token.age}</span>
    </m.li>
  );
}

/* ───────────────────────────── Act 3 ───────────────────────────── */

type ChecksSceneProps = {
  tokens: DemoToken[];
  groups: Record<TokenResult, string>;
  report: RadarStoryProps["report"];
};

const RESULT_ORDER: TokenResult[] = ["pass", "flag", "unknown"];

function ChecksScene({ tokens, groups, report }: ChecksSceneProps) {
  const progress = useSceneProgress();
  const pinned = usePinned();
  const reportX = useRange(progress, within(2, 0.3, 0.62), [90, 0]);
  const reportOpacity = useRange(progress, within(2, 0.3, 0.5), [0, 1]);
  const reportY = useRange(progress, within(2, 0, 1), [30, -46]);
  const groupsY = useRange(progress, within(2, 0, 1), [14, -18]);

  return (
    <div className="relative mx-auto grid w-full max-w-[39rem] items-center gap-4 sm:grid-cols-[1fr_0.88fr]">
      <m.div className="space-y-3" style={pinned ? { y: groupsY } : undefined}>
        {RESULT_ORDER.map((result, index) => (
          <ResultGroup
            key={result}
            result={result}
            label={groups[result]}
            tokens={tokens.filter((token) => token.result === result)}
            order={index}
          />
        ))}
      </m.div>
      <m.figure
        className="relative"
        style={pinned ? { x: reportX, y: reportY, opacity: reportOpacity } : undefined}
      >
        <div className="rounded-[18px] border border-rj-line bg-tg-bg p-3 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.95)] sm:rotate-[2deg]">
          <TgBubble time="9:41">
            <p>
              <Emoji>📋</Emoji> <b>{report.title}</b>
            </p>
            <ul className="mt-2 space-y-0.5">
              {report.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-2 text-tg-meta">{report.note}</p>
          </TgBubble>
          <TgKeyboardRow className="mt-1" labels={[<><Emoji>🧠</Emoji> Back to radar</>, <><Emoji>🏠</Emoji> Menu</>]} />
        </div>
        <figcaption className="mt-3 text-center font-mono text-[0.6875rem] tracking-[0.08em] text-rj-caption">
          Example Telegram report
        </figcaption>
      </m.figure>
    </div>
  );
}

function ResultGroup({ result, label, tokens, order }: { result: TokenResult; label: string; tokens: DemoToken[]; order: number }) {
  const progress = useSceneProgress();
  const pinned = usePinned();
  const at = 0.04 + order * 0.16;
  const opacity = useRange(progress, within(2, at, at + 0.12), [0, 1]);
  const y = useRange(progress, within(2, at, at + 0.16), [26, 0]);
  const style = RESULT_STYLE[result];
  const Glyph = style.icon;

  return (
    <m.section
      aria-label={`${label}: ${tokens.length}`}
      className={cn("panel p-3.5", style.ring)}
      style={pinned ? { opacity, y } : undefined}
    >
      <h4 className={cn("flex items-center gap-2 font-sans text-[0.875rem] font-semibold tracking-normal", style.text)}>
        <Glyph aria-hidden="true" className="size-4" strokeWidth={2} />
        {label}
        <span className="ml-auto font-mono text-[0.75rem] font-normal text-rj-caption">{tokens.length}</span>
      </h4>
      <ul className="mt-2.5 space-y-1">
        {tokens.map((token, index) => (
          <li key={index} className="flex items-baseline justify-between gap-3 text-[0.8125rem]">
            <span className="font-mono font-medium text-rj-text">{token.ticker}</span>
            <span className="truncate text-rj-dim">{token.reason}</span>
          </li>
        ))}
      </ul>
    </m.section>
  );
}

/* ───────────────────────────── Act 4 ───────────────────────────── */

function AlertScene({ confirmNote }: { confirmNote: string }) {
  const progress = useSceneProgress();
  const pinned = usePinned();
  const lockY = useRange(progress, within(3, 0, 1), [70, -30]);
  const lockScale = useRange(progress, within(3, 0, 0.5), [0.9, 1]);
  const confirmY = useRange(progress, within(3, 0, 1), [130, -56]);
  const confirmScale = useRange(progress, within(3, 0, 0.55), [0.92, 1.02]);
  const noteOpacity = useRange(progress, within(3, 0.35, 0.55), [0, 1]);
  const noteY = useRange(progress, within(3, 0.35, 1), [24, -12]);

  return (
    <div className="relative mx-auto aspect-[56/62] w-full max-w-[24rem] pinned:max-w-[min(33rem,calc((100svh-15rem)*0.9))]">
      <m.div
        className="absolute top-[10%] left-[2%] w-[44%] -rotate-[5deg]"
        style={pinned ? { y: lockY, scale: lockScale } : undefined}
      >
        <PhoneMockup
          asset={assets.phoneLockscreenAlert}
          alt="Preview with sample data: a phone lock screen showing a Ripjaw notification that a sample account just posted, with 2 tokens that passed checks and 4 flagged."
          sizes="(min-width: 1024px) 380px, 60vw"
          treatment="preview"
          grounded
        />
      </m.div>
      <m.div
        className="absolute top-0 right-[2%] w-[52%] rotate-[3deg]"
        style={pinned ? { y: confirmY, scale: confirmScale } : undefined}
      >
        <PhoneMockup
          asset={assets.phoneSnipeConfirm}
          alt="Preview with sample data: a Meme Radar alert in Telegram listing two top picks and four flagged tokens, followed by a confirmation message asking “Snipe 0.1 SOL of $DOGE?” with Snipe now and Cancel buttons."
          sizes="(min-width: 1024px) 440px, 70vw"
          treatment="preview"
          grounded
        />
      </m.div>
      <m.p
        className="glass absolute -bottom-[7%] left-0 flex max-w-[15rem] items-start gap-2.5 rounded-2xl p-3 text-[0.8125rem] leading-snug text-rj-text shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)]"
        style={pinned ? { opacity: noteOpacity, y: noteY } : undefined}
      >
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#8FAEFF]" strokeWidth={1.75} />
        {confirmNote}
      </m.p>
    </div>
  );
}
