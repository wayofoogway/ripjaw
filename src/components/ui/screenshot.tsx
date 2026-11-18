import { assets, type AssetKey } from "@/lib/assets";
import { cn } from "@/lib/cn";
import { Picture } from "./picture";

type ScreenshotProps = {
  asset: AssetKey;
  alt: string;
  caption: string;
  /**
   * `chat` (default): a crop of the chat, outlined so it reads against the page.
   * `phone`: a kit phone mockup. The device is its own edge, so there is no outline.
   */
  variant?: "chat" | "phone";
  /** Above-the-fold image: load eagerly. */
  priority?: boolean;
  className?: string;
};

const VARIANTS = {
  chat: {
    figure: "max-w-[22rem]",
    image: "rounded-xl border border-rj-line-strong",
    sizes: "(min-width: 400px) 352px, calc(100vw - 48px)",
  },
  phone: {
    figure: "max-w-[16.5rem] lg:max-w-[18.75rem]",
    image: "",
    sizes: "(min-width: 1024px) 300px, 264px",
  },
};

/** A product screenshot with its caption. Screenshots show sample data, and the caption says so. */
export function Screenshot({ asset, alt, caption, variant = "chat", priority, className }: ScreenshotProps) {
  const style = VARIANTS[variant];
  return (
    <figure data-screenshot={variant} className={cn("w-full", style.figure, className)}>
      <Picture
        asset={assets[asset]}
        alt={alt}
        sizes={style.sizes}
        priority={priority}
        imgClassName={cn("h-auto w-full", style.image)}
      />
      <figcaption className="mt-3 text-sm text-balance text-rj-caption">{caption}</figcaption>
    </figure>
  );
}
