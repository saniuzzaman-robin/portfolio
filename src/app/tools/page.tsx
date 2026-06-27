'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/sections/navigation';
import { Footer } from '@/components/sections/footer';
import { ToolsGrid } from '@/components/sections/tools-grid';
import { Wrench, Zap, Shield, Laptop } from 'lucide-react';
import { DEV_TOOLS } from '@/lib/data/tools';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function ToolsPage() {
  const toolCount = DEV_TOOLS.length;
  const totalTags = new Set(DEV_TOOLS.flatMap((t) => t.tags)).size;

  return (
    <main className="bg-neutral-5 text-neutral-90 min-h-screen">
      <Navigation />

      <section className="relative overflow-hidden px-6 pt-24 pb-16 md:px-12 lg:px-16">
        <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-15" />
        <div className="bg-primary-50/3 pointer-events-none absolute top-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full blur-3xl" />
        <div className="bg-secondary-50/2 pointer-events-none absolute top-20 right-0 h-48 w-48 rounded-full blur-3xl" />
        <div className="bg-tertiary-50/2 pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mb-4 flex items-center gap-3">
            <Wrench className="text-primary-50 h-5 w-5" />
            <p className="section-label">Developer Utilities</p>
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible" className="font-poppins mb-5 text-5xl font-bold md:text-7xl lg:text-8xl">
            <span className="text-primary-50">DEV</span> <span className="text-secondary-50">TOOLS</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible" className="text-neutral-70 mb-8 max-w-2xl text-base leading-relaxed md:text-lg">
            {toolCount} essential utilities that run entirely in your browser — no installs, no
            external APIs, no telemetry. All tools work{' '}
            <span className="text-primary-50 font-semibold">100% locally</span> with instant results.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="mb-10 flex flex-wrap gap-3">
            <div className="glass flex items-center gap-2 rounded-full border border-white/8 px-4 py-2">
              <Zap className="text-primary-50 h-4 w-4" />
              <span className="text-neutral-90 text-sm font-medium">Instant Processing</span>
            </div>
            <div className="glass flex items-center gap-2 rounded-full border border-white/8 px-4 py-2">
              <Shield className="text-secondary-50 h-4 w-4" />
              <span className="text-neutral-90 text-sm font-medium">100% Private</span>
            </div>
            <div className="glass flex items-center gap-2 rounded-full border border-white/8 px-4 py-2">
              <Laptop className="text-tertiary-50 h-4 w-4" />
              <span className="text-neutral-90 text-sm font-medium">Works Offline</span>
            </div>
          </motion.div>

          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="glass rounded-xl border border-white/8 p-5">
              <div className="font-poppins text-primary-50 mb-1 text-3xl font-black">{toolCount}</div>
              <div className="text-neutral-60 text-xs font-medium tracking-wider uppercase">Tools</div>
            </div>
            <div className="glass rounded-xl border border-white/8 p-5">
              <div className="font-poppins text-secondary-50 mb-1 text-3xl font-black">{totalTags}</div>
              <div className="text-neutral-60 text-xs font-medium tracking-wider uppercase">Categories</div>
            </div>
            <div className="glass rounded-xl border border-white/8 p-5">
              <div className="font-poppins text-tertiary-50 mb-1 text-3xl font-black">0ms</div>
              <div className="text-neutral-60 text-xs font-medium tracking-wider uppercase">Server Calls</div>
            </div>
            <div className="glass rounded-xl border border-white/8 p-5">
              <div className="font-poppins text-primary-50 mb-1 text-3xl font-black">∞</div>
              <div className="text-neutral-60 text-xs font-medium tracking-wider uppercase">Free Forever</div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-12 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <ToolsGrid />
        </div>
      </section>

      <Footer />
    </main>
  );
}
