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

  // Blog posts - only include existing pages
  const blogPosts: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: 'weekly';
    priority: number;
  }> = [
    // Add blog posts here when they exist
    // '/blog/10-time-tracking-tips-for-freelancers',
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


