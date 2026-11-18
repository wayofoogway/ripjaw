import { site } from "@/config/site";
import { howItWorks } from "@/content/home";
import { assets } from "@/lib/assets";
import { Reveal } from "../ui/reveal";
import { Section, SectionHeading } from "../ui/section";
import { StepSwitcher } from "./step-switcher";

/** Four onboarding steps. On desktop a phone sticks beside them and changes screen with the active step. */
export function HowItWorks() {
  const screens = [
    {
      asset: assets.phoneHomeMenu,
      alt: "Ripjaw main menu in Telegram after tapping Start.",
    },
    {
      asset: assets.phoneHomeWallet,
      alt: "Ripjaw start message in Telegram showing a main wallet address, its balance and a prompt to deposit.",
    },
    {
      asset: assets.phoneHomeWallet,
      alt: "Ripjaw start message in Telegram showing the wallet that the access fee is paid from.",
      overlay: { value: site.access.priceLabel, label: `${site.access.descriptor} · paid in Telegram` },
    },
    {
      asset: assets.phoneSafetyCheck,
      alt: "Ripjaw Safety Check report in Telegram for the token BONK.",
    },
  ];

  return (
    <Section id="how-it-works" labelledBy="how-title">
      <Reveal>
        <SectionHeading id="how-title" eyebrow={howItWorks.eyebrow} title={howItWorks.title} lede={howItWorks.lede} />
      </Reveal>
      <StepSwitcher
        steps={howItWorks.steps.map((step, index) => {
          const screen = screens[index];
          if (!screen) throw new Error(`How it works: step ${index + 1} has no screen`);
          return { ...step, ...screen };
        })}
        caption="Screens from the Ripjaw bot · sample data"
      />
    </Section>
  );
}
