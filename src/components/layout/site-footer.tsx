import Link from "next/link";
import { site } from "@/config/site";

const LINK =
  "inline-flex min-h-11 min-w-11 items-center text-base text-rj-dim underline-offset-4 transition-[color] duration-200 hover:text-rj-text hover:underline";

/** The site's only navigation: page links, the official X account, and the short notices. */
export function SiteFooter() {
  const pages = site.routes.filter((route) => route.footer !== "none");
  const { contact, communityChannel } = site.support;
  const external = [
    { label: `X ${site.links.xHandle}`, href: site.links.x },
    ...(communityChannel.confirmed ? [communityChannel.value] : []),
    ...(contact.confirmed ? [contact.value] : []),
  ];
  const owner = site.legal.entityName.confirmed ? site.legal.entityName.value : site.name;

  return (
    <footer className="border-t border-rj-line">
      <div className="container-rj py-12 lg:py-16">
        <nav aria-label="Pages">
          <ul className="flex flex-wrap gap-x-8 gap-y-1">
            {pages.map((route) => (
              <li key={route.path}>
                <Link href={route.path} className={LINK}>
                  {route.label}
                </Link>
              </li>
            ))}
            {external.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 max-w-[46rem] space-y-3 text-sm leading-relaxed text-rj-caption">
          <p>{site.legal.antiImpersonation}</p>
          <p>{site.legal.shortDisclaimer}</p>
          <p>{site.legal.nonAffiliation}</p>
          <p>
            © {new Date().getFullYear()} {owner}
          </p>
        </div>
      </div>
    </footer>
  );
}
