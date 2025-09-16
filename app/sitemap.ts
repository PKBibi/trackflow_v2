import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://track-flow.app';
  const currentDate = new Date();

  // Main marketing pages
  const marketingPages = [
    '',
    '/features',
    '/pricing',
    '/pricing/simple',
    '/about',
    '/contact',
    '/templates',
    '/integrations',
    '/careers',
    '/gdpr',
    '/security',
    '/docs',
    '/docs/api',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // SEO-optimized content pages
  const seoPages = [
    '/use-cases',
    '/use-cases/marketing-agencies',
    '/use-cases/ppc-agencies',
    '/use-cases/seo-agencies',
    '/alternatives',
    '/alternatives/harvest',
    '/alternatives/toggl',
    '/alternatives/time-doctor',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Legal/compliance pages
  const legalPages = [
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }));

  // Auth pages
  const authPages = [
    '/login',
    '/signup',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: route === '/signup' ? 0.7 : 0.5,
  }));

  return [
    ...marketingPages,
    ...seoPages,
    ...legalPages,
    ...authPages,
  ];
}


