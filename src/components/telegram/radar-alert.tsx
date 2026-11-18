import { cn } from "@/lib/cn";
import { CalloutNumber } from "./callout";
import { Emoji, TgBubble, TgKeyboardRow } from "./chat";

type RadarAlertProps = {
  handle: string;
  post: string;
  /** The idea the post was reduced to. */
  idea: string;
  picks: { ticker: string; stats: string }[];
  flagged: { ticker: string; reason: string }[];
  /** The bot's own wording, from `workflow.alert.message` in content/meme-radar.ts. */
  text: {
    postedSuffix: string;
    openPost: string;
    picksLabel: string;
    picksMeta: string;
    flaggedLabel: string;
    footer: string;
    time: string;
    snipeSizes: string[];
    customLabel: string;
    reportLabel: string;
    refreshLabel: string;
    menuLabel: string;
  };
  className?: string;
};

const GUTTER = "absolute -left-[2.625rem]";

/**
 * A Meme Radar alert as real text, recreated from the kit's preview mockup.
 * The numbers in the gutter are added by the site and match a list of notes
 * beside the alert: 1 the post, 2 top picks, 3 flagged, 4 the buttons.
 */
export function RadarAlert({ handle, post, idea, picks, flagged, text, className }: RadarAlertProps) {
  const [firstSize, ...otherSizes] = text.snipeSizes;
  if (firstSize === undefined) throw new Error("RadarAlert: at least one snipe size is required");

  return (
    <div className={cn("rounded-[18px] border border-rj-line bg-tg-bg p-2.5 pl-10", className)}>
      <TgBubble time={text.time} className="flow-root">
        <div className="relative">
          <CalloutNumber n={1} className={cn(GUTTER, "top-0")} />
          <p>
            <Emoji>📣</Emoji>{" "}
            <b>
              {handle} {text.postedSuffix}
            </b>
          </p>
          <p>{post}</p>
          <p className="text-tg-link">{text.openPost}</p>
          <p>
            <Emoji>🧠</Emoji> {idea}
          </p>
        </div>
        <div className="relative mt-3">
          <CalloutNumber n={2} className={cn(GUTTER, "top-0")} />
          <p>
            <Emoji>✅</Emoji> <b>{text.picksLabel}</b> · {text.picksMeta}
          </p>
          <ol>
            {picks.map((pick, index) => (
              <li key={index}>
                {index + 1}. <b>{pick.ticker}</b> · {pick.stats}
              </li>
            ))}
          </ol>
        </div>
        <div className="relative mt-3">
          <CalloutNumber n={3} className={cn(GUTTER, "top-0")} />
          <p>
            <Emoji>⚠️</Emoji> <b>{text.flaggedLabel}</b>
          </p>
          <ul>
            {flagged.map((token, index) => (
              <li key={index}>
                {token.ticker} · {token.reason}
              </li>
            ))}
          </ul>
          <p>{text.footer}</p>
        </div>
      </TgBubble>

      <div className="relative mt-1 space-y-1">
        <CalloutNumber n={4} className="absolute top-1.5 -left-[1.875rem]" />
        {picks.map((pick, index) => (
          <div key={index} className="space-y-1">
            <div className="flex gap-1">
              <TgKeyboardRow
                className="min-w-0 flex-[2.2]"
                labels={[<><Emoji>⚡</Emoji> Snipe {firstSize} {pick.ticker}</>]}
              />
              {otherSizes.map((size) => (
                <TgKeyboardRow key={size} className="flex-none" labels={[<><Emoji>⚡</Emoji> {size}</>]} />
              ))}
              <TgKeyboardRow className="min-w-0 flex-1" labels={[<><Emoji>✏️</Emoji> {text.customLabel}</>]} />
            </div>
            <TgKeyboardRow labels={[<><Emoji>📋</Emoji> {pick.ticker} {text.reportLabel}</>]} />
          </div>
        ))}
        {flagged.map((token, index) => (
          <TgKeyboardRow key={index} labels={[<><Emoji>📋</Emoji> {token.ticker} · {token.reason}</>]} />
        ))}
        <TgKeyboardRow
          labels={[<><Emoji>🔄</Emoji> {text.refreshLabel}</>, <><Emoji>🏠</Emoji> {text.menuLabel}</>]}
        />
      </div>
    </div>
  );
}
