import { randomBytes } from 'crypto';

// e.g. "priya-ahmedabad-x7k2"
export function generateCompanionSlug(name: string, city: string): string {
  const base = `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const suffix = randomBytes(3).toString('hex'); // collision guard
  return `${base}-${suffix}`;
}
