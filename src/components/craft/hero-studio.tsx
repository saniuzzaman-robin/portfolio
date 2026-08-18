'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Download,
  Building2,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { CV_DATA } from '@/lib/cv-data';

interface SystemHighlight {
  id: string;
  tabLabel: string;
  company: string;
  role: string;
  period: string;
  headline: string;
  icon: typeof Cpu;
  color: string;
  deliverables: string[];
  technologies: string[];
}

const SYSTEM_HIGHLIGHTS: SystemHighlight[] = [
  {
    id: 'muslimpro-prayer',
    tabLabel: 'MuslimPro Microservices',
    company: 'Bitsmedia Pte Ltd.',
    role: 'Software Engineer (Full-Stack)',
    period: '01/2024 – present',
    headline: 'High-Throughput Geolocation & Prayer Times Microservices',
    icon: Cpu,
    color: 'text-indigo-500',
    deliverables: [
      'Migrated legacy Kotlin calculation engine to high-throughput NestJS microservices.',
      'Integrated MaxMind GeoIP resolution and Google Maps APIs for fast location searches.',
      'Architected backend caching utilizing Redis, MongoDB index optimization, and GCP Pub/Sub.',
      'Serving 180M+ global users with stream-optimized feature architectures.',
    ],
    technologies: [
      'NestJS',
      'Next.js',
      'Redis',
      'MongoDB',
      'MaxMind GeoIP',
      'GCP Pub/Sub',
      'TypeScript',
    ],
  },
  {
    id: 'giving-platform',
    tabLabel: 'Giving Donation Engine',
    company: 'Bitsmedia Pte Ltd.',
    role: 'Software Engineer (Full-Stack)',
    period: '01/2024 – present',
    headline: 'Re-Platformed Giving Engine with 30% YoY Donation Growth',
    icon: Layers,
    color: 'text-emerald-500',
    deliverables: [
      'Re-platformed legacy WordPress Giving engine to modern Next.js and WooCommerce framework.',
      'Implemented advanced SEO features and structured metadata, accelerating page load speeds.',
      'Drove a verified 30% YoY increase in donations across 2025–2026.',
      'Engineered an enterprise Admin Console from scratch with reusable filters, tables, and auth modules.',
    ],
    technologies: [
      'Next.js',
      'WooCommerce',
      'SEO',
      'Structured Data',
      'TypeScript',
      'Tailwind CSS',
    ],
  },
  {
    id: 'kona-admin',
    tabLabel: 'KONA Multi-Tenant',
    company: 'KONA Software Lab Ltd.',
    role: 'Software Engineer - L02',
    period: '10/2022 – 01/2024',
    headline: 'Enterprise Multi-Tenant Admin Panel & Core Libraries',
    icon: Building2,
    color: 'text-cyan-500',
    deliverables: [
      'Led and managed a 4-member software development team across quarterly feature roadmaps.',
      'Owned and maintained internal frontend libraries (auth, themes, query layers, WebSockets).',
      'Spearheaded an enterprise-grade multi-tenant e-commerce Admin Panel in Angular.',
      'Implemented dynamic multi-tenant bootstrap setups based on URL context, RBAC, and real-time WebSockets.',
    ],
    technologies: [
      'Angular',
      'TypeScript',
      'RxJS',
      'Angular Material',
      'WebSockets',
      'RBAC',
      'Multi-Tenancy',
    ],
  },
  {
    id: 'selise-qa',
    tabLabel: 'SELISE / IPEX AG',
    company: 'SELISE Digital Platforms',
    role: 'Software Engineer',
    period: '03/2021 – 10/2022',
    headline: 'Swiss Enterprise Platform Deliveries & Custom Test Automation',
    icon: ShieldCheck,
    color: 'text-amber-500',
    deliverables: [
      'Independently executed 60–70% of UI deliverables for Swiss market leader IPEX AG in Angular.',
      'Built custom Selenium wrapper framework to automate regression testing across 6+ web platforms.',
      'Conducted JMeter load testing to isolate system bottlenecks and optimize performance.',
      'Achieved top 10 rank in SELISE Super Talent Program (STP) during hiring selection.',
    ],
    technologies: [
      'Angular',
      'Angular Material',
      'Selenium',
      'JMeter',
      'Test Automation',
      'TypeScript',
    ],
  },
];

