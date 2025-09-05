import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://trackflow.app';
  const currentDate = new Date();

  // Main marketing pages
  const marketingPages = [
    '',
    '/features',
    '/pricing',
    '/about',
    '/contact',
    '/templates',
    '/integrations',
    '/careers',
    '/gdpr',
    '/security',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
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
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  }));

  // Dashboard pages (public-facing info)
  const dashboardPages = [
    '/dashboard',
    '/timer',
    '/clients',
    '/projects',
    '/reports',
    '/settings',
    '/insights',
    '/onboarding',
    '/import',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Blog posts 
  const blogPosts = [
    '/blog/10-time-tracking-tips-for-freelancers',
    '/blog/how-to-price-your-services',
    '/blog/state-of-digital-marketing-rates-2024',
    '/blog/5-ways-to-automate-agency-workflow',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    ...marketingPages,
    ...legalPages,
    ...authPages,
    ...dashboardPages,
    ...blogPosts,
  ];
}


