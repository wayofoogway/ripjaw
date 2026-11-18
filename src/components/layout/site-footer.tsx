import { ArrowUpRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { site } from "@/config/site";
import { TelegramCta } from "../ui/telegram-cta";
import { Lockup } from "./lockup";

const LINK = "inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] text-rj-dim transition-colors duration-200 hover:text-rj-text lg:min-h-9";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-eyebrow mb-3 text-rj-caption">{title}</h2>
      <ul>{children}</ul>
    </div>
  );
}

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
      {children}
      <ArrowUpRight aria-hidden="true" className="size-3.5 text-rj-muted" />
    </a>
  );
}

export function SiteFooter() {
  const product = site.routes.filter((r) => r.footer === "product");
  const legal = site.routes.filter((r) => r.footer === "legal");
  const { contact, communityChannel } = site.support;
  const owner = site.legal.entityName.confirmed ? site.legal.entityName.value : site.name;

  return (
    <footer id="site-footer" className="relative border-t border-rj-line bg-rj-bg">
      <div className="container-rj py-16 lg:py-20">
        <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" aria-label="Ripjaw home" className="inline-flex h-11 items-center rounded-lg">
              <Lockup className="h-8 w-auto" />
            </Link>
            <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-rj-dim">
              {site.productLine} {site.tagline}
            </p>
            <div className="mt-6">
              <TelegramCta label={site.cta.primary.label} location="footer" variant="secondary" />
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:col-span-7">
            <Column title="Product">
              {product.map((route) => (
                <li key={route.path}>
                  <Link href={route.path} className={LINK}>
                    {route.label}
                  </Link>
                </li>
              ))}
            </Column>
            <Column title="Official links">
              <li>
                <TelegramCta
                  label={site.links.telegramBotHandle}
                  location="footer-links"
                  variant="ghost"
                  className="min-h-11 text-[0.9375rem] font-normal text-rj-dim hover:text-rj-text hover:no-underline lg:min-h-9"
                />
              </li>
              <li>
                <External href={site.links.x}>X {site.links.xHandle}</External>
              </li>
              {communityChannel.confirmed && (
                <li>
                  <External href={communityChannel.value.href}>{communityChannel.value.label}</External>
                </li>
              )}
              {contact.confirmed && (
                <li>
                  <External href={contact.value.href}>{contact.value.label}</External>
                </li>
              )}
            </Column>
            <Column title="Legal">
              {legal.map((route) => (
                <li key={route.path}>
                  <Link href={route.path} className={LINK}>
                    {route.label}
                  </Link>
                </li>
              ))}
            </Column>
          </nav>
        </div>

        <div className="panel mt-14 flex items-start gap-4 p-5 sm:items-center">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-rj-warn/30 bg-rj-warn/10 text-rj-warn">
            <ShieldAlert aria-hidden="true" className="size-5" strokeWidth={1.75} />
          </span>
          <p className="text-[0.9375rem] leading-relaxed text-rj-text">
            <strong className="font-semibold">Watch for impersonators.</strong>{" "}
            <span className="text-rj-dim">{site.legal.antiImpersonation}</span>
          </p>
        </div>

        <p className="mt-10 max-w-4xl text-xs leading-relaxed text-rj-caption">{site.legal.shortDisclaimer}</p>

        <div className="mt-8 flex flex-col gap-2 border-t border-rj-line pt-6 text-xs leading-relaxed text-rj-caption lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {new Date().getFullYear()} {owner}. Not financial advice.
          </p>
          <p>{site.legal.nonAffiliation}</p>
        </div>
      </div>
    </footer>
  );
}
