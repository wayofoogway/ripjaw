import { assets, type AssetKey } from "@/lib/assets";
import { cn } from "@/lib/cn";
import { Picture } from "./picture";

type ScreenshotProps = {
  asset: AssetKey;
  alt: string;
  caption: string;
  /** Above-the-fold image: load eagerly. */
  priority?: boolean;
  className?: string;
};

/** A product screenshot with its caption. Screenshots show sample data, and the caption says so. */
export function Screenshot({ asset, alt, caption, priority, className }: ScreenshotProps) {
  return (
    <figure className={cn("w-full max-w-[22rem]", className)}>
      <Picture
        asset={assets[asset]}
        alt={alt}
        sizes="(min-width: 400px) 352px, calc(100vw - 48px)"
        priority={priority}
        imgClassName="h-auto w-full rounded-xl border border-rj-line-strong"
      />
      <figcaption className="mt-3 text-sm text-rj-caption">{caption}</figcaption>
    </figure>
  );
}
