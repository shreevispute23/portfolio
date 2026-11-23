import type { ImageMetadata } from 'astro';
import logoTreatment from '../content/work/technotreon-brand-applications/images/logo-treatment.jpg';
import testimonialPoster from '../content/work/fotoowl-videos/images/fotoowl-testimonial-gallery-poster.jpg';
import tutorialPoster from '../content/work/fotoowl-videos/images/fotoowl-tutorial-create-event-landscape-poster.jpg';
import type { Tool } from './taxonomy';

/**
 * The three discipline chapters on the home page. Each row links to a case study.
 * Communicates / Channel / My part come from the project's own file unless a row overrides them.
 * To add a row: add an entry with the project's folder name.
 */
export interface ChapterRow {
  /** Folder name in src/content/work/. */
  project: string;
  title?: string;
  /** Jump to a section of the case study, e.g. 'customer-testimonials'. */
  anchor?: string;
  /** Image shown in the preview panel. Defaults to the project cover. */
  preview?: ImageMetadata;
  communicates?: string;
  channel?: string;
  role?: string;
}

export interface Chapter {
  id: 'design' | 'marketing' | 'video';
  number: string;
  label: string;
  title: string;
  tone: string;
  intro: string;
  rows: ChapterRow[];
  /** Scope facts taken from the resume. Not results. */
  facts?: { value: string; label: string; where: string }[];
  toolGroups?: { label: string; tools: Tool[] }[];
}

export const chapters: Chapter[] = [
  {
    id: 'design',
    number: '1.0',
    label: 'Design & branding',
    title: 'Design & branding',
    tone: 'for print, screens and stands.',
    intro:
      'Brochures, expo backdrops, website screens and brand applications for FotoOwl and Technotreon. Each piece starts with what it has to explain, then gets a layout system that holds across every page and format.',
    rows: [
      { project: 'fotoowl-digital-brochure' },
      { project: 'fotoowl-expo-backdrop' },
      { project: 'fotoowl-website-ui' },
      { project: 'technotreon-startup-landing-page' },
      { project: 'technotreon-brand-applications' },
    ],
    toolGroups: [{ label: 'Design tools', tools: ['Adobe Illustrator', 'Adobe Photoshop', 'Canva'] }],
  },
  {
    id: 'marketing',
    number: '2.0',
    label: 'Marketing & campaigns',
    title: 'Marketing & campaigns',
    tone: 'where each design has a job to do.',
    intro:
      'Meta ads, WhatsApp offers, Instagram content, email campaigns and website improvements. For each one: what it had to communicate, the channel it supported and my part in it.',
    rows: [
      { project: 'fotoowl-meta-ads' },
      { project: 'fotoowl-whatsapp-creatives' },
      { project: 'fotoowl-instagram' },
      { project: 'fotoowl-referral-campaign' },
      { project: 'technotreon-patent-carousel' },
      { project: 'technotreon-anti-skid-carousel' },
      { project: 'technotreon-website-recommendations' },
    ],
    facts: [
      { value: '5+', label: 'social platforms managed: LinkedIn, Instagram, Facebook, YouTube and Reddit', where: 'Technotreon' },
      { value: '15+', label: 'SEO and UX improvements recommended from website audits', where: 'Technotreon' },
      { value: '100+', label: 'respondents in primary research on influencer credibility', where: 'Your Growth Partner' },
    ],
    toolGroups: [
      { label: 'Marketing tools', tools: ['Meta Business Suite', 'Google Analytics', 'Mailchimp', 'GMass'] },
    ],
  },
  {
    id: 'video',
    number: '3.0',
    label: 'Video & AI production',
    title: 'Video & AI production',
    tone: 'from screen recording to finished cut.',
    intro:
      'Customer testimonials for social media, product tutorials for YouTube and AI-generated visuals. I build videos as code with HyperFrames and Remotion, work with AI assistants such as Kiro and Cursor, and generate images and video through prompting.',
    rows: [
      {
        project: 'fotoowl-videos',
        title: 'Customer testimonial videos',
        anchor: 'customer-testimonials',
        preview: testimonialPoster,
        communicates: 'Real photographers explaining, in their own words, why they use FotoOwl.',
        channel: 'Social media (9:16)',
        role: 'Edited three testimonials with English captions, product B-roll and picture-in-picture cards.',
      },
      {
        project: 'fotoowl-videos',
        title: 'Product tutorials for YouTube',
        anchor: 'tutorial-create-an-event',
        preview: tutorialPoster,
        communicates: 'How to create an event, publish a gallery and share it with links, PINs and QR codes.',
        channel: 'YouTube (16:9), plus 9:16 versions',
        role: 'Produced three narrated tutorials from screen recordings, each in two formats.',
      },
      { project: 'fotoowl-ai-video' },
      {
        project: 'technotreon-brand-applications',
        title: 'AI-generated brand visual',
        anchor: 'banner-and-logo-treatment',
        preview: logoTreatment,
        communicates: 'The Technotreon logo, restyled as a glowing sign for brand assets.',
        channel: 'Brand assets',
        role: 'Created the logo treatment with an AI image model (OpenAI, per the file’s content credentials).',
      },
    ],
    toolGroups: [
      { label: 'Video', tools: ['HyperFrames', 'Remotion'] },
      { label: 'AI assistants', tools: ['Kiro', 'Cursor', 'Claude', 'ChatGPT'] },
      { label: 'AI image & video', tools: ['Midjourney', 'Adobe Firefly', 'Grok'] },
    ],
  },
];
