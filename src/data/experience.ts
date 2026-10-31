/**
 * Experience, education and certifications.
 * Technotreon, Insplore Consultants and Your Growth Partner points are taken from the resume.
 * FotoOwl points come from Prajwal's project brief; title and dates from his confirmation.
 */
export interface Role {
  company: string;
  role: string;
  start: string;
  end: string;
  location?: string;
  points: string[];
}
// Related case studies are matched automatically: every project whose `company` equals the role's
// `company` is listed under that role.

export const experience: Role[] = [
  {
    company: 'FotoOwl',
    role: 'Graphics and UI Intern',
    start: 'Sep 2026',
    end: 'Dec 2026',
    points: [
      'Designed a product digital brochure that communicates FotoOwl’s features and benefits.',
      'Designed event backdrops and branding materials for exhibitions and expos.',
      'Edited customer testimonial videos for social media and YouTube tutorial videos for product education.',
      'Created WhatsApp campaign creatives, Meta Ads creatives, Instagram posts and referral-campaign graphics.',
      'Produced AI-generated video through creative prompting and prompt engineering.',
      'Worked on website UI design and interface improvements.',
    ],
  },
  {
    company: 'Technotreon',
    role: 'Marketing & Growth Associate',
    start: 'Jun 2026',
    end: 'Aug 2026',
    points: [
      'Manage digital marketing across 5+ social media platforms: LinkedIn, Instagram, Facebook, YouTube and Reddit, to grow brand visibility and reach.',
      'Set up and optimise Meta Ads campaigns via Meta Business Suite to improve targeting and ad performance.',
      'Conduct website audits and recommend 15+ SEO and UX improvements to boost organic visibility.',
      'Develop content strategies, captions and posting schedules aligned with brand voice and goals.',
      'Track campaign performance and engagement metrics, preparing reports to guide marketing decisions.',
      'Conduct competitor and industry research to inform strategy and identify growth opportunities.',
      'Collaborate with design and management teams on branding and promotional campaigns.',
      'Support startup outreach, business promotion and lead generation initiatives.',
    ],
  },
  {
    company: 'Insplore Consultants',
    role: 'Marketing and HR Intern',
    start: 'Jun 2025',
    end: 'Aug 2025',
    points: [
      'Developed client-facing presentations and videos highlighting investment options.',
      'Promoted Bank of Baroda’s ‘Maha Jeevan Plus’ plan and conducted market projections for campaign strategy.',
      'Analysed financial news, gold rates and investment trends to inform marketing strategy.',
      'Built financial marketing and communication skills through cross-functional collaboration.',
    ],
  },
  {
    company: 'Your Growth Partner',
    role: 'Digital Marketing Intern',
    start: 'Jan 2025',
    end: 'May 2025',
    location: 'Pune',
    points: [
      'Conducted primary research with 100+ respondents on influencer credibility and brand engagement.',
      'Analysed live influencer campaigns and designed data-driven reports on purchase drivers.',
      'Proposed strategies to optimise influencer selection and ROI-driven campaign planning.',
    ],
  },
];

export const education = [
  {
    degree: 'MBA, Marketing Management',
    school: 'Dr. D. Y. Patil Institute of Management & Research, Pune',
    years: '2024 – 2026',
  },
  {
    degree: 'BBA, Human Resource Management',
    school: 'Z. B. Patil Senior College, Dhule',
    years: '2021 – 2024',
  },
];

export const research = {
  title: 'The Role of Social Media Marketing in the BFSI Sector',
  points: [
    'Surveyed 100+ respondents on how social media shapes trust and brand perception in banking, financial services and insurance.',
    'Found Instagram to be the most preferred platform driving customer interest in financial products.',
  ],
};

export const certifications = [
  'HubSpot Digital Marketing Certification',
  'AI in Marketing, NPTEL',
  'Digital Marketing & Branding',
  'Customer Relationship Management',
  'Government of Maharashtra Elementary & Intermediate Grade Drawing Examinations',
];
