'use client';

import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function CTA() {
  return (
    <section className="relative overflow-hidden px-6 py-28 md:px-12 lg:px-20">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="aurora-blob aurora-blob-primary absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-15" />
        <div className="aurora-blob aurora-blob-secondary absolute top-1/2 left-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 opacity-10" style={{ animationDelay: '-5s' }} />
        <div className="aurora-blob aurora-blob-tertiary absolute top-1/2 right-1/3 h-[400px] w-[400px] translate-x-1/2 -translate-y-1/2 opacity-10" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Grid pattern */}
      <div className="grid-pattern pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="section-label mb-5"
        >
          Let&apos;s Collaborate
        </motion.p>

        <motion.h2
          custom={1}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-midnight-950 md:text-5xl lg:text-6xl"
        >
          Ready to build{' '}
          <span className="gradient-text">something</span>
          <br />
          <span className="text-aurora-purple">extraordinary?</span>
        </motion.h2>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-midnight-500"
        >
          I&apos;m open to new projects, full-time roles, and exciting collaborations. If you have
          an idea that needs a battle-tested full-stack engineer — let&apos;s talk.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="mailto:saniuzzamanrobin07@gmail.com"
            className="btn-primary group inline-flex w-full items-center justify-center gap-2 sm:w-auto"
          >
            <Mail className="h-4 w-4" />
            Get In Touch
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="https://linkedin.com/in/saniuzzaman-robin"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary group inline-flex w-full items-center justify-center gap-2 sm:w-auto"
          >
            LinkedIn
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
