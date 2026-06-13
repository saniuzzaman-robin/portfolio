import {
  Book,
  Clock,
  Play,
  Settings,
  TestTube2,
  Globe,
  Gift,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react';
import type { AccentToken } from '@/lib/accent';

export interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  link: string;
  color: AccentToken;
  icon: LucideIcon;
}

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Prayer Times Web',
    category: 'Full Stack',
    description:
      'Migrated the Prayer Times engine from Kotlin to a NestJS microservice with all calculation APIs. Integrated MaxMind GeoIP for client IP resolution and Google Maps for place search. Added a cities database for optimized location lookups. Built the full frontend in Next.js with SEO and i18n support.',
    technologies: ['Next.js', 'NestJS', 'MaxMind GeoIP', 'Google Maps API', 'Redis', 'MongoDB'],
    link: 'https://app.muslimpro.com/prayer-times',
    color: 'primary',
    icon: Clock,
  },
  {
    id: 2,
    title: 'Giving — Donation Platform',
    category: 'Full Stack',
    description:
      'Re-platformed the legacy WordPress Giving engine to a modern Next.js/WooCommerce stack with advanced SEO integration. New design, lightning-fast load times, and structured data drove a 30% YoY increase in donations in 2025–2026.',
    technologies: ['Next.js', 'WooCommerce', 'SEO', 'Structured Data', 'TypeScript'],
    link: 'https://app.muslimpro.com/giving',
    color: 'secondary',
    icon: Gift,
  },
  {
    id: 3,
    title: 'Qalbox Video Platform',
    category: 'Full Stack',
    description:
      'Built the Qalbox streaming experience on MuslimPro: completed the shorts page independently, integrated live streaming, wired up search, and fixed numerous platform bugs. Added OG tags, sitemaps, and the first round of SEO for Qalbox pages.',
    technologies: ['Next.js', 'Video Streaming', 'Live Streaming', 'SEO', 'TypeScript'],
    link: 'https://app.muslimpro.com/qalbox',
    color: 'tertiary',
    icon: Play,
  },
  {
    id: 4,
    title: 'Islamic Calendar',
    category: 'Full Stack',
    description:
      'Implemented all backend APIs for the Islamic Calendar feature in NestJS and supported frontend integration. Delivers Hijri dates, Islamic events, and festival schedules with proper SEO.',
    technologies: ['NestJS', 'Next.js', 'MongoDB', 'SEO', 'TypeScript'],
    link: 'https://app.muslimpro.com/islamic-calendar',
    color: 'primary',
    icon: CalendarDays,
  },
  {
    id: 5,
    title: 'MuslimPro Admin Console',
    category: 'Frontend',
    description:
      'Engineered a new Admin Console from scratch in Next.js. Built auth, reusable tables, forms, filter components, navigation menu, and theme setup — the full shell teams now use to add new modules for Gamification, Inspiration, Journal, and Settings.',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Auth', 'Reusable Components'],
    link: '#',
    color: 'secondary',
    icon: Settings,
  },
  {
    id: 6,
    title: 'KONA Multi-Tenant Admin Panel',
    category: 'Frontend',
    description:
      'Spearheaded an enterprise-grade multi-tenant e-commerce Admin Panel in Angular with RBAC, dynamic URL-based bootstrap for multi-tenancy, inventory pipelines, order & reporting management, and real-time WebSocket notifications. Owned and maintained internal frontend libraries (auth, themes, query/command services, WebSockets).',
    technologies: ['Angular', 'RxJS', 'Angular Material', '.NET 6', 'CQRS', 'SAGA', 'WebSockets'],
    link: '#',
    color: 'tertiary',
    icon: Globe,
  },
  {
    id: 7,
    title: 'IPEX AG — SELISE Platform',
    category: 'Frontend',
    description:
      "Primary frontend engineer for IPEX AG, Switzerland's market leader in building damage management. Delivered 60–70% of all UI work: reactive forms, advanced calculation engines, data tables, drag-and-drop dashboards, and an automated OCR pipeline for PDF-to-insurance-claim processing.",
    technologies: ['Angular', 'Angular Material', 'Selenium', 'JMeter', 'TypeScript'],
    link: 'https://www.ipex.ch/en',
    color: 'primary',
    icon: Book,
  },
  {
    id: 8,
    title: 'Automated Testing Suite — SELISE',
    category: 'Testing',
    description:
      'Built a custom Selenium wrapper framework that automated regression testing across 6+ distinct enterprise web platforms. Conducted JMeter load testing to identify and resolve system performance bottlenecks.',
    technologies: ['Selenium', 'JMeter', 'Test Automation', 'Performance Testing'],
    link: '#',
    color: 'secondary',
    icon: TestTube2,
  },
];
