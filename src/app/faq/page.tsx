import { FaqAccordion } from "@/components/faq/faq-accordion";
import { FinalCta } from "@/components/home/final-cta";
import { Reveal } from "@/components/ui/reveal";
import { getRoute } from "@/config/site";
import { faqGroups, faqPage } from "@/content/faq";
import { faqPageJsonLd, routeMetadata } from "@/lib/metadata";

const route = getRoute("/faq/");

export const metadata = routeMetadata(route.path);

export default function FaqPage() {
  const allEntries = faqGroups.flatMap((group) => group.entries);
  const [firstGroup] = faqGroups;
  const firstEntry = firstGroup?.entries[0];
  if (!firstEntry) throw new Error("FAQ page: the first group has no entries");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(allEntries)) }} />

      <div className="container-rj pt-14 pb-20 lg:pt-24 lg:pb-32">
        <header className="max-w-[52rem]">
          <p className="text-eyebrow mb-5 text-rj-dim">{faqPage.eyebrow}</p>
          <h1 className="text-display-2">{faqPage.title}</h1>
          <p className="text-lede mt-5 max-w-[40rem]">{faqPage.lede}</p>
        </header>

        <nav aria-label="FAQ topics" className="mt-10 lg:mt-12">
          <p className="text-eyebrow mb-3 text-rj-caption">{faqPage.jumpLabel}</p>
          <ul className="flex flex-wrap gap-2">
            {faqGroups.map((group) => (
              <li key={group.id}>
                <a
                  href={`#${group.id}`}
                  className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-rj-line-strong bg-white/[0.03] px-4 text-[0.9375rem] font-medium text-rj-text transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.07]"
                >
                  {group.heading}
                  <span className="font-mono text-[0.75rem] text-rj-caption">{group.entries.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-14 lg:mt-20">
          {faqGroups.map((group, index) => (
            <section
              key={group.id}
              id={group.id}
              aria-labelledby={`${group.id}-title`}
              className="grid gap-x-8 gap-y-6 border-t border-rj-line py-12 lg:grid-cols-12 lg:py-16"
            >
              <div className="lg:col-span-4">
                <Reveal className="lg:sticky lg:top-[calc(var(--nav-height)+3rem)]">
                  <p aria-hidden="true" className="font-mono text-[0.8125rem] text-rj-caption">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 id={`${group.id}-title`} className="text-display-3 mt-3 lg:text-[2rem] lg:leading-[1.1]">
                    {group.heading}
                  </h2>
                </Reveal>
              </div>
              <Reveal delay={0.05} className="lg:col-span-7 lg:col-start-6">
                <FaqAccordion
                  entries={group.entries}
                  defaultOpen={group === firstGroup ? [firstEntry.id] : []}
                  currentPath={route.path}
                />
              </Reveal>
            </section>
          ))}
        </div>
      </div>

      <FinalCta />
    </>
  );
}
