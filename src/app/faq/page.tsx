import Link from "next/link";
import { EarlyAccessSection } from "@/components/early-access/early-access";
import { Accordion } from "@/components/ui/accordion";
import { Fade } from "@/components/ui/fade";
import { PageIntro } from "@/components/ui/section";
import { faq, faqPage } from "@/content/faq";
import { faqPageJsonLd, routeMetadata } from "@/lib/metadata";

export const metadata = routeMetadata("/faq/");

export default function FaqPage() {
  const [first] = faq;
  if (!first) throw new Error("FAQ page: there are no entries");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(faq)) }} />

      <PageIntro title={faqPage.title} lede={faqPage.lede} />

      <Fade className="container-rj pb-16 lg:pb-24">
        <div className="max-w-[46rem]">
          <Accordion
            defaultOpen={[first.id]}
            items={faq.map((entry) => ({
              id: entry.id,
              title: entry.question,
              content: (
                <>
                  <p>{entry.answer}</p>
                  {entry.more && (
                    <p>
                      <Link href={entry.more.href} className="link">
                        {entry.more.label}
                      </Link>
                    </p>
                  )}
                </>
              ),
            }))}
          />
        </div>
      </Fade>

      <EarlyAccessSection />
    </>
  );
}
