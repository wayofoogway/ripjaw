import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export const dynamic = "force-static";

/** Every configured route. The build guard fails when one of them has no page. */
export default function sitemap(): MetadataRoute.Sitemap {
  return site.routes.map((route) => ({ url: new URL(route.path, site.url).toString() }));
}
