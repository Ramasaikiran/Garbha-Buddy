import type { MetadataRoute } from 'next';

const SITE_URL = 'https://garbabuddy.lol';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/browse',
    '/companion/register',
    '/login',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/refund-policy',
  ];
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}
