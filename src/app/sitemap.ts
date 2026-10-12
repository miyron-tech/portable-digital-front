import type { MetadataRoute } from 'next';
import { getSitemapEntries } from '@/lib/api';
import { SITE_URL } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getSitemapEntries().catch(() => []);
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/services`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.5 },
    ...services.map((service) => ({
      url: `${SITE_URL}/services/${service.slug}`,
      lastModified: service.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
