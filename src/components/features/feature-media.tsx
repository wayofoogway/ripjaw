import type { DeepDive } from "@/content/features";
import { assets } from "@/lib/assets";
import { cn } from "@/lib/cn";
import { ParallaxLayer } from "../ui/parallax";
import { PhoneMockup } from "../ui/phone-mockup";
import { Picture } from "../ui/picture";

const FRAME = "relative overflow-hidden rounded-[22px] border border-rj-line shadow-[0_40px_90px_-40px_rgb(0_0_0/0.95)]";

/** A chat screenshot taller than this (height / width) is shown through a window and scrolls inside it. */
const TALL_CHAT = 1.2;

/**
 * The picture for a deep dive. Every variant is two planes inside a
 * <ParallaxScene>: kit art or a screenshot that drifts, and a frame that stays.
 */
export function FeatureMedia({ media, alt }: Pick<DeepDive, "media" | "alt">) {
  if (media.kind === "phone") {
    return (
      <div className={cn(FRAME, "aspect-[4/5] bg-[#090A0D] sm:aspect-square")}>
        <ParallaxLayer y={[-26, 26]} className="absolute inset-x-0 -inset-y-[8%]" aria-hidden>
          <Picture
            asset={assets[media.backdrop]}
            alt=""
            sizes="(min-width: 1024px) 760px, 140vw"
            className="absolute inset-0"
            imgClassName="size-full object-cover opacity-70"
          />
        </ParallaxLayer>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_45%,transparent_30%,rgb(9_10_13/0.85)_100%)]"
        />
        <ParallaxLayer y={[44, -30]} className="absolute top-[6%] left-1/2 w-[52%] -translate-x-1/2 sm:top-[8%] sm:w-[40%]">
          <PhoneMockup
            asset={assets[media.phone]}
            alt={alt}
            sizes="(min-width: 1024px) 400px, 85vw"
            treatment={media.preview ? "preview" : "product"}
            grounded
          />
        </ParallaxLayer>
      </div>
    );
  }

  if (media.kind === "art") {
    return (
      <div className={cn(FRAME, "aspect-[4/3] bg-[#090A0D]")}>
        <ParallaxLayer y={[-26, 26]} className="absolute inset-x-0 -inset-y-[8%]">
          <Picture
            asset={assets[media.art]}
            alt={alt}
            sizes="(min-width: 1024px) 620px, 100vw"
            className="absolute inset-0"
            imgClassName="size-full object-cover"
          />
        </ParallaxLayer>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,rgb(9_10_13/0.7)_100%)]"
        />
      </div>
    );
  }

  const chat = assets[media.chat];
  const tall = chat.height / chat.width > TALL_CHAT;
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-x-6 -inset-y-10 bg-[radial-gradient(55%_55%_at_50%_50%,rgb(79_123_255/0.12),transparent_70%)]"
      />
      <div className={cn(FRAME, "mx-auto max-w-[30rem] bg-tg-bg", tall && "aspect-[4/5]")}>
        <ParallaxLayer y={tall ? [0, -110] : [0, 0]}>
          <Picture asset={chat} alt={alt} sizes="(min-width: 1024px) 480px, 100vw" imgClassName="block h-auto w-full" />
        </ParallaxLayer>
        <div
          aria-hidden="true"
          className={cn("absolute inset-x-0 bottom-0 bg-linear-to-b from-transparent to-tg-bg", tall ? "h-24" : "h-10")}
        />
      </div>
    </div>
  );
}
