import { LongForm } from "@/components/ui/long-form";
import { terms } from "@/content/legal";
import { draftNotice } from "@/content/owner-facts";
import { routeMetadata } from "@/lib/metadata";

export const metadata = routeMetadata("/terms/");

export default function TermsPage() {
  return <LongForm {...terms} notice={draftNotice} />;
}
