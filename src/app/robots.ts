import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/register/grand-assembly"], // Private pages
      },
    ],
    sitemap: "https://gjc.alathurpadidars.in/sitemap.xml",
  };
}
