import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { COMPANY_NAMES, DISCIPLINES, TOOLS } from './data/taxonomy';

/**
 * One folder per project:  src/content/work/<project-slug>/index.md
 * Images live next to it:   src/content/work/<project-slug>/images/...
 * The folder name becomes the page address: /work/<project-slug>/
 */
const work = defineCollection({
  loader: glob({
    base: './src/content/work',
    pattern: '*/index.md',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) => {
    const imageItem = z.object({
      type: z.literal('image'),
      src: image(),
      alt: z.string().min(1),
      caption: z.string().optional(),
      /** 'browser' or 'phone' draws a device frame; 'none' shows the image plainly. */
      frame: z.enum(['none', 'browser', 'phone']).default('none'),
      /** Let one item take a full row of its gallery. */
      span: z.enum(['auto', 'full']).default('auto'),
      /** For very tall screenshots: show them in a fixed-height frame you can scroll inside. */
      scroll: z.boolean().default(false),
    });

    const videoItem = z.object({
      type: z.literal('video'),
      /** File name inside public/media/video/ */
      src: z.string().regex(/^[a-z0-9-]+\.mp4$/, 'Use the file name only, e.g. my-video.mp4'),
      poster: image(),
      title: z.string(),
      orientation: z.enum(['landscape', 'portrait']),
      /** Shown on the player, e.g. "0:34". */
      duration: z.string(),
      caption: z.string().optional(),
    });

    const placeholderItem = z.object({
      type: z.literal('placeholder'),
      label: z.string(),
      note: z.string().optional(),
      shape: z.enum(['landscape', 'portrait', 'square', 'wide']).default('landscape'),
    });

    const gallerySection = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      layout: z.enum(['grid-2', 'grid-3', 'grid-4', 'stack', 'pairs']).default('grid-3'),
      items: z.array(z.discriminatedUnion('type', [imageItem, videoItem, placeholderItem])).min(1),
    });

    return z.object({
      title: z.string(),
      /** Short name used in lists, e.g. "Digital Brochure". */
      shortTitle: z.string().optional(),
      company: z.enum(COMPANY_NAMES),
      discipline: z.enum(DISCIPLINES),
      disciplines: z.array(z.enum(DISCIPLINES)).default([]),
      /** One sentence for cards, search results and social previews. */
      summary: z.string(),
      year: z.string().default('2026'),
      /** Lower numbers come first. */
      order: z.number(),
      featured: z.boolean().default(false),
      featuredOrder: z.number().optional(),
      /** 'coming-soon' shows the project with a clear "media coming soon" state. */
      status: z.enum(['complete', 'in-progress', 'coming-soon']).default('complete'),
      /** Set to true to keep a project out of the site entirely. */
      draft: z.boolean().default(false),

      cover: image().optional(),
      coverAlt: z.string().optional(),

      overview: z.string().optional(),
      objective: z.string().optional(),
      /** Marketing purpose: who it was for, what it had to say, and where it ran. */
      audience: z.string().optional(),
      communicates: z.string().optional(),
      channels: z.array(z.string()).default([]),
      /** My contribution. */
      role: z.string().optional(),
      /** Short muted clip in public/media/preview/ that plays when the card is hovered. */
      previewVideo: z
        .string()
        .regex(/^[a-z0-9-]+\.mp4$/, 'Use the file name only, e.g. my-preview.mp4')
        .optional(),
      process: z.array(z.string()).default([]),
      tools: z.array(z.enum(TOOLS)).default([]),
      deliverables: z.array(z.string()).default([]),
      /** Things still missing. Shown as a clearly marked placeholder on the case study. */
      todo: z.array(z.string()).default([]),
      links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
      gallery: z.array(gallerySection).default([]),
    });
  },
});

export const collections = { work };
