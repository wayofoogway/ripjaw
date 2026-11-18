import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/ui/section";
import { site } from "@/config/site";

const copy = {
  title: "Page not found",
  body: "The link is broken or the page has moved.",
  home: "Back to the home page",
};

export const metadata: Metadata = {
  title: { absolute: `Page not found — ${site.seo.titleSuffix}` },
  description: "This page does not exist. Head back to the Ripjaw home page.",
};

export default function NotFound() {
  return (
    <PageIntro title={copy.title} lede={copy.body}>
      <p className="mt-6">
        <Link href="/" className="link">
          {copy.home}
        </Link>
      </p>
    </PageIntro>
  );
}
