'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export function PlatformsBento({ limit }: { limit?: number }) {
  return (
    <section className="relative overflow-hidden border-t border-(--border-subtle) px-4 py-14 sm:px-6 sm:py-20 md:px-12 md:py-28 lg:px-20">
      <div className="relative z-10 mx-auto max-w-5xl space-y-8 sm:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              <span className="font-mono text-[11px] font-semibold tracking-widest text-cyan-500 uppercase sm:text-xs">
                Production Deliveries
              </span>
            </div>
            <h2 className="editorial-title text-2xl font-extrabold text-(--text-main) sm:text-4xl md:text-5xl">
              Featured Systems &amp; Work
            </h2>
            <p className="mt-1.5 max-w-lg text-xs text-(--text-secondary) sm:text-sm">
              Scalable web architectures, microservices migrations, and multi-tenant platforms
              powering millions of users.
            </p>
          </div>

          {limit && (
            <Link
              href="/projects"
              className="btn-secondary group self-start px-3.5 py-2 text-xs sm:self-auto"
            >
              <span>View All 8 Platforms</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </div>

        {/* Asymmetric Bento Showcase Grid */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-12">
          {/* Card 1: MuslimPro Prayer Times Engine (8 cols Hero Bento) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="craft-card relative flex flex-col justify-between overflow-hidden rounded-2xl border border-(--border-subtle) p-5 sm:rounded-3xl sm:p-7 md:col-span-8 md:p-8"
          >
            <div className="ambient-glow -top-20 -right-20 h-60 w-60 bg-indigo-600/10" />

            <div className="relative z-10 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 font-mono text-[9px] font-bold text-indigo-500 sm:text-[10px]">
                  FLAGSHIP MICROSERVICE • 180M+ USERS
                </span>
                <a
                  href="https://www.muslimpro.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-indigo-500 transition-colors hover:text-indigo-400"
                >
                  <span>Live App</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold text-(--text-main) sm:text-2xl">
                  MuslimPro Geolocation &amp; Prayer Times Microservices
                </h3>
                <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-(--text-secondary) sm:text-sm">
                  Migrated core legacy Kotlin Prayer Times engine to NestJS, integrating MaxMind
                  GeoIP and Google Maps APIs to deliver optimized location searches. Architected
                  backend microservices utilizing Redis caching, MongoDB index optimization, and GCP
                  Pub/Sub serving 180M+ global users.
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-(--border-subtle) pt-4 sm:mt-6 sm:pt-6">
              <div className="flex flex-wrap gap-1">
                {[
                  'NestJS',
                  'Next.js',
                  'Redis',
                  'MongoDB',
                  'MaxMind GeoIP',
                  'GCP Pub/Sub',
                  'TypeScript',
                ].map((t) => (
                  <span
                    key={t}
                    className="rounded border border-(--border-subtle) bg-(--surface-2) px-2 py-0.5 font-mono text-[9px] text-(--text-main) sm:text-[10px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <span className="font-mono text-[11px] font-bold text-emerald-500 sm:text-xs">
                180M+ Scale
              </span>
            </div>
          </motion.div>

          {/* Card 2: Giving Donation Platform (4 cols Tall Bento) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="craft-card relative flex flex-col justify-between overflow-hidden rounded-2xl border border-(--border-subtle) p-5 sm:rounded-3xl sm:p-7 md:col-span-4 md:p-8"
          >
            <div className="ambient-glow -bottom-20 -left-20 h-60 w-60 bg-emerald-500/10" />

            <div className="relative z-10 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[9px] font-bold text-emerald-500 sm:text-[10px]">
                  +30% YOY LIFT
                </span>
                <a
                  href="https://app.muslimpro.com/giving"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-semibold text-emerald-500 hover:text-emerald-400"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>

              <div>
                <h3 className="font-heading text-base font-bold text-(--text-main) sm:text-xl">
                  Giving Donation Platform
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-(--text-secondary)">
                  Re-platformed the legacy WordPress Giving engine to a modern Next.js/WooCommerce
                  framework with advanced SEO features, accelerating page load speeds and driving a
                  30% YoY increase in donations in 2025–2026.
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-4 space-y-2 border-t border-(--border-subtle) pt-4 sm:mt-6 sm:pt-6">
              <div className="flex flex-wrap gap-1">
                {['Next.js', 'WooCommerce', 'SEO', 'Structured Data', 'TypeScript'].map((t) => (
                  <span
                    key={t}
                    className="rounded border border-(--border-subtle) bg-(--surface-2) px-2 py-0.5 font-mono text-[9px] text-(--text-main) sm:text-[10px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 3: KONA Multi-Tenant Admin (6 cols Bento) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="craft-card flex flex-col justify-between rounded-2xl border border-(--border-subtle) p-5 sm:rounded-3xl sm:p-7 md:col-span-6 md:p-8"
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 font-mono text-[9px] font-bold text-indigo-500 sm:text-[10px]">
                  MULTI-TENANT ARCHITECTURE
                </span>
                <span className="font-mono text-[10px] text-(--text-muted)">Enterprise</span>
              </div>

              <div>
                <h3 className="font-heading text-base font-bold text-(--text-main) sm:text-xl">
                  KONA Multi-Tenant E-Commerce Admin
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-(--text-secondary)">
                  Spearheaded an enterprise-grade multi-tenant e-commerce Admin Panel in Angular
                  with dynamic multi-tenant bootstrap setups based on URL context, role-based access
                  control (RBAC), and real-time WebSocket notifications.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1 border-t border-(--border-subtle) pt-4 sm:mt-6 sm:pt-6">
              {['Angular', 'RxJS', 'Angular Material', 'WebSockets', 'RBAC'].map((t) => (
                <span
                  key={t}
                  className="rounded border border-(--border-subtle) bg-(--surface-2) px-2 py-0.5 font-mono text-[9px] text-(--text-main) sm:text-[10px]"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Card 4: SELISE Automation & Swiss IPEX AG (6 cols Bento) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="craft-card flex flex-col justify-between rounded-2xl border border-(--border-subtle) p-5 sm:rounded-3xl sm:p-7 md:col-span-6 md:p-8"
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[9px] font-bold text-cyan-500 sm:text-[10px]">
                  SWISS ENTERPRISE &amp; QA
                </span>
                <span className="font-mono text-[10px] text-(--text-muted)">SELISE / IPEX AG</span>
              </div>

              <div>
                <h3 className="font-heading text-base font-bold text-(--text-main) sm:text-xl">
                  IPEX AG Platform &amp; Selenium Framework
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-(--text-secondary)">
                  Independently executed 60–70% of UI deliverables for IPEX AG (market leader in
                  Swiss building damage management and digitization) in Angular. Built custom
                  Selenium wrapper framework across 6+ web platforms and conducted JMeter load
                  testing.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1 border-t border-(--border-subtle) pt-4 sm:mt-6 sm:pt-6">
              {['Angular', 'Angular Material', 'Selenium', 'JMeter', 'Test Automation'].map((t) => (
                <span
                  key={t}
                  className="rounded border border-(--border-subtle) bg-(--surface-2) px-2 py-0.5 font-mono text-[9px] text-(--text-main) sm:text-[10px]"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
