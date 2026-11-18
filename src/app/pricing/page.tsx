import { FinalCta } from "@/components/home/final-cta";
import { Pricing } from "@/components/home/pricing";
import { Referrals } from "@/components/home/referrals";
import { Costs } from "@/components/pricing/costs";
import { PricingFaq } from "@/components/pricing/pricing-faq";
import { ParallaxLayer, ParallaxScene } from "@/components/ui/parallax";
import { site } from "@/config/site";
import { routeMetadata } from "@/lib/metadata";

export const metadata = routeMetadata("/pricing/");

export default function PricingPage() {
  return (
    <>
      <div className="relative overflow-clip">
        <ParallaxScene track="from-top">
          {/* Far plane only: the numbers stay still. */}
          <ParallaxLayer y={[0, 28]} className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute top-1/2 left-1/2 w-[1200px] -translate-x-1/2 -translate-y-1/2">
              <div className="fine-grid absolute top-1/2 right-[-10%] size-[760px] -translate-y-1/2 [mask-image:radial-gradient(closest-side,#000,transparent)]" />
              <div className="absolute top-1/2 right-[2%] size-[560px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(153_69_255/0.16),transparent)]" />
            </div>
          </ParallaxLayer>
          <Pricing headingLevel="h1" />
        </ParallaxScene>
      </div>
      <Costs />
      {site.referrals.showOnPricing && <Referrals />}
      <PricingFaq />
      <FinalCta />
    </>
  );
}
