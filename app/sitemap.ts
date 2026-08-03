import type { MetadataRoute } from "next";

import { SITE } from "./lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: SITE.labUrl,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
