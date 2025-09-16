import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/timer/',
          '/clients/',
          '/projects/',
          '/reports/',
          '/settings/',
          '/insights/',
          '/onboarding/',
          '/import/',
          '/api/',
          '/dev/',
          '/_next/',
          '/admin/',
          '/private/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
    ],
    sitemap: `https://track-flow.app/sitemap.xml`,
  };
}


