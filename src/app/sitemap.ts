import type { MetadataRoute } from "next";
import { getSessions } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://gjc.alathurpadidars.in";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/schedule`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/speakers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/live`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  const sessions = await getSessions();

  const sessionPages: MetadataRoute.Sitemap = sessions.map((session) => ({
    url: `${baseUrl}/sessions/${session.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...sessionPages];
}
