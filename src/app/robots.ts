import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/src/lib/seo-config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/mrsaqib',
          '/saqib',
          '/242',
          '/tiktok/*',
          '/bomber/*',
          '/db/*',
          '/image/*',
          '/cb/*',
        ],
        disallow: [
          '/mradmin',
          '/mradmin/*',
          '/super-admin',
          '/super-admin/*',
          '/super-saqib-admin',
          '/admin/*',
          '/api/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/mradmin',
          '/mradmin/*',
          '/super-admin',
          '/super-saqib-admin',
          '/admin/*',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
