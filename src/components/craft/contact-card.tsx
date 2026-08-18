'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Copy, Check, Download, ArrowRight } from 'lucide-react';
import { CV_DATA } from '@/lib/cv-data';

export function ContactCard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CV_DATA.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden border-t border-(--border-subtle) px-4 py-16 sm:px-6 sm:py-20 md:px-12 md:py-28 lg:px-20">
      {/* Background Ambient Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="ambient-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[30rem] w-[30rem] bg-indigo-600/20"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto max-w-4xl space-y-6 text-center sm:space-y-8"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-indigo-500 sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span>COLLABORATE &amp; HIRE</span>
        </div>

        <h2 className="editorial-title text-3xl font-extrabold text-(--text-main) sm:text-5xl md:text-6xl">
          Let&apos;s build something <span className="gradient-accent">extraordinary.</span>
        </h2>

        <p className="mx-auto max-w-xl text-sm leading-relaxed text-(--text-secondary) sm:text-base md:text-lg">
          Whether you need a high-scale microservices architect, full-stack lead, or want to discuss
          engineering challenges — reach out directly.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 sm:gap-3.5 sm:pt-2">
          <a href={`mailto:${CV_DATA.email}`} className="btn-primary group text-xs sm:text-sm">
            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110" />
            <span>Send Email</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </a>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="btn-secondary group cursor-pointer text-xs sm:text-sm"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500 sm:h-4 sm:w-4" />
                <span className="font-semibold text-emerald-500">Email Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110" />
                <span>Copy Email</span>
              </>
            )}
          </motion.button>

          <a
            href="/CV_SANIUZZAMAN_ROBIN.pdf"
            download
            className="btn-secondary group text-xs sm:text-sm"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:-translate-y-0.5" />
            <span>Resume PDF</span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
