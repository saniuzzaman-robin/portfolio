'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PROJECTS } from '@/lib/data/projects';
import { av, ava } from '@/lib/accent';

const categories = ['All', ...Array.from(new Set(PROJECTS.map((p) => p.category)))];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export function ProjectsGrid() {
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? PROJECTS : PROJECTS.filter((p) => p.category === active);
  const [featured, ...rest] = filtered;

  return (
    <section className="relative px-6 py-24 md:px-12 lg:px-20">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="aurora-blob aurora-blob-primary absolute top-0 left-1/4 h-100 w-100 opacity-10" />
        <div className="aurora-blob aurora-blob-secondary absolute right-1/4 bottom-0 h-100 w-100 opacity-10" style={{ animationDelay: '-8s' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-mono mb-4 inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-midnight-500"
          >
            <span className="bg-aurora-green h-1.5 w-1.5 rounded-full" />
            Portfolio
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-heading text-midnight-950 text-4xl leading-tight font-extrabold tracking-tight md:text-5xl lg:text-6xl"
          >
            Projects & <span className="gradient-text">Work</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-midnight-500 mt-4 max-w-2xl text-base leading-relaxed md:text-lg"
          >
            Production work spanning full-stack feature delivery, backend microservices, enterprise
            frontend systems, and automated testing — from MuslimPro to IPEX AG.
          </motion.p>
        </div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-12 flex flex-wrap gap-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`font-poppins cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                active === cat
                  ? 'bg-midnight-950 text-midnight-50 shadow-lg'
                  : 'bg-midnight-100 text-midnight-500 hover:bg-midnight-200 hover:text-midnight-950'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Featured project */}
        {featured && (
          <motion.div
            key={featured.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Link
              href={featured.link}
              target={featured.link.startsWith('http') ? '_blank' : undefined}
              rel={featured.link.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group relative block overflow-hidden rounded-2xl border border-midnight-200 transition-all duration-500 hover:shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${ava(featured.color, 0.04)} 0%, transparent 60%)`,
              }}
            >
              {/* Accent top line */}
              <div
                className="h-1 w-full"
                style={{ background: `linear-gradient(to right, ${av(featured.color)}, transparent)` }}
              />

              <div className="flex flex-col gap-8 p-8 md:flex-row md:items-center md:p-12">
                {/* Icon */}
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${ava(featured.color, 0.12)}, ${ava(featured.color, 0.04)})`,
                    border: `1px solid ${ava(featured.color, 0.2)}`,
                  }}
                >
                  <featured.icon
                    className="h-9 w-9"
                    style={{ color: av(featured.color) }}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className="font-poppins rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase"
                      style={{
                        color: av(featured.color),
                        background: ava(featured.color, 0.08),
                        border: `1px solid ${ava(featured.color, 0.15)}`,
                      }}
                    >
                      {featured.category}
                    </span>
                    <span className="font-poppins text-midnight-500 text-xs font-semibold tracking-wider uppercase">
                      Featured
                    </span>
                  </div>

                  <h2 className="font-poppins text-midnight-950 mb-3 text-2xl font-bold md:text-3xl">
                    {featured.title}
                  </h2>

                  <p className="text-midnight-500 mb-6 max-w-2xl text-sm leading-relaxed md:text-base">
                    {featured.description}
                  </p>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {featured.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="font-poppins rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase"
                        style={{
                          color: av(featured.color),
                          border: `1px solid ${ava(featured.color, 0.2)}`,
                          background: ava(featured.color, 0.05),
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <span
                    className="font-poppins inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300 group-hover:gap-3"
                    style={{ color: av(featured.color) }}
                  >
                    View Project <ExternalLink className="h-4 w-4" />
                  </span>
                </div>
              </div>

              {/* Hover gradient sweep */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(ellipse at 80% 50%, ${ava(featured.color, 0.06)} 0%, transparent 70%)`,
                }}
              />
            </Link>
          </motion.div>
        )}

        {/* Bento grid for remaining projects */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={active}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {rest.map((project) => (
            <motion.div key={project.id} variants={itemVariants}>
              <Link
                href={project.link}
                target={project.link.startsWith('http') ? '_blank' : undefined}
                rel={project.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-midnight-200 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: `linear-gradient(160deg, ${ava(project.color, 0.03)} 0%, transparent 50%)`,
                }}
              >
                {/* Accent top line */}
                <div
                  className="h-0.5 w-full shrink-0 transition-all duration-500 group-hover:h-1"
                  style={{ background: `linear-gradient(to right, ${av(project.color)}, transparent)` }}
                />

                <div className="flex flex-1 flex-col p-6">
                  {/* Icon + Category */}
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: ava(project.color, 0.08),
                        border: `1px solid ${ava(project.color, 0.15)}`,
                      }}
                    >
                      <project.icon
                        className="h-5 w-5"
                        style={{ color: av(project.color) }}
                        strokeWidth={1.5}
                      />
                    </div>
                    <span
                      className="font-poppins rounded-full px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase"
                      style={{
                        color: av(project.color),
                        background: ava(project.color, 0.06),
                      }}
                    >
                      {project.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-poppins text-midnight-950 mb-2 text-base font-bold leading-snug">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-midnight-500 mb-4 flex-1 text-sm leading-relaxed">
                    {project.description.length > 140
                      ? project.description.slice(0, 140) + '...'
                      : project.description}
                  </p>

                  {/* Tech tags */}
                  <div className="mb-4 flex flex-wrap gap-1">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="font-poppins rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase"
                        style={{
                          color: av(project.color),
                          background: ava(project.color, 0.06),
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="text-midnight-500 px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Link */}
                  <span
                    className="font-poppins inline-flex items-center gap-1.5 text-xs font-semibold transition-all duration-300 group-hover:gap-2.5"
                    style={{ color: av(project.color) }}
                  >
                    View Project <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>

                {/* Corner glow on hover */}
                <div
                  className="pointer-events-none absolute top-0 right-0 h-32 w-32 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at top right, ${ava(project.color, 0.08)} 0%, transparent 70%)`,
                  }}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
