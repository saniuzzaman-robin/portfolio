'use client';

import { motion } from 'framer-motion';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';

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
    <section className="relative overflow-hidden px-6 py-28 md:px-12 lg:px-16">
      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary-50/4 absolute top-1/2 left-1/2 h-80 w-160 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="bg-secondary-50/3 absolute top-1/2 left-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="bg-tertiary-50/3 absolute top-1/2 right-1/3 h-80 w-80 translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      </div>

      <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Decorative corners */}
        <motion.div
          initial={{ opacity: 0, x: -20, y: -20 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true }}
          className="border-primary-50/30 absolute -top-4 -left-4 h-8 w-8 border-t-2 border-l-2"
        />
        <motion.div
          initial={{ opacity: 0, x: 20, y: 20 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true }}
          className="border-secondary-50/30 absolute -right-4 -bottom-4 h-8 w-8 border-r-2 border-b-2"
        />

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
          className="font-poppins mb-5 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl"
        >
          Ready to build <span className="gradient-text">something</span>
          <br />
          <span className="text-secondary-50">extraordinary?</span>
        </motion.h2>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-neutral-70 mx-auto mb-10 max-w-xl text-sm leading-relaxed"
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
          className="flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href="mailto:saniuzzamanrobin07@gmail.com"
            className="btn-neon font-poppins inline-flex w-full items-center justify-center gap-3 rounded-lg px-8 py-3.5 text-sm font-bold tracking-widest uppercase sm:w-auto"
          >
            <Mail className="h-4 w-4 shrink-0" />
            <span>Get In Touch</span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="https://linkedin.com/in/saniuzzaman-robin"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 hover:bg-primary-50/10 border-white/10 hover:border-primary-50/30 font-poppins inline-flex w-full items-center justify-center gap-3 rounded-lg border px-8 py-3.5 text-sm font-bold tracking-widest uppercase text-neutral-70 transition-all duration-300 hover:text-neutral-90 sm:w-auto"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>LinkedIn</span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
