import { Briefcase, FolderGit2, Layers, type LucideIcon } from 'lucide-react';

/** Canonical origin; override per environment with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://saniuzzaman.dev').replace(
  /\/$/,
  ''
);
export const SITE_NAME = 'Saniuzzaman Robin Portfolio';

/** Static social preview image in /public (real pixel size). */
export const OG_IMAGE = { url: '/og_image.png', width: 1729, height: 910 } as const;

const GA_ID_PATTERN = /^G-[A-Z0-9]+$/;
const rawGaId = process.env.NEXT_PUBLIC_GA_ID ?? 'G-DD0B9SX4B6';

/**
 * Google Analytics 4 measurement ID; set NEXT_PUBLIC_GA_ID to override or '' to disable.
 * Validated because it is interpolated into an inline script.
 */
export const GA_MEASUREMENT_ID = GA_ID_PATTERN.test(rawGaId) ? rawGaId : '';

export const RESUME_PDF_PATH = '/CV_SANIUZZAMAN_ROBIN.pdf';

/** Labels live in the locale messages under `nav.<id>`. */
export type NavLink = {
  id: 'overview' | 'experience' | 'platforms';
  href: string;
  icon: LucideIcon;
};

export const NAV_LINKS: NavLink[] = [
  { id: 'overview', href: '/', icon: Layers },
  { id: 'experience', href: '/resume', icon: Briefcase },
  { id: 'platforms', href: '/projects', icon: FolderGit2 },
];

export function isActivePath(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}
