"use client";

import { useEffect, useRef, useState } from "react";
import type { PhoneAsset } from "@/lib/assets";
import { cn } from "@/lib/cn";
import { PhoneMockup } from "../ui/phone-mockup";

type Step = {
  title: string;
  body: string;
  asset: PhoneAsset;
  alt: string;
  /** A site-drawn note over the phone (not bot UI), e.g. the access price. */
  overlay?: { value: string; label: string };
};

/**
 * Steps on the right, a sticky phone on the left that shows the screen for
 * whichever step is crossing the middle of the viewport. On small screens the
 * phone sits below the list and the steps read as a plain numbered sequence.
 */
export function StepSwitcher({ steps, caption }: { steps: Step[]; caption: string }) {
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const item of items.current) if (item) observer.observe(item);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mt-12 grid gap-x-8 gap-y-14 lg:mt-20 lg:grid-cols-12">
      <figure className="order-last lg:sticky lg:top-[calc(var(--nav-height)+2.5rem)] lg:order-first lg:col-span-5 lg:self-start">
        <div className="relative mx-auto w-[58%] max-w-[15rem] sm:max-w-[17rem] lg:w-auto lg:max-w-[min(18.5rem,calc((100svh-15rem)*0.478))]">
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 size-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(79_123_255/0.16),transparent)]"
          />
          {steps.map((step, index) => {
            const shown = index === active;
            return (
              <div
                key={index}
                aria-hidden={!shown}
                className={cn(
                  "transition-[opacity,transform] duration-500 ease-out-soft",
                  index > 0 && "absolute inset-0",
                  shown ? "opacity-100" : "translate-y-3 scale-[0.985] opacity-0",
                )}
              >
                <PhoneMockup asset={step.asset} alt={shown ? step.alt : ""} sizes="(min-width: 1024px) 480px, 62vw" />
                {step.overlay && (
                  <p className="glass edge-gradient absolute top-[56%] left-1/2 w-[86%] -translate-x-1/2 rounded-2xl px-4 py-3.5 text-center shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)]">
                    <span className="block font-mono text-[1.75rem] leading-none font-medium text-rj-text">
                      {step.overlay.value}
                    </span>
                    <span className="mt-2 block text-[0.75rem] leading-snug text-rj-dim">{step.overlay.label}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <figcaption className="mt-10 text-center font-mono text-[0.6875rem] tracking-[0.08em] text-rj-caption">
          {caption}
        </figcaption>
      </figure>

      <ol className="lg:col-span-6 lg:col-start-7">
        {steps.map((step, index) => {
          const current = index === active;
          return (
            <li
              key={step.title}
              ref={(node) => {
                items.current[index] = node;
              }}
              data-step={index}
              className="flex gap-5 border-t border-rj-line py-8 first:border-t-0 first:pt-0 lg:min-h-[19rem] lg:gap-8 lg:py-12 lg:first:pt-4"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "font-display text-[2.5rem] leading-none font-semibold tracking-tight transition-colors duration-500 lg:text-[4rem]",
                  current ? "text-gradient" : "text-rj-surface-2 [-webkit-text-stroke:1px_rgb(255_255_255/0.16)]",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="pt-1 lg:pt-3">
                <h3 className="text-display-3">{step.title}</h3>
                <p className="mt-3 max-w-[28rem] text-base leading-relaxed text-rj-dim lg:text-[1.0625rem]">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
