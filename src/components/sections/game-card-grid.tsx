'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';
import { GAMES } from '@/lib/data/games';
import { av, ava } from '@/lib/accent';
import { AccentChip } from '@/components/ui/accent-chip';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function GameCardGrid() {
  return (
    <>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-14"
      >
        <div className="mb-4 flex items-center gap-3">
          <Gamepad2 className="text-primary-50 h-6 w-6" />
          <p className="section-label">Interactive Lab</p>
        </div>
        <h1 className="font-poppins mb-3 text-5xl font-bold md:text-7xl">
          <span className="text-primary-50">GAME</span> <span className="text-secondary-50">LAB</span>
        </h1>
        <p className="text-neutral-60 max-w-xl text-sm leading-relaxed">
          Browser-native games built with vanilla Canvas API and React — zero game engines, zero
          dependencies. Pure JavaScript mastery on display.
        </p>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <motion.div key={game.id} variants={cardItem}>
              <Link href={game.href} className="group block">
                <div
                  className="glass relative h-full overflow-hidden rounded-xl border transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
                  style={{
                    borderColor: ava(game.accent, 0.15),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = ava(game.accent, 0.4);
                    e.currentTarget.style.boxShadow = `0 0 30px ${ava(game.accent, 0.1)}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = ava(game.accent, 0.15);
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div className="holographic pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div
                    className="h-0.5"
                    style={{
                      background: `linear-gradient(to right, ${av(game.accent)}, transparent)`,
                    }}
                  />

                  <div className="relative z-10 p-6">
                    <div className="mb-5 flex items-start justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{
                          background: ava(game.accent, 0.08),
                          border: `1px solid ${ava(game.accent, 0.22)}`,
                        }}
                      >
                        <Icon className="h-6 w-6" style={{ color: av(game.accent) }} />
                      </div>
                      <AccentChip accent={game.accent}>{game.difficulty}</AccentChip>
                    </div>

                    <p className="font-poppins text-neutral-60 mb-1 text-xs tracking-widest uppercase">
                      {game.subtitle}
                    </p>
                    <h2 className="font-poppins text-neutral-90 mb-3 text-2xl font-bold transition-colors group-hover:text-neutral-100">
                      {game.title}
                    </h2>

                    <p className="text-neutral-70 mb-5 text-sm leading-relaxed">{game.description}</p>

                    <div className="mb-4">
                      <p className="text-neutral-60 mb-2 text-xs tracking-wider uppercase">Controls</p>
                      <div className="flex flex-wrap gap-1.5">
                        {game.controls.map((c) => (
                          <span
                            key={c}
                            className="glass text-neutral-70 rounded-md border border-white/8 px-2 py-1 text-xs"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-neutral-60 mb-2 text-xs tracking-wider uppercase">Built With</p>
                      <div className="flex flex-wrap gap-1.5">
                        {game.tech.map((t) => (
                          <span
                            key={t}
                            className="rounded-md px-2 py-1 text-xs"
                            style={{
                              color: av(game.accent),
                              border: `1px solid ${ava(game.accent, 0.18)}`,
                              background: ava(game.accent, 0.03),
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div
                      className="font-poppins flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-all duration-300 group-hover:translate-x-1"
                      style={{ color: av(game.accent) }}
                    >
                      <span>&gt; Play Now</span>
                    </div>
                  </div>

                  <div
                    className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full"
                    style={{
                      background: `linear-gradient(to right, ${av(game.accent)}, transparent)`,
                    }}
                  />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-neutral-50 font-poppins mt-10 text-center text-xs tracking-widest uppercase"
      >
        All games built with zero game engines — pure web APIs &amp; React
      </motion.p>
    </>
  );
}
