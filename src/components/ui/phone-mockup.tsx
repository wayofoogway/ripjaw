import type { PhoneAsset } from "@/lib/assets";
import { cn } from "@/lib/cn";
import { Picture } from "./picture";

/*
 * Kit phone renders are a 680x1160 transparent stage with a 430x900 device in
 * the middle and a soft glow around it. The layout box here is the device, so
 * phones can be placed and overlapped precisely; the glow overflows the box.
 */
const STAGE = { width: 680, height: 1160 };
const DEVICE = { width: 430, height: 900 };
const OVERFLOW = {
  left: `${(-((STAGE.width - DEVICE.width) / 2) / DEVICE.width) * 100}%`,
  top: `${(-((STAGE.height - DEVICE.height) / 2) / DEVICE.height) * 100}%`,
  width: `${(STAGE.width / DEVICE.width) * 100}%`,
};

type PhoneMockupProps = {
  asset: PhoneAsset;
  alt: string;
  /**
   * `sizes` for the image. The image is 1.58x the device width, so pass about
   * 1.6x the width the phone is laid out at, e.g. "(min-width: 1024px) 520px, 70vw".
   */
  sizes: string;
  priority?: boolean;
  /**
   * `preview` mutes the screen slightly, for features that are not available yet.
   * Pair it with a visible text label; the treatment alone is not the signal.
   */
  treatment?: "product" | "preview";
  /** Adds a soft contact shadow under the device, for phones that float over dark art. */
  grounded?: boolean;
  /** Sets the device width, e.g. "w-[300px]". */
  className?: string;
};

/** One kit phone as an isolated layer. */
export function PhoneMockup({
  asset,
  alt,
  sizes,
  priority,
  treatment = "product",
  grounded = false,
  className,
}: PhoneMockupProps) {
  return (
    <div className={cn("relative aspect-[430/900]", className)} data-phone={treatment}>
      {grounded && (
        <div
          aria-hidden="true"
          className="absolute inset-x-[4%] top-[55%] -bottom-[9%] rounded-[50%] bg-black/70 blur-3xl"
        />
      )}
      <div className="absolute" style={OVERFLOW}>
        <Picture
          asset={asset}
          alt={alt}
          sizes={sizes}
          priority={priority}
          imgClassName={cn(
            "block h-auto w-full max-w-none",
            treatment === "preview" && "saturate-[0.82] brightness-[0.94]",
          )}
        />
      </div>
    </div>
  );
}
