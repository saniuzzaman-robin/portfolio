'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Database, Layout, ShieldCheck, Trophy } from 'lucide-react';
import { CV_DATA } from '@/lib/cv-data';

interface SkillDomain {
  id: string;
  icon: typeof Layout;
  title: string;
  badge: string;
  color: string;
  description: string;
  technologies: { name: string; level: string }[];
}

const DOMAINS: SkillDomain[] = [
  {
    id: 'frontend',
    icon: Layout,
    title: 'Frontend Architecture',
    badge: 'Enterprise SSR & Microfrontends',
    color: 'text-indigo-500',
    description:
      'Production SSR/SSG/ISR with Next.js, multi-tenant Angular enterprise panels, and reactive RxJS/NgRx state pipelines.',
    technologies: [
      { name: 'Next.js (App Router)', level: 'Advanced' },
      { name: 'React & TypeScript', level: 'Advanced' },
      { name: 'Angular (14-17)', level: 'Advanced' },
      { name: 'RxJS & NgRx', level: 'Expert' },
      { name: 'Tailwind CSS', level: 'Advanced' },
      { name: 'WebSockets', level: 'Advanced' },
    ],
  },
  {
    id: 'backend',
    icon: Cpu,
    title: 'Distributed Backend',
    badge: 'High-Concurrency Microservices',
    color: 'text-cyan-500',
    description:
      'Resilient NestJS microservices, event-driven pipelines, CQRS & SAGA patterns, and high-throughput coordinate resolution.',
    technologies: [
      { name: 'NestJS & Node.js', level: 'Advanced' },
      { name: 'CQRS & SAGA Pattern', level: 'Advanced' },
      { name: 'REST & WebSockets APIs', level: 'Advanced' },
      { name: 'Kotlin to NestJS Migration', level: 'Production' },
      { name: '.NET 6 & C#', level: 'Proficient' },
      { name: 'Dependency Injection', level: 'Advanced' },
    ],
  },
  {
    id: 'data',
    icon: Database,
    title: 'Data & Infrastructure',
    badge: 'Low-Latency In-Memory Caching',
    color: 'text-emerald-500',
    description:
      'Distributed caching strategies with Redis, MongoDB indexing optimizations, and GCP Pub/Sub message queues.',
    technologies: [
      { name: 'Redis Caching (Sliding TTL)', level: 'Expert' },
      { name: 'MongoDB Index Optimization', level: 'Advanced' },
      { name: 'GCP Pub/Sub & Cloud Run', level: 'Proficient' },
      { name: 'MaxMind GeoIP Resolution', level: 'Production' },
      { name: 'Google Maps APIs', level: 'Advanced' },
      { name: 'Aggregation Pipelines', level: 'Advanced' },
    ],
  },
  {
    id: 'reliability',
    icon: ShieldCheck,
    title: 'Testing & Reliability',
    badge: 'Custom Regression Frameworks',
    color: 'text-amber-500',
    description:
      'Custom Selenium wrapper frameworks, regression test automation across 6+ platforms, and JMeter load testing under peak loads.',
    technologies: [
      { name: 'Selenium Custom Framework', level: 'Expert' },
      { name: 'JMeter Load & Stress Testing', level: 'Advanced' },
      { name: 'Vitest & Jest Unit Testing', level: 'Advanced' },
      { name: 'CI/CD Automation Pipelines', level: 'Advanced' },
      { name: 'Cross-Platform Automation', level: 'Expert' },
      { name: 'Performance Profiling', level: 'Advanced' },
    ],
  },
];

