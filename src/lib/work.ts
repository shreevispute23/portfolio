import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from '../data/site';

export type Work = CollectionEntry<'work'>;

/** Projects visible on the site, in display order. */
export async function getWork(): Promise<Work[]> {
  const all = await getCollection('work', ({ data }) => {
    if (data.draft) return false;
    if (!site.showPlaceholders && data.status === 'coming-soon') return false;
    return true;
  });
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getFeatured(): Promise<Work[]> {
  const all = await getWork();
  return all
    .filter((w) => w.data.featured)
    .sort((a, b) => (a.data.featuredOrder ?? a.data.order) - (b.data.featuredOrder ?? b.data.order));
}

export function disciplinesOf(work: Work): string[] {
  return [...new Set([work.data.discipline, ...work.data.disciplines])];
}

/** Two-digit index used in lists: 01, 02 ... */
export function indexLabel(n: number): string {
  return String(n).padStart(2, '0');
}

export function hasVideo(work: Work): boolean {
  return work.data.gallery.some((s) => s.items.some((i) => i.type === 'video'));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
