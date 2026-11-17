import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionProps = {
  id?: string;
  /** `default`: 80px mobile / 128px desktop. `tight`: a calm pause. `none`: the section manages its own height. */
  spacing?: "default" | "tight" | "none";
  /** Skip the 1200px container when the section lays out its own full-bleed layers. */
  bleed?: boolean;
  /** Accessible name for the landmark, when the section has no visible heading. */
  label?: string;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
};

const SPACING = {
  default: "py-20 lg:py-32",
  tight: "py-14 lg:py-20",
  none: "",
};

/** Page section: sets the vertical rhythm and the 12-column content width. */
export function Section({
  id,
  spacing = "default",
  bleed = false,
  label,
  labelledBy,
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-label={label}
      aria-labelledby={labelledBy}
      className={cn("relative", SPACING[spacing], className)}
    >
      {bleed ? children : <div className="container-rj">{children}</div>}
    </section>
  );
}

type SectionHeadingProps = {
  id?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  /** Heading level. Sections on a page use h2; nested blocks use h3. */
  as?: "h2" | "h3";
  className?: string;
};

/** Eyebrow, heading and optional lede with the shared type scale. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lede,
  align = "left",
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-[44rem]", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="text-eyebrow mb-5 text-rj-dim">{eyebrow}</p>}
      <Heading id={id} className={Heading === "h2" ? "text-display-2" : "text-display-3"}>
        {title}
      </Heading>
      {lede && <p className="text-lede mt-5">{lede}</p>}
    </div>
  );
}
