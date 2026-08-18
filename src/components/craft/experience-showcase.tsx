'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronRight } from 'lucide-react';
import { CV_DATA } from '@/lib/cv-data';

export function ExperienceShowcase() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeJob = CV_DATA.experience[selectedIdx];

  return (
    <section className="relative overflow-hidden border-t border-(--border-subtle) px-4 py-14 sm:px-6 sm:py-20 md:px-12 md:py-28 lg:px-20">
      <div className="relative z-10 mx-auto max-w-5xl space-y-8 sm:space-y-10">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="font-mono text-[11px] font-semibold tracking-widest text-indigo-500 uppercase sm:text-xs">
                Career History
              </span>
            </div>
            <h2 className="editorial-title text-2xl font-extrabold text-(--text-main) sm:text-4xl md:text-5xl">
              Engineering Impact &amp; Deliveries
            </h2>
            <p className="mt-1.5 max-w-lg text-xs text-(--text-secondary) sm:text-sm">
              5+ years of delivering high-concurrency microservices, multi-tenant frontends, and
              automated testing frameworks.
            </p>
          </div>

          <a
            href="/CV_SANIUZZAMAN_ROBIN.pdf"
            download
            className="btn-secondary self-start px-3.5 py-2 text-xs sm:self-auto"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Official CV</span>
          </a>
        </div>

        {/* Mobile Segmented Capsule Tab Bar (< lg) with clean padding */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-1.5 shadow-inner lg:hidden">
          {CV_DATA.experience.map((job, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={job.company}
                onClick={() => setSelectedIdx(idx)}
                className={`font-heading flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-(--text-secondary) hover:bg-(--surface-1) hover:text-(--text-main)'
                }`}
              >
                <span>{job.company.split(' ')[0]}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-(--surface-1) text-(--text-muted)'
                  }`}
                >
                  0{idx + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop Split Experience Layout (lg+) */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Desktop Company Selector (4.5 cols) */}
          <div className="hidden space-y-3 lg:col-span-5 lg:flex lg:flex-col">
            {CV_DATA.experience.map((job, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <motion.button
                  key={job.company}
                  onClick={() => setSelectedIdx(idx)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full cursor-pointer rounded-2xl border p-5 text-left transition-all duration-300 ${
                    isSelected
                      ? 'border-indigo-500 bg-(--surface-2) shadow-lg ring-1 ring-indigo-500/30'
                      : 'border-(--border-subtle) bg-(--surface-1) hover:border-(--border-hover)'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold tracking-wider text-indigo-500 uppercase">
                      0{idx + 1} • {job.period}
                    </span>
                    {idx === 0 && (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-emerald-500">
                        Current
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading mt-1.5 text-lg font-bold text-(--text-main)">
                    {job.company}
                  </h3>
                  <p className="mt-0.5 text-xs text-(--text-secondary)">{job.title}</p>

                  <div className="mt-3 flex items-center justify-between border-t border-(--border-subtle) pt-3 font-mono text-[11px] text-(--text-muted)">
                    <span>{job.location}</span>
                    <ChevronRight
                      className={`h-3.5 w-3.5 transition-transform ${isSelected ? 'translate-x-1 text-indigo-500' : 'opacity-40'}`}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Right Column: Dynamic Deep-Dive Sheet (7.5 cols / Full width on mobile) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeJob.company}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="craft-card space-y-4 rounded-2xl border border-(--border-subtle) p-4 sm:space-y-6 sm:rounded-3xl sm:p-7 md:p-8"
              >
                {/* Header */}
                <div className="space-y-1.5 border-b border-(--border-subtle) pb-3 sm:pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-heading text-lg font-bold text-(--text-main) sm:text-2xl">
                      {activeJob.company}
                    </h3>
                    <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-500 sm:px-3 sm:py-1 sm:text-xs">
                      {activeJob.period}
                    </span>
                  </div>
                  <p className="font-mono text-xs font-semibold text-indigo-500 sm:text-sm">
                    {activeJob.title} • {activeJob.location}
                  </p>
                </div>

                {/* Summary */}
                <p className="text-xs leading-relaxed text-(--text-secondary) sm:text-sm">
                  {activeJob.summary}
                </p>

                {/* Highlights Grid */}
                <div className="space-y-2.5 sm:space-y-3">
                  <p className="font-mono text-[11px] font-bold tracking-wider text-(--text-muted) uppercase">
                    Key Technical Highlights
                  </p>
                  <div className="space-y-2.5 sm:space-y-3">
                    {activeJob.highlights.map((h, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -2 }}
                        className="space-y-1 rounded-xl border border-(--border-subtle) hover:border-(--border-hover) bg-(--surface-1) p-3 sm:rounded-2xl sm:p-4 transition-colors shadow-xs"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-(--text-main)">
                          <span className="font-black text-indigo-500">❖</span>
                          <span>{h.topic}</span>
                        </div>
                        <p className="pl-4 text-[11px] leading-relaxed text-(--text-secondary) sm:text-xs">
                          {h.detail}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Tech Pills */}
                <div className="border-t border-(--border-subtle) pt-3 sm:pt-4">
                  <p className="mb-2 font-mono text-[9px] tracking-wider text-(--text-muted) uppercase sm:text-[10px]">
                    Core Technologies Applied
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {activeJob.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded border border-(--border-subtle) hover:border-indigo-500/40 bg-(--surface-2) px-2 py-0.5 font-mono text-[9px] text-(--text-main) sm:text-[10px] transition-colors"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
