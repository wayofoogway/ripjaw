import { BetaShowcase } from "@/components/home/beta-showcase";
import { Faq } from "@/components/home/faq";
import { FeaturesBento } from "@/components/home/features-bento";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { MemeRadar } from "@/components/home/meme-radar";
import { Philosophy } from "@/components/home/philosophy";
import { Pillars } from "@/components/home/pillars";
import { Pricing } from "@/components/home/pricing";
import { Referrals } from "@/components/home/referrals";
import { Safety } from "@/components/home/safety";
import { site } from "@/config/site";
import { routeMetadata, softwareApplicationJsonLd } from "@/lib/metadata";

export const metadata = routeMetadata("/");

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd()) }}
      />
      <Hero />
      <Pillars />
      <BetaShowcase />
      <MemeRadar />
      <HowItWorks />
      <Safety />
      <FeaturesBento />
      <Philosophy />
      <Pricing />
      {site.referrals.showOnHome && <Referrals />}
      <Faq />
      <FinalCta />
    </>
  );
}
