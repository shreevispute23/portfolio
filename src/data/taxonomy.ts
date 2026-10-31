/**
 * The five disciplines used for skills, project categories and the work filters.
 * Add a new discipline here and it becomes available everywhere.
 */
export const DISCIPLINES = [
  'Graphic Design',
  'UI Design',
  'Video Editing',
  'AI Creative Production',
  'Digital Marketing',
] as const;
export type Discipline = (typeof DISCIPLINES)[number];

/**
 * Tools Prajwal has confirmed using (resume + direct confirmation).
 * A project can only list tools from this list, so nothing unconfirmed slips in.
 * To add a tool: add it here first, then use it in a project file.
 */
export const TOOLS = [
  'Adobe Illustrator',
  'Adobe Photoshop',
  'Canva',
  'Midjourney',
  'Adobe Firefly',
  'ChatGPT',
  'Claude',
  'Grok',
  'Kiro',
  'Cursor',
  'HyperFrames',
  'Remotion',
  'Meta Business Suite',
  'Google Analytics',
  'Mailchimp',
  'GMass',
] as const;
export type Tool = (typeof TOOLS)[number];

/** Companies a project can belong to, with the label shown on its case study. */
export const COMPANIES = {
  FotoOwl: {
    label: 'Created during my internship at FotoOwl',
    role: 'Graphics and UI Intern',
    period: 'Sep – Dec 2026',
  },
  Technotreon: {
    label: 'Created during my role at Technotreon',
    role: 'Marketing & Growth Associate',
    period: 'Jun – Aug 2026',
  },
  'Insplore Consultants': {
    label: 'Created during my internship at Insplore Consultants',
    role: 'Marketing and HR Intern',
    period: 'Jun – Aug 2025',
  },
  'Your Growth Partner': {
    label: 'Created during my internship at Your Growth Partner',
    role: 'Digital Marketing Intern',
    period: 'Jan – May 2025',
  },
  Personal: {
    label: 'Personal project',
    role: 'Designer',
    period: '',
  },
} as const;
export type Company = keyof typeof COMPANIES;
export const COMPANY_NAMES = Object.keys(COMPANIES) as [Company, ...Company[]];
