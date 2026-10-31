import type { ImageMetadata } from 'astro';
import fotoowlOnDark from '../assets/logos/fotoowl-on-dark.png';
import insplore from '../assets/logos/insplore.png';
import technotreon from '../assets/logos/technotreon.png';
import ygp from '../assets/logos/ygp.png';
import type { Company } from './taxonomy';

/**
 * Official company logos, downloaded from each company's own website or official profile:
 *  - FotoOwl: fotoowl.ai (SVG for light backgrounds, PNG with white lettering for dark ones)
 *  - Technotreon: technotreon.in site header
 *  - Insplore Consultants: insploreconsultants.com
 *  - Your Growth Partner: the company's official Linktree (linktr.ee/ygpmarketing).
 *    This file has a white background, so it is always shown on a white tile.
 * Logos are trademarks of their owners and are used only to identify where the work was done.
 *
 * `scale` evens out the visual size of logos with very different proportions.
 */
export interface CompanyLogo {
  name: string;
  /** Logo for light surfaces: an imported image, or a file path in public/ for SVGs. */
  light: ImageMetadata | { src: string; width: number; height: number };
  /** Optional version for dark surfaces. Without one, the logo sits on a white tile. */
  dark?: ImageMetadata;
  scale: number;
  url?: string;
  urlLabel?: string;
}

export const companyLogos: Record<Exclude<Company, 'Personal'>, CompanyLogo> = {
  FotoOwl: {
    name: 'FotoOwl',
    light: { src: '/logos/fotoowl.svg', width: 1276, height: 252 },
    dark: fotoowlOnDark,
    scale: 1,
    url: 'https://fotoowl.ai',
    urlLabel: 'fotoowl.ai',
  },
  Technotreon: {
    name: 'Technotreon',
    light: technotreon,
    scale: 1.55,
    url: 'https://technotreon.in',
    urlLabel: 'technotreon.in',
  },
  'Insplore Consultants': {
    name: 'Insplore Consultants',
    light: insplore,
    scale: 1.05,
    url: 'https://insploreconsultants.com',
    urlLabel: 'insploreconsultants.com',
  },
  'Your Growth Partner': {
    name: 'Your Growth Partner',
    light: ygp,
    scale: 1.7,
  },
};

export function logoFor(company: string): CompanyLogo | undefined {
  return (companyLogos as Record<string, CompanyLogo>)[company];
}
