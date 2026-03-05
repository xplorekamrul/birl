import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

/**
 * Dynamic sitemap generated from all ACTIVE + PUBLIC products.
 * Uses per-product SEO settings (priorityScore, changeFrequency, includeSitemap)
 * when available, otherwise applies sensible defaults.
 *
 * Accessible at: /sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
   const products = await prisma.product.findMany({
      where: {
         status: "ACTIVE",
         visibility: "PUBLIC",
      },
      select: {
         slug: true,
         updatedAt: true,
         seo: {
            select: {
               includeSitemap: true,
               priorityScore: true,
               changeFrequency: true,
               canonicalUrl: true,
               redirectUrl: true,
            },
         },
      },
      orderBy: { updatedAt: "desc" },
   });

   const productEntries: MetadataRoute.Sitemap = products
      // Exclude products the vendor has opted out of the sitemap
      .filter((p) => p.seo?.includeSitemap !== false)
      // Exclude products that have a redirect configured
      .filter((p) => !p.seo?.redirectUrl)
      .map((p) => ({
         url: p.seo?.canonicalUrl?.trim() || `${SITE_URL}/${p.slug}`,
         lastModified: p.updatedAt,
         changeFrequency: (p.seo?.changeFrequency ?? "weekly") as MetadataRoute.Sitemap[0]["changeFrequency"],
         priority: p.seo?.priorityScore ?? 0.7,
      }));

   // Static pages
   const staticPages: MetadataRoute.Sitemap = [
      { url: SITE_URL, changeFrequency: "daily", priority: 1.0 },
      { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
      { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
   ];

   return [...staticPages, ...productEntries];
}
