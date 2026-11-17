import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

const BASE =
  "group/btn relative inline-flex items-center justify-center gap-2.5 rounded-full font-semibold whitespace-nowrap select-none transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-out-soft active:scale-[0.98]";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "overflow-hidden bg-[image:var(--rj-gradient)] text-rj-bg shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset,0_10px_36px_-12px_rgb(153_69_255/0.7),0_10px_36px_-14px_rgb(20_241_149/0.45)] hover:shadow-[0_0_0_1px_rgb(255_255_255/0.2)_inset,0_14px_44px_-10px_rgb(153_69_255/0.85),0_14px_44px_-12px_rgb(20_241_149/0.6)] hover:-translate-y-0.5",
  secondary:
    "border border-rj-line-strong bg-white/[0.03] text-rj-text hover:border-white/30 hover:bg-white/[0.07]",
  ghost: "text-rj-text underline-offset-4 hover:underline",
};

const SIZES: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

/** Class string for anything that should look like a button. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}): string {
  return cn(BASE, VARIANTS[variant], variant !== "ghost" && SIZES[size], className);
}

/** Sheen that crosses a primary button on hover. Purely decorative. */
export function ButtonSheen() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/35 opacity-0 blur-md transition-[transform,opacity] duration-500 ease-out-soft group-hover/btn:translate-x-[420%] group-hover/btn:opacity-100"
    />
  );
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

/** Internal navigation styled as a button. Telegram links use `TelegramCta` instead. */
export function ButtonLink({ variant = "secondary", size = "md", className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      {variant === "primary" && <ButtonSheen />}
      <span className="relative inline-flex items-center gap-2.5">{children}</span>
    </Link>
  );
}
