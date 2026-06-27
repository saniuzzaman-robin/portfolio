'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { TypewriterText } from '../reusable/typewriter-text';
import { OrbitalVisualization } from '../reusable/orbital-visualization';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden">
      {/* Aurora gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="aurora-blob aurora-blob-primary absolute -top-32 -left-32 h-[500px] w-[500px] opacity-30" />
        <div
          className="aurora-blob aurora-blob-secondary absolute top-1/4 right-1/4 h-[400px] w-[400px] opacity-20"
          style={{ animationDelay: '-5s' }}
        />
        <div
          className="aurora-blob aurora-blob-tertiary absolute bottom-1/4 left-1/3 h-[350px] w-[350px] opacity-15"
          style={{ animationDelay: '-10s' }}
        />
      </div>

      {/* Grid pattern */}
      <div className="grid-pattern pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative z-10 w-full px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto w-full xl:max-w-7xl">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            {/* Left: Content */}
            <div>
              {/* Status badge */}
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-8"
              >
                <span className="bg-aurora-green/10 text-aurora-green inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                  <span className="bg-aurora-green animate-pulse-soft h-2 w-2 rounded-full" />
                  Available for opportunities
                </span>
              </motion.div>

              {/* Name */}
              <motion.div
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-6"
              >
                <h1 className="font-heading text-midnight-950 text-5xl leading-tight font-extrabold tracking-tight md:text-7xl lg:text-8xl">
                  Saniuzzaman
                </h1>
                <h2 className="font-heading gradient-text mt-2 text-4xl font-extrabold md:text-6xl lg:text-7xl">
                  Robin
                </h2>
              </motion.div>

              {/* Role */}
              <motion.div
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-8 flex h-10 items-center"
              >
                <TypewriterText
                  texts={[
                    'Full-Stack Software Engineer',
                    'NestJS & Next.js Specialist',
                    'Angular Architecture Expert',
                    'Competitive Programmer',
                    'System Design Enthusiast',
                  ]}
                  className="text-midnight-950 text-lg font-medium md:text-2xl"
                  cursorClassName="text-aurora-green"
                  speed={70}
                  deleteSpeed={35}
                  pause={1800}
                />
              </motion.div>

              {/* Stats */}
              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-10 flex flex-wrap gap-4"
              >
                {[
                  { n: '5+', l: 'Years Experience', color: 'text-aurora-green' },
                  { n: '1700+', l: 'Problems Solved', color: 'text-aurora-purple' },
                  { n: '30%', l: 'YoY Impact Growth', color: 'text-aurora-pink' },
                ].map((s) => (
                  <div key={s.l} className="glass rounded-xl px-5 py-3">
                    <span className={`font-heading text-2xl font-bold ${s.color}`}>{s.n}</span>
                    <span className="text-midnight-500 ml-2 text-sm">{s.l}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-4"
              >
                <Link href="/projects" className="btn-primary group">
                  View Portfolio
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/games" className="btn-secondary group">
                  <Play className="h-4 w-4" />
                  Play Games
                </Link>
                <Link href="/resume" className="btn-ghost">
                  Resume
                </Link>
              </motion.div>
            </div>

            {/* Right: Orbital Visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="hidden h-[450px] w-full lg:block xl:h-[550px]"
            >
              <OrbitalVisualization />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-midnight-500 text-xs font-medium tracking-widest uppercase">
          Scroll
        </span>
        <div className="from-midnight-300 h-8 w-px bg-linear-to-b to-transparent" />
      </motion.div>
    </section>
  );
}
