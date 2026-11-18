import { FinalCta } from "@/components/home/final-cta";
import { ReportAnatomy } from "@/components/safety/anatomy";
import { ChecksTable } from "@/components/safety/checks-table";
import { Glossary } from "@/components/safety/glossary";
import { SafetyHero } from "@/components/safety/hero";
import { Limits } from "@/components/safety/limits";
import { Results } from "@/components/safety/results";
import { AnchorNav } from "@/components/ui/anchor-nav";
import { sectionNav } from "@/content/safety";
import { routeMetadata } from "@/lib/metadata";

export const metadata = routeMetadata("/safety/");

export default function SafetyPage() {
  return (
    <>
      <SafetyHero />
      <AnchorNav label={sectionNav.label} items={sectionNav.items} />
      <ReportAnatomy />
      <ChecksTable />
      <Results />
      <Limits />
      <Glossary />
      <FinalCta />
    </>
  );
}
