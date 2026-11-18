import "server-only";
import type { Metadata } from "next";
import { getRoute, site } from "@/config/site";

/**
 * Metadata for a route listed in `site.routes`: unique title and description,
 * canonical URL, and Open Graph / X cards. Use it from every page:
 *
 *   export const metadata = routeMetadata("/features/");
 */
export function routeMetadata(path: string): Metadata {
  const route = getRoute(path);
  const url = new URL(path, site.url).toString();
  const image = {
    url: site.seo.ogImage.path,
    width: site.seo.ogImage.width,
    height: site.seo.ogImage.height,
    alt: site.seo.ogImageAlt,
  };
  return {
    title: { absolute: route.title },
    description: route.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: site.name,
      url,
      title: route.title,
      description: route.description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      site: site.links.xHandle,
      title: route.title,
      description: route.description,
      images: [image],
    },
  };
}

/** SoftwareApplication structured data for the home page. No price, ratings or reviews: none are published. */
export function softwareApplicationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: site.name,
    description: site.productLine,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Telegram",
    url: site.url,
    sameAs: [site.links.x],
  };
}

/** FAQPage structured data for /faq/. Pass exactly the questions and answers the page shows. */
export function faqPageJsonLd(entries: { question: string; answer: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}
