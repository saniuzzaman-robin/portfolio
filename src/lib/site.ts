import { Briefcase, FolderGit2, Layers, Wrench, type LucideIcon } from 'lucide-react';

/** Canonical origin; override per environment with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://saniuzzaman.dev').replace(
  /\/$/,
  ''
);
export const SITE_NAME = 'Saniuzzaman Robin';

/** Static social preview image in /public (real pixel size). */
export const OG_IMAGE = { url: '/og_image.png', width: 1200, height: 630 } as const;

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/;
const rawGtmId = process.env.NEXT_PUBLIC_GTM_ID ?? 'GTM-K3B4TTTM';

/**
 * Google Tag Manager container ID (GA4 is configured inside the container); set
 * NEXT_PUBLIC_GTM_ID to override or '' to disable. Validated because it is interpolated into an
 * inline script.
 */
export const GTM_CONTAINER_ID = GTM_ID_PATTERN.test(rawGtmId) ? rawGtmId : '';

/**
 * True only for real production deployments. Vercel preview deployments (staging) also run with
 * NODE_ENV=production, so prefer VERCEL_ENV when it is available. Server-only: VERCEL_ENV isn't
 * exposed to the client bundle.
 */
export function isProductionDeploy(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === 'production';
  return process.env.NODE_ENV === 'production';
}

/** Whether to load GTM and ask for analytics consent (server-only, see `isProductionDeploy`). */
export function isAnalyticsEnabled(): boolean {
  return Boolean(GTM_CONTAINER_ID) && isProductionDeploy();
}

export const RESUME_PDF_PATH = '/CV_SANIUZZAMAN_ROBIN.pdf';

/** Labels live in the locale messages under `nav.<id>`. */
export type NavLink = {
  id: 'overview' | 'experience' | 'platforms' | 'tools';
  href: string;
  icon: LucideIcon;
  /** Page exists at the unprefixed (English) URL only. */
  englishOnly?: boolean;
};

export const NAV_LINKS: NavLink[] = [
  { id: 'overview', href: '/', icon: Layers },
  { id: 'experience', href: '/resume', icon: Briefcase },
  { id: 'platforms', href: '/projects', icon: FolderGit2 },
  { id: 'tools', href: '/tools', icon: Wrench, englishOnly: true },
];

export function isActivePath(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}
