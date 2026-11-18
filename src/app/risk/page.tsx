import { LongForm } from "@/components/ui/long-form";
import { risk } from "@/content/legal";
import { draftNotice } from "@/content/owner-facts";
import { routeMetadata } from "@/lib/metadata";

export const metadata = routeMetadata("/risk/");

export default function RiskPage() {
  return <LongForm {...risk} notice={draftNotice} />;
}
