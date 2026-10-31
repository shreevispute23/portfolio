// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Where the site is published.
 * Default: the existing GitHub Pages address from the resume,
 * https://shreevispute23.github.io/Prajwal-Vispute-Portfolio/
 *
 * For a custom domain at the root (e.g. https://prajwalvispute.com), set
 * SITE_URL=https://prajwalvispute.com and SITE_BASE=/ when building.
 */
const SITE_URL = process.env.SITE_URL ?? 'https://shreevispute23.github.io';
const SITE_BASE = process.env.SITE_BASE ?? '/Prajwal-Vispute-Portfolio';

export default defineConfig({
  site: SITE_URL,
  base: SITE_BASE,
  trailingSlash: 'always',
  // Keep HTML-aware whitespace handling so spaces between inline elements are preserved.
  compressHTML: true,
  prefetch: { defaultStrategy: 'hover' },
  integrations: [sitemap()],
  image: {
    responsiveStyles: false,
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Schibsted Grotesk',
      cssVariable: '--font-sans',
      weights: ['400 900'],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'DM Mono',
      cssVariable: '--font-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
});
