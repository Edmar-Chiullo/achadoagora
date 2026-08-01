import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getPublicSitemapData } from "@/lib/data/public";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { categories, products } = await getPublicSitemapData();

  const base = siteConfig.url.replace(/\/$/, "");

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${base}/categoria/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/produto/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/buscar`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...categoryEntries,
    ...productEntries,
  ];
}
