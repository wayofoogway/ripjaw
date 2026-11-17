/** The kit's horizontal lockup, kept as SVG so it stays sharp. Minimum width 120px. */
export function Lockup({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG logo, no optimisation needed
    <img
      src="/brand/ripjaw-lockup-horizontal.svg"
      width={1520}
      height={340}
      alt="Ripjaw"
      decoding="async"
      draggable={false}
      className={className}
    />
  );
}
