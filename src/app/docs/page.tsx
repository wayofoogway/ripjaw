import Link from "next/link";
import { CommandList } from "@/components/docs/command-list";
import { LongForm, type LongFormSection } from "@/components/ui/long-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { TelegramCta } from "@/components/ui/telegram-cta";
import { site } from "@/config/site";
import { docs } from "@/content/docs";
import { routeMetadata } from "@/lib/metadata";

export const metadata = routeMetadata("/docs/");

export default function DocsPage() {
  const { gettingStarted, usingCommands, stayingSafe } = docs;

  const sections: LongFormSection[] = [
    {
      id: gettingStarted.id,
      heading: gettingStarted.heading,
      content: (
        <>
          <p>{gettingStarted.intro}</p>
          <ol>
            {gettingStarted.steps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}.</strong> {step.body}
              </li>
            ))}
          </ol>
          <p className="pt-2">
            <TelegramCta label={site.cta.primary.label} location="docs" variant="secondary" />
          </p>
        </>
      ),
    },
    {
      id: usingCommands.id,
      heading: usingCommands.heading,
      content: (
        <>
          {usingCommands.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <h3>{usingCommands.legendHeading}</h3>
          <dl className="divide-y divide-rj-line border-y border-rj-line">
            {usingCommands.legend.map((entry) => (
              <div key={entry.status} className="grid gap-x-6 gap-y-1.5 py-3 sm:grid-cols-[13rem_1fr] sm:items-center">
                <dt>
                  <StatusBadge status={entry.status} label={entry.label} size="sm" />
                </dt>
                <dd className="text-base leading-relaxed lg:text-[0.9375rem]">{entry.explanation}</dd>
              </div>
            ))}
          </dl>
        </>
      ),
    },
    ...docs.groups.map((group) => ({
      id: group.id,
      heading: group.heading,
      content: <CommandList group={group} copyLabels={docs.copy} />,
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
            <Link href={stayingSafe.riskLink.href}>{stayingSafe.riskLink.label}</Link>
          </p>
        </>
      ),
    },
  ];

  return (
    <LongForm eyebrow={docs.eyebrow} title={docs.title} lede={docs.lede} notice={docs.notice} sections={sections} />
  );
}
