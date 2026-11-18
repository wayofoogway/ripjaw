import { LongForm } from "@/components/ui/long-form";
import { privacy } from "@/content/legal";
import { draftNotice } from "@/content/owner-facts";
import { routeMetadata } from "@/lib/metadata";

export const metadata = routeMetadata("/privacy/");

export default function PrivacyPage() {
  return <LongForm {...privacy} notice={draftNotice} />;
}
