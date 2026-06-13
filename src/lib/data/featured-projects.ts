import type { AccentToken } from '@/lib/accent';

export interface FeaturedProject {
  title: string;
  description: string;
  href: string;
  tag: string;
  accent: AccentToken;
  number: string;
}

export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    title: 'Prayer Times',
    description:
      'Migrated Kotlin engine to NestJS microservice. Geolocation via MaxMind GeoIP, place search via Google Maps, cities database for optimized lookups, and full SEO on the Next.js frontend.',
    href: 'https://app.muslimpro.com/prayer-times',
    tag: 'Geolocation + Backend Migration',
    accent: 'primary',
    number: '01',
  },
  {
    title: 'Giving Platform',
    description:
      'Re-platformed the WordPress donation engine to Next.js/WooCommerce with advanced SEO and a modern redesign — driving a 30% YoY increase in donations in 2025–2026.',
    href: 'https://app.muslimpro.com/giving',
    tag: 'FinTech + SEO',
    accent: 'secondary',
    number: '02',
  },
  {
    title: 'Islamic Calendar',
    description:
      'Full backend API implementation in NestJS and frontend integration for Hijri dates, Islamic events, and festival schedules with proper SEO support.',
    href: 'https://app.muslimpro.com/islamic-calendar',
    tag: 'Full Stack + Date Systems',
    accent: 'tertiary',
    number: '03',
  },
  {
    title: 'Qalbox',
    description:
      'Completed shorts page, integrated live streaming and search for the MuslimPro video platform. Added the first SEO pass including OG tags and sitemaps.',
    href: 'https://app.muslimpro.com/qalbox',
    tag: 'Streaming + Media',
    accent: 'primary',
    number: '04',
  },
];
