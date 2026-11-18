import { existsSync } from "node:fs";
import { join } from "node:path";
import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export const dynamic = "force-static";

/** A route is listed once its page exists, so the sitemap never points at a page that is not built. */
function isBuilt(path: string): boolean {
  return existsSync(join(process.cwd(), "src/app", path, "page.tsx"));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return site.routes
    .filter((route) => isBuilt(route.path))
    .map((route) => ({ url: new URL(route.path, site.url).toString() }));
}
