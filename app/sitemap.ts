import type { MetadataRoute } from "next"
import { config } from "@/lib/config"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: config.appUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    // Add more routes as needed
  ]
}

