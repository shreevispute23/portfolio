/**
 * Personal details and site-wide settings. Everything here comes from Prajwal's resume
 * (Prajwal_V.Resume.docx, Aug 2026) or his direct answers. Edit freely.
 */
export const site = {
  name: 'Prajwal Vispute',
  fullName: 'Prajwal Ravindra Vispute',
  /** Short title used in page titles, the footer and structured data. */
  title: 'Creative & Digital Marketing Professional',
  /** The full positioning line, shown in the hero in two tones. */
  positioning: {
    lead: 'Creative & digital marketing professional',
    tone: 'with UI design and AI-assisted production skills.',
  },
  location: 'Pune, Maharashtra, India',
  shortLocation: 'Pune, India',

  email: 'shreevispute23@gmail.com',
  linkedin: 'https://www.linkedin.com/in/prajwal-vispute-41ab5633b',
  linkedinLabel: 'linkedin.com/in/prajwal-vispute-41ab5633b',

  /** The phone number is on the resume but hidden on the site. Set showPhone to true to display it. */
  phone: '+91 77095 27122',
  phoneHref: 'tel:+917709527122',
  showPhone: false,

  /**
   * Placeholders mark information that has not been provided yet (missing media, project details).
   * Keep this on while filling in content. Set it to false before publishing to hide every
   * placeholder and any project marked status: 'coming-soon'.
   */
  showPlaceholders: true,

  description:
    'Portfolio of Prajwal Vispute, a creative and digital marketing professional in Pune with UI design and AI-assisted production skills. Brochures, campaigns, social content, websites and product videos for FotoOwl and Technotreon.',

  hero: {
    intro:
      'I create engaging visual designs, digital experiences, marketing creatives and video content. I work across graphic design, UI design, digital marketing, social media, SEO and AI-assisted creative production.',
    current:
      'Currently Graphics and UI Intern at FotoOwl, contributing to visual communication and user interface experiences.',
  },
} as const;
