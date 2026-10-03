import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const SITE_URL = 'https://garbabuddy.lol';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const staticEntries: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  let companionEntries: MetadataRoute.Sitemap = [];
  try {
    const result = await db.query(
      `SELECT cm.slug, cm.created_at
       FROM companions_meta cm
       JOIN users u ON u.id = cm.id
       WHERE u.is_verified = TRUE`
    );
    companionEntries = result.rows.map((row) => ({
      url: `${SITE_URL}/book/${row.slug}`,
      lastModified: row.created_at ? new Date(row.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (err) {
    console.error('sitemap: failed to load companion profiles', err);
  }

  return [...staticEntries, ...companionEntries];
}
