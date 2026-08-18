'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { PROJECTS } from '@/lib/data/projects';

export function PlatformsGallery({ limit }: { limit?: number }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const displayedProjects = limit ? PROJECTS.slice(0, limit) : PROJECTS;
  const filtered =
    activeFilter === 'All'
      ? displayedProjects
      : displayedProjects.filter((p) =>
          p.category.toLowerCase().includes(activeFilter.toLowerCase())
        );

  return (
    <section className="relative overflow-hidden border-t border-(--border-subtle) px-4 py-14 sm:px-6 sm:py-20 md:px-12 md:py-28 lg:px-20">
      <div className="relative z-10 mx-auto max-w-5xl space-y-8 sm:space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"
        >
          <div>
            <p className="mb-1.5 font-mono text-[11px] font-semibold tracking-widest text-cyan-500 uppercase sm:text-xs">
              Production Work
            </p>
            <h2 className="editorial-title text-2xl font-extrabold text-(--text-main) sm:text-4xl md:text-5xl">
              Selected Platforms &amp; Architecture
            </h2>
            <p className="mt-1.5 max-w-lg text-xs text-(--text-secondary) sm:text-sm">
              Scalable web applications, microservices migrations, and enterprise platforms serving
              millions worldwide.
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
        </motion.div>

        {/* Filter Pills (if full page) */}
        {!limit && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {['All', 'Full Stack', 'Frontend', 'Testing'].map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveFilter(cat)}
                className={`cursor-pointer rounded-full px-3 py-1 font-mono text-xs font-semibold transition-all sm:px-3.5 sm:py-1.5 ${
                  activeFilter === cat
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'border border-(--border-subtle) hover:border-(--border-hover) bg-(--surface-2) text-(--text-secondary) hover:text-(--text-main)'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        )}

        {/* Cinematic Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid gap-4 sm:grid-cols-2 sm:gap-6"
          >
            {filtered.map((project, idx) => {
              const hasLiveLink = project.link && project.link !== '#';
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="craft-card group flex flex-col justify-between rounded-2xl border border-(--border-subtle) hover:border-(--border-hover) p-5 sm:rounded-3xl sm:p-7 md:p-8 transition-colors"
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between sm:mb-4">
                      <span className="rounded-full border border-(--border-subtle) bg-(--surface-2) px-2.5 py-0.5 font-mono text-[9px] font-semibold text-(--text-muted) sm:text-[10px]">
                        {project.category}
                      </span>

                      {hasLiveLink ? (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-indigo-500 transition-colors hover:text-indigo-400"
                        >
                          <span>Live App</span>
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      ) : (
                        <span className="font-mono text-[9px] text-(--text-muted) sm:text-[10px]">
                          Enterprise Internal
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading mb-2 text-lg font-bold text-(--text-main) transition-colors group-hover:text-indigo-400 sm:mb-3 sm:text-xl">
                      {project.title}
                    </h3>

                    <p className="mb-4 text-xs leading-relaxed text-(--text-secondary) sm:mb-6 sm:text-sm">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 border-t border-(--border-subtle) pt-3 sm:pt-4">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded border border-(--border-subtle) hover:border-indigo-500/40 bg-(--surface-2) px-2 py-0.5 font-mono text-[9px] text-(--text-muted) hover:text-(--text-main) sm:text-[10px] transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
