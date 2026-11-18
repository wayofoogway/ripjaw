import type { RasterAsset } from "@/lib/assets";

type PictureProps = {
  asset: RasterAsset;
  /** Describe the image, or pass "" when it is decorative. */
  alt: string;
  /** Rendered width as a `sizes` value, e.g. "(min-width: 1024px) 50vw, 100vw". */
  sizes: string;
  /** Above-the-fold image: load eagerly with high fetch priority. */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
};

function srcSet(asset: RasterAsset, format: "avif" | "webp"): string {
  return asset.widths.map((w) => `${asset.base}-${w}.${format} ${w}w`).join(", ");
}

/** AVIF with a WebP fallback, with reserved dimensions and lazy loading by default. */
export function Picture({ asset, alt, sizes, priority = false, className, imgClassName }: PictureProps) {
  const largest = asset.widths[asset.widths.length - 1];
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet(asset, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(asset, "webp")} sizes={sizes} />
      <img
        src={`${asset.base}-${largest}.webp`}
        width={asset.width}
        height={asset.height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
        className={imgClassName}
      />
    </picture>
  );
}
