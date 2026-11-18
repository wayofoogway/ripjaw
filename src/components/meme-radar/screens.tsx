import { previewTag, screens } from "@/content/meme-radar";
import { assets } from "@/lib/assets";
import { cn } from "@/lib/cn";
import { ParallaxLayer, ParallaxScene } from "../ui/parallax";
import { PhoneMockup } from "../ui/phone-mockup";
import { Reveal } from "../ui/reveal";
import { ScrollRow } from "../ui/scroll-row";
import { Section, SectionHeading } from "../ui/section";

/* Each phone travels a different distance, so the row separates into planes as it scrolls by. */
const TRAVEL = [
  [34, -34],
  [70, -70],
  [48, -48],
] as const;

/** The kit's three Meme Radar screens in the order a user would meet them. A swipe row on phones, a row of three from `md`. */
export function Screens() {
  return (
    <Section id="screens" labelledBy="screens-title" bleed className="overflow-clip">
      <div className="container-rj">
        <Reveal>
          <SectionHeading id="screens-title" eyebrow={screens.eyebrow} title={screens.title} lede={screens.lede} />
        </Reveal>
        <p className="mt-6 font-mono text-[0.6875rem] tracking-[0.16em] text-rj-caption uppercase md:hidden">
          {screens.hint}
        </p>
      </div>

      <ParallaxScene track="through-view" className="mt-2 md:mt-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[12%] bottom-[30%] bg-[radial-gradient(50%_60%_at_50%_50%,rgb(153_69_255/0.13),transparent_70%)]"
        />
        <ScrollRow
          label={screens.listLabel}
          className="relative flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 py-10 [scrollbar-width:none] md:mx-auto md:grid md:max-w-[1248px] md:grid-cols-3 md:gap-8 md:overflow-visible md:py-12"
        >
          {screens.items.map((item, index) => {
            const travel = TRAVEL[index];
            if (!travel) throw new Error(`screens: no parallax travel defined for screen ${index + 1}`);
            return (
              <li key={item.asset} className="w-[72vw] max-w-[19rem] shrink-0 snap-center md:w-auto md:max-w-none">
                <ParallaxLayer y={travel}>
                  <figure>
                    <PhoneMockup
                      asset={assets[item.asset]}
                      alt={item.alt}
                      sizes="(min-width: 768px) 420px, 115vw"
                      treatment="preview"
                      grounded
                      className={cn("mx-auto w-[78%] md:w-[70%]", index === 1 && "md:mt-10")}
                    />
                    <figcaption className="mt-12 md:mt-16 md:text-center">
                      <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-rj-caption uppercase">
                        {String(index + 1).padStart(2, "0")} · {previewTag}
                      </p>
                      <h3 className="text-display-3 mt-3">{item.title}</h3>
                      <p className="mt-2 text-base leading-relaxed text-rj-dim md:mx-auto md:max-w-[20rem]">{item.body}</p>
                    </figcaption>
                  </figure>
                </ParallaxLayer>
              </li>
            );
          })}
        </ScrollRow>
      </ParallaxScene>
    </Section>
  );
}
