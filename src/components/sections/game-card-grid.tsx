'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { GAMES } from '@/lib/data/games';
import { av, ava } from '@/lib/accent';
import { AccentChip } from '@/components/ui/accent-chip';
import { SectionHeader } from '@/components/ui/section-header';

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
      <SectionHeader
        label="Interactive Lab"
        title={
          <>
            <span className="gradient-text">GAME</span> LAB
          </>
        }
        description="Browser-native games built with vanilla Canvas API and React — zero game engines, zero dependencies. Pure JavaScript mastery on display."
      />

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
                  className="glass relative h-full overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
                  style={{ borderTop: `3px solid ${av(game.accent)}` }}
                >
                  <div className="relative z-10 p-6">
                    <div className="mb-5 flex items-start justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{ background: ava(game.accent, 0.1) }}
                      >
                        <Icon className="h-6 w-6" style={{ color: av(game.accent) }} />
                      </div>
                      <AccentChip accent={game.accent}>{game.difficulty}</AccentChip>
                    </div>

                    <p className="text-midnight-500 mb-1 text-xs tracking-widest uppercase">
                      {game.subtitle}
                    </p>
                    <h2 className="text-midnight-950 group-hover:text-aurora-green mb-3 text-2xl font-bold transition-colors">
                      {game.title}
                    </h2>

                    <p className="text-midnight-500 mb-5 text-sm leading-relaxed">
                      {game.description}
                    </p>

                    <div className="mb-4">
                      <p className="text-midnight-500 mb-2 text-xs tracking-wider uppercase">
                        Controls
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {game.controls.map((c) => (
                          <span
                            key={c}
                            className="bg-midnight-100 text-midnight-950 rounded-lg px-2 py-1 text-xs"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-midnight-500 mb-2 text-xs tracking-wider uppercase">
                        Built With
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {game.tech.map((t) => (
                          <span
                            key={t}
                            className="rounded-lg px-2 py-1 text-xs"
                            style={{
                              color: av(game.accent),
                              border: `1px solid ${ava(game.accent, 0.2)}`,
                              background: ava(game.accent, 0.05),
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-all duration-300 group-hover:translate-x-1"
                      style={{ color: av(game.accent) }}
                    >
                      <span>&gt; Play Now</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-midnight-500 mt-10 text-center text-xs tracking-widest uppercase"
      >
        All games built with zero game engines — pure web APIs &amp; React
      </motion.p>
    </>
  );
}
