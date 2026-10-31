/**
 * Builds links that work when the site is served from a sub-folder
 * (e.g. GitHub Pages: /Prajwal-Vispute-Portfolio/).
 */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Link to a page: href('/work/my-project') -> /Prajwal-Vispute-Portfolio/work/my-project/ */
export function href(path = '/'): string {
  const [pathname = '/', hash] = path.split('#');
  let clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (!clean.endsWith('/')) clean += '/';
  return `${BASE}${clean}${hash ? `#${hash}` : ''}`;
}

/** Link to a file in public/: asset('/media/video/a.mp4') */
export function asset(path: string): string {
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Address of a project's case study. */
export function workHref(slug: string): string {
  return href(`/work/${slug}/`);
}
