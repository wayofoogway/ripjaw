import { FinalCta } from "@/components/home/final-cta";
import { Controls } from "@/components/meme-radar/controls";
import { MemeRadarHero } from "@/components/meme-radar/hero";
import { Ledger } from "@/components/meme-radar/ledger";
import { Limits } from "@/components/meme-radar/limits";
import { Questions } from "@/components/meme-radar/questions";
import { Screens } from "@/components/meme-radar/screens";
import { Workflow } from "@/components/meme-radar/workflow";
import { AnchorNav } from "@/components/ui/anchor-nav";
import { sectionNav } from "@/content/meme-radar";
import { routeMetadata } from "@/lib/metadata";

export const metadata = routeMetadata("/meme-radar/");

export default function MemeRadarPage() {
  return (
    <>
      <MemeRadarHero />
      <AnchorNav label={sectionNav.label} items={sectionNav.items} />
      <Ledger />
      <Workflow />
      <Screens />
      <Controls />
      <Limits />
      <Questions />
      <FinalCta />
    </>
  );
}
