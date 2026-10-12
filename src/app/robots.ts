import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Личные и служебные страницы: в поиске им делать нечего. Это только
      // просьба к роботам — доступ закрывают proxy.ts и бэкенд.
      disallow: ['/admin', '/account', '/checkout', '/orders', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