export function HeroStudio() {
  const [activeHighlight, setActiveHighlight] = useState(SYSTEM_HIGHLIGHTS[0]);

  return (
    <section className="relative overflow-hidden px-4 pt-6 pb-14 sm:px-6 sm:pt-10 sm:pb-20 md:px-12 md:pb-24 lg:px-20">
      {/* Background Ambient Canvas */}
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="ambient-glow -top-40 left-1/4 h-160 w-160 bg-indigo-600/20"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="ambient-glow top-1/2 -right-20 h-140 w-140 bg-cyan-500/15"
      />

      <div className="relative z-10 mx-auto max-w-5xl space-y-10 sm:space-y-14">
        {/* Animated Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl space-y-4 sm:space-y-6"
        >
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 font-mono text-xs font-medium text-emerald-500 shadow-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Available for Senior Roles</span>
          </motion.div>

          {/* Name & Title */}
          <div>
            <h1 className="editorial-title text-3xl font-extrabold tracking-tight text-(--text-main) sm:text-5xl md:text-6xl lg:text-7xl">
              Md. Saniuzzaman <span className="gradient-accent">Robin</span>
            </h1>
            <p className="mt-2 font-mono text-xs font-semibold tracking-wide text-indigo-500 sm:text-base">
              Software Engineer • Next.js, NestJS &amp; Angular Microservices
            </p>
          </div>

          {/* Authentic CV Bio */}
          <p className="text-sm leading-relaxed text-(--text-secondary) sm:text-base">
            5+ years of experience building high-traffic, production-grade applications for millions
            of global users. Expert in Next.js, NestJS, MongoDB, Redis, and Angular with proven
            track record in microservices design, tech leadership, and competitive programming
            pedigree (ICPC Regional &amp; 1,700+ solved).
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 sm:gap-3.5">
            <Link href="/projects" className="btn-primary group text-xs sm:text-sm">
              <span>View Production Systems</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="/CV_SANIUZZAMAN_ROBIN.pdf"
              download
              className="btn-secondary group text-xs sm:text-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Resume PDF</span>
            </a>

            <a href={`mailto:${CV_DATA.email}`} className="btn-ghost text-xs sm:text-sm">
              <span>Contact Directly</span>
            </a>
          </div>
        </motion.div>

        {/* Quantified Metrics Ribbon directly from CV */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-2 gap-3 border-t border-(--border-subtle) pt-4 sm:grid-cols-4 sm:gap-4 sm:pt-6"
        >
          {CV_DATA.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08, duration: 0.5 }}
              className="space-y-0.5"
            >
              <p className="font-heading text-xl font-black tracking-tight text-(--text-main) sm:text-3xl">
                {stat.value}
              </p>
              <p className="font-mono text-[10px] tracking-wider text-(--text-muted) uppercase sm:text-[11px]">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Production Systems Showcase based strictly on CV */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="craft-card space-y-5 rounded-2xl border border-(--border-subtle) p-4 sm:rounded-3xl sm:p-7 md:p-8"
        >
          {/* Header */}
          <div className="flex flex-col justify-between gap-3 border-b border-(--border-subtle) pb-3 sm:flex-row sm:items-center sm:pb-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="font-mono text-xs font-bold tracking-wider text-indigo-500 uppercase">
                Key Engineering Highlights
              </span>
            </div>

            {/* Segmented Selector */}
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto rounded-xl border border-(--border-subtle) bg-(--surface-2) p-1">
              {SYSTEM_HIGHLIGHTS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveHighlight(item)}
                  className={`font-heading cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                    activeHighlight.id === item.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-(--text-secondary) hover:text-(--text-main)'
                  }`}
                >
                  {item.tabLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Active Highlight Detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeHighlight.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-heading text-base font-bold text-(--text-main) sm:text-xl">
                    {activeHighlight.headline}
                  </h3>
                  <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-500 sm:text-xs">
                    {activeHighlight.company} • {activeHighlight.period}
                  </span>
                </div>
              </div>

              {/* Deliverable Bullets */}
              <div className="grid gap-2.5 sm:grid-cols-2">
                {activeHighlight.deliverables.map((bullet, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    className="p-3 sm:p-4 rounded-xl bg-(--surface-1) border border-(--border-subtle) hover:border-(--border-hover) transition-colors flex items-start gap-2.5 shadow-xs"
                  >
                    <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-(--text-secondary) leading-relaxed">
                      {bullet}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Technologies */}
              <div className="pt-3 border-t border-(--border-subtle) flex flex-wrap gap-1">
                {activeHighlight.technologies.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] px-2.5 py-0.5 rounded bg-(--surface-2) text-(--text-main) border border-(--border-subtle) hover:border-indigo-500/40 transition-colors"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
