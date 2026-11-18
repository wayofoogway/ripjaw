import Link from "next/link";
import { CommandList } from "@/components/docs/command-list";
import { EarlyAccessSection } from "@/components/early-access/early-access";
import { LongForm, type LongFormSection } from "@/components/ui/long-form";
import { docs } from "@/content/docs";
import { routeMetadata } from "@/lib/metadata";

export const metadata = routeMetadata("/docs/");

export default function DocsPage() {
  const { usingCommands, stayingSafe } = docs;

  const sections: LongFormSection[] = [
    {
      id: usingCommands.id,
      heading: usingCommands.heading,
      content: (
        <>
          {usingCommands.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>
            <Link href={usingCommands.statusLink.href} className="link">{usingCommands.statusLink.label}</Link>
          </p>
        </>
      ),
    },
    ...docs.groups.map((group) => ({
      id: group.id,
      heading: group.heading,
      content: <CommandList group={group} statusPrefix={docs.statusPrefix} copyLabels={docs.copy} />,
    })),
    {
      id: stayingSafe.id,
      heading: stayingSafe.heading,
      content: (
        <>
          <ul>
            {stayingSafe.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p>
            <Link href={stayingSafe.riskLink.href} className="link">{stayingSafe.riskLink.label}</Link>
          </p>
        </>
      ),
    },
  ];

  return (
    <>
      <LongForm title={docs.title} lede={docs.lede} sections={sections} />
      <EarlyAccessSection />
    </>
  );
}
