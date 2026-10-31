#!/usr/bin/env node
/**
 * Rebuilds every project cover from the images listed below (run: npm run covers).
 * Each cover arranges real project images side by side on a neutral background.
 * To change a cover, edit its list and run the script again.
 */
import { spawnSync } from 'node:child_process';

const covers = {
  'fotoowl-digital-brochure': ['brochure-01.jpg', 'brochure-02.jpg', 'brochure-06.jpg'],
  'fotoowl-expo-backdrop': ['backdrop.jpg'],
  'fotoowl-videos': [
    'fotoowl-testimonial-gallery-poster.jpg',
    'fotoowl-tutorial-create-event-vertical-poster.jpg',
    'fotoowl-testimonial-three-years-poster.jpg',
  ],
  'fotoowl-whatsapp-creatives': ['navratri.jpg'],
  'fotoowl-meta-ads': ['meta-ad-01.jpg', 'meta-ad-02.jpg', 'meta-ad-03.jpg'],
  'fotoowl-website-ui': ['ai-culling-hero.jpg'],
  'fotoowl-instagram': { images: ['carousel-01.jpg', 'post-02.jpg', 'carousel-06.jpg'], padding: 120 },
  'fotoowl-referral-campaign': ['referral-hero.jpg'],
  'technotreon-patent-carousel': { images: ['slide-01.jpg', 'slide-04.jpg', 'slide-06.jpg'], padding: 120 },
  'technotreon-anti-skid-carousel': { images: ['slide-01.jpg', 'slide-02.jpg', 'slide-04.jpg'], padding: 120 },
  'technotreon-website-recommendations': ['careers-01.jpg', 'careers-03.jpg', 'patent-services-03.jpg'],
  'technotreon-brand-applications': ['whatsapp-01.jpg'],
  'technotreon-startup-landing-page': ['desktop-hero.jpg', 'mobile-01.jpg'],
};

const only = process.argv.slice(2);
let failed = 0;
for (const [slug, spec] of Object.entries(covers)) {
  if (only.length && !only.includes(slug)) continue;
  const { images, padding } = Array.isArray(spec) ? { images: spec, padding: undefined } : spec;
  const base = `src/content/work/${slug}`;
  const args = ['scripts/compose-cover.mjs', '--out', `${base}/cover.jpg`];
  if (padding) args.push('--padding', String(padding));
  args.push(...images.map((file) => `${base}/images/${file}`));
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
  if (result.status === 0) process.stdout.write(result.stdout);
  else {
    failed++;
    console.error(`${slug}: ${result.stderr.trim()}`);
  }
}
if (failed) process.exit(1);
