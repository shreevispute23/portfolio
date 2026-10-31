import type { Discipline, Tool } from './taxonomy';

/**
 * Skills grouped by discipline. Skills come from the resume and the work shown on the site;
 * tools only from the confirmed list in taxonomy.ts.
 */
export interface SkillGroup {
  discipline: Discipline;
  summary: string;
  skills: string[];
  tools: Tool[];
}

export const skillGroups: SkillGroup[] = [
  {
    discipline: 'Graphic Design',
    summary: 'Print and digital collateral built on a clear message and a consistent system.',
    skills: [
      'Brochures and sales collateral',
      'Expo backdrops and event branding',
      'Social posts and carousels',
      'Ad creatives in feed and story formats',
      'Email and campaign graphics',
      'Brand applications',
    ],
    tools: ['Adobe Illustrator', 'Adobe Photoshop', 'Canva'],
  },
  {
    discipline: 'UI Design',
    summary: 'Landing pages and website improvements shaped by audits and content structure.',
    skills: [
      'Landing page design',
      'Website content structure',
      'UX recommendations from website audits',
      'Responsive layouts',
    ],
    tools: ['Cursor', 'Kiro', 'Claude'],
  },
  {
    discipline: 'Video Editing',
    summary: 'Short product videos edited for the platform they will play on.',
    skills: [
      'Customer testimonial edits',
      'Product tutorials',
      'Captions and B-roll',
      'Landscape and vertical versions',
    ],
    tools: ['HyperFrames', 'Remotion', 'Kiro'],
  },
  {
    discipline: 'AI Creative Production',
    summary: 'Using AI to explore ideas and produce images, video and copy faster.',
    skills: ['AI image generation', 'AI video generation', 'Prompt engineering', 'AI copywriting'],
    tools: ['Midjourney', 'Adobe Firefly', 'Grok', 'ChatGPT', 'Claude'],
  },
  {
    discipline: 'Digital Marketing',
    summary: 'Campaigns, content and reporting across social, search and email.',
    skills: [
      'Social media management',
      'Meta Ads',
      'SEO and website audits',
      'Content and campaign strategy',
      'Community engagement',
      'Email marketing',
      'Performance reporting',
      'Market and competitor research',
      'Lead generation',
    ],
    tools: ['Meta Business Suite', 'Google Analytics', 'Mailchimp', 'GMass'],
  },
];
