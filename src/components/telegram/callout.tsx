import { cn } from "@/lib/cn";

/**
 * Numbered marker that ties a part of a recreated bot message to a note
 * beside it. It is page furniture, not bot UI, so it sits in the gutter.
 */
export function CalloutNumber({ n, className }: { n: number; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-full border border-rj-purple/60 bg-[#1B1430] font-mono text-[0.6875rem] font-medium text-[#DCC8FF]",
        className,
      )}
    >
      <span className="sr-only">Note </span>
      {n}
    </span>
  );
}
