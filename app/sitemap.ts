import type { MetadataRoute } from "next";
import contentManifest from "@/content/manifest.json";
import { SITE_LAST_MODIFIED, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const contentModified = new Date(contentManifest.synced_at);
  return [
    {
      url: SITE_URL,
      lastModified: new Date(SITE_LAST_MODIFIED),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/methodology`,
      lastModified: contentModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/paper`,
      lastModified: contentModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/pilot`,
      lastModified: contentModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/data`,
      lastModified: new Date(SITE_LAST_MODIFIED),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];
}
