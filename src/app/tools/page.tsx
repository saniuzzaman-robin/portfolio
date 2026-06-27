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
    <main className="bg-midnight-900 text-midnight-950 min-h-screen">
      <Navigation />

      <section className="relative overflow-hidden px-6 pt-24 pb-16 md:px-12 lg:px-20">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="aurora-blob aurora-blob-primary absolute top-0 left-1/2 h-[300px] w-[500px] -translate-x-1/2 opacity-10" />
          <div
            className="aurora-blob aurora-blob-secondary absolute top-20 right-0 h-[200px] w-[200px] opacity-10"
            style={{ animationDelay: '-3s' }}
          />
          <div
            className="aurora-blob aurora-blob-tertiary absolute bottom-0 left-0 h-[200px] w-[200px] opacity-10"
            style={{ animationDelay: '-7s' }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-4 flex items-center gap-3"
          >
            <Wrench className="text-aurora-green h-5 w-5" />
            <p className="section-label">Developer Utilities</p>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-5 text-5xl font-bold md:text-7xl lg:text-8xl"
          >
            <span className="gradient-text">DEV</span> TOOLS
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-midnight-500 mb-8 max-w-2xl text-base leading-relaxed md:text-lg"
          >
            {toolCount} essential utilities that run entirely in your browser — no installs, no
            external APIs, no telemetry. All tools work{' '}
            <span className="text-aurora-green font-semibold">100% locally</span> with instant
            results.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-10 flex flex-wrap gap-3"
          >
            <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
              <Zap className="text-aurora-green h-4 w-4" />
              <span className="text-midnight-950 text-sm font-medium">Instant Processing</span>
            </div>
            <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
              <Shield className="text-aurora-purple h-4 w-4" />
              <span className="text-midnight-950 text-sm font-medium">100% Private</span>
            </div>
            <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
              <Laptop className="text-aurora-pink h-4 w-4" />
              <span className="text-midnight-950 text-sm font-medium">Works Offline</span>
            </div>
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            <div className="glass rounded-2xl p-5">
              <div className="text-aurora-green mb-1 text-3xl font-black">{toolCount}</div>
              <div className="text-midnight-500 text-xs font-medium tracking-wider uppercase">
                Tools
              </div>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="text-aurora-purple mb-1 text-3xl font-black">{totalTags}</div>
              <div className="text-midnight-500 text-xs font-medium tracking-wider uppercase">
                Categories
              </div>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="text-aurora-pink mb-1 text-3xl font-black">0ms</div>
              <div className="text-midnight-500 text-xs font-medium tracking-wider uppercase">
                Server Calls
              </div>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="text-aurora-green mb-1 text-3xl font-black">∞</div>
              <div className="text-midnight-500 text-xs font-medium tracking-wider uppercase">
                Free Forever
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <ToolsGrid />
        </div>
      </section>

      <Footer />
    </main>
  );
}
