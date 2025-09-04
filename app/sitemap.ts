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
    '/blog',
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
    '/cookie-policy',
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
    '/forgot-password',
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
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Blog posts (in production, fetch from CMS/database)
  const blogPosts = [
    '/blog/time-tracking-for-marketers',
    '/blog/managing-retainer-clients',
    '/blog/agency-productivity-tips',
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