export function SkillsMatrix() {
  const [activeDomainId, setActiveDomainId] = useState(DOMAINS[0].id);
  const activeDomain = DOMAINS.find((d) => d.id === activeDomainId) || DOMAINS[0];

  return (
    <section className="relative overflow-hidden border-t border-(--border-subtle) px-4 py-14 sm:px-6 sm:py-20 md:px-12 md:py-28 lg:px-20">
      <div className="relative z-10 mx-auto max-w-5xl space-y-8 sm:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="font-mono text-[11px] font-semibold tracking-widest text-indigo-500 uppercase sm:text-xs">
                Capabilities &amp; Pedigree
              </span>
            </div>
            <h2 className="editorial-title text-2xl font-extrabold text-(--text-main) sm:text-4xl md:text-5xl">
              Skills &amp; Algorithmic Depth
            </h2>
            <p className="mt-1.5 max-w-lg text-xs text-(--text-secondary) sm:text-sm">
              A dual foundation of production software architecture and intense competitive
              programming problem-solving.
            </p>
          </div>
        </div>

        {/* Mobile Segmented Capsule Tab Bar (< lg) with clean padding */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-1.5 shadow-inner lg:hidden">
          {DOMAINS.map((domain) => {
            const Icon = domain.icon;
            const isActive = activeDomainId === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => setActiveDomainId(domain.id)}
                className={`font-heading flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-(--text-secondary) hover:bg-(--surface-1) hover:text-(--text-main)'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{domain.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Part 1: Interactive Engineering Domains (Desktop Split Layout) */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Desktop Domain Tabs (4 cols) */}
          <div className="hidden space-y-2.5 lg:col-span-4 lg:flex lg:flex-col">
            {DOMAINS.map((domain) => {
              const Icon = domain.icon;
              const isActive = activeDomainId === domain.id;
              return (
                <button
                  key={domain.id}
                  onClick={() => setActiveDomainId(domain.id)}
                  className={`flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200 ${
                    isActive
                      ? 'border-indigo-500 bg-(--surface-2) shadow-md ring-1 ring-indigo-500/30'
                      : 'border-(--border-subtle) bg-(--surface-1) hover:border-(--border-hover)'
                  }`}
                >
                  <div className={`rounded-xl bg-indigo-500/10 p-2 ${domain.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-(--text-main)">
                      {domain.title}
                    </h3>
                    <p className="mt-0.5 font-mono text-[10px] text-(--text-muted)">
                      {domain.badge}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Domain Spotlight Sheet (8 cols on desktop / Full width on mobile) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDomain.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="craft-card space-y-4 rounded-2xl border border-(--border-subtle) p-4 sm:space-y-6 sm:rounded-3xl sm:p-7 md:p-8"
              >
                <div className="flex items-center justify-between border-b border-(--border-subtle) pb-3 sm:pb-4">
                  <div>
                    <span
                      className={`font-mono text-[10px] font-bold tracking-wider uppercase sm:text-xs ${activeDomain.color}`}
                    >
                      {activeDomain.badge}
                    </span>
                    <h3 className="font-heading mt-0.5 text-base font-bold text-(--text-main) sm:text-xl">
                      {activeDomain.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-(--text-secondary) sm:text-sm">
                  {activeDomain.description}
                </p>

                <div className="space-y-2.5 sm:space-y-3">
                  <p className="font-mono text-[10px] font-bold tracking-wider text-(--text-muted) uppercase sm:text-[11px]">
                    Core Tooling &amp; Paradigms
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {activeDomain.technologies.map((tech) => (
                      <motion.div
                        key={tech.name}
                        whileHover={{ y: -1.5 }}
                        className="flex items-center justify-between rounded-xl border border-(--border-subtle) hover:border-(--border-hover) bg-(--surface-1) p-2.5 sm:p-3 transition-colors shadow-xs"
                      >
                        <span className="font-heading text-xs font-bold text-(--text-main)">
                          {tech.name}
                        </span>
                        <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-indigo-500 sm:text-[10px]">
                          {tech.level}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Part 2: Unified Algorithmic & ICPC Arena */}
        <div className="craft-card space-y-6 rounded-2xl border border-(--border-subtle) p-5 sm:space-y-8 sm:rounded-3xl sm:p-7 md:p-8">
          <div className="flex flex-col justify-between gap-3 border-b border-(--border-subtle) pb-4 sm:flex-row sm:items-center sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-(--text-main) sm:text-xl">
                  Competitive Programming &amp; Algorithmic Mastery
                </h3>
                <p className="mt-0.5 text-[11px] text-(--text-secondary) sm:text-xs">
                  1,700+ algorithmic problems solved • ICPC Dhaka Regional contestant • Problem
                  Setter &amp; Judge
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 font-mono text-[10px] font-bold text-cyan-500 sm:self-auto sm:text-xs">
              <span>Codeforces Specialist (Max 1544)</span>
            </div>
          </div>

          {/* 4 Contest Credentials */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CV_DATA.competitiveProgramming.items.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                className="space-y-1 rounded-xl border border-(--border-subtle) hover:border-(--border-hover) bg-(--surface-1) p-3.5 sm:rounded-2xl sm:p-4 transition-colors shadow-xs"
              >
                <span className="block font-mono text-xs font-bold text-indigo-500">
                  {item.title}
                </span>
                <p className="text-[11px] leading-relaxed text-(--text-secondary) sm:text-xs">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Quantitative Problem Solving Metrics */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 sm:grid-cols-4 sm:gap-3 sm:pt-2">
            {[
              { label: 'Total Problems', value: '1,700+' },
              { label: 'Codeforces Rating', value: '1544 Max' },
              { label: 'Contests Competed', value: '10+ Regionals' },
              { label: 'Platform Ranks', value: 'Specialist' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-(--border-subtle) hover:border-indigo-500/40 bg-(--surface-2) p-2.5 text-center sm:p-3.5 transition-colors"
              >
                <p className="font-heading text-base font-black text-(--text-main) sm:text-lg">
                  {stat.value}
                </p>
                <p className="mt-0.5 font-mono text-[9px] tracking-wider text-(--text-muted) uppercase sm:text-[10px]">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
