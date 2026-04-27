'use client';

import { Mail, ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="px-6 py-32 md:px-12 lg:px-20 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-primary-50/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary-50/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-tertiary-50/5 rounded-full blur-3xl" />
      </div>

      {/* Decorative grid lines */}
      <div className="absolute inset-0 cyber-grid-dense opacity-30 pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center relative z-10 animate-slide-up">
        {/* Label */}
        <p className="section-label mb-6">Let&apos;s Collaborate</p>

        {/* Heading */}
        <h2 className="font-space-grotesk font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
          Ready to build <span className="neon-green">something</span>
          <br />
          <span className="neon-cyan">extraordinary?</span>
        </h2>

        <p className="text-neutral-70 mb-12 text-sm leading-relaxed max-w-xl mx-auto">
          I&apos;m open to new projects, full-time roles, and exciting collaborations. If you have
          an idea that could change the world — let&apos;s talk.
        </p>

        {/* CTA Button */}
        <a
          href="mailto:saniuzzamanrobin07@gmail.com"
          className="group inline-flex items-center gap-3 btn-neon-green px-10 py-4 rounded-sm font-space-grotesk font-bold text-sm uppercase tracking-widest"
        >
          <Mail className="w-4 h-4" />
          <span>Get In Touch</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>

        {/* Corner decorations */}
        <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-primary-50/30" />
        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-secondary-50/30" />
      </div>
    </section>
  );
}
