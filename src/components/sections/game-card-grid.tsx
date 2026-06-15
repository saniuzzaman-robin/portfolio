'use client';

import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { GAMES } from '@/lib/data/games';
import { av, ava } from '@/lib/accent';
import { AccentChip } from '@/components/ui/accent-chip';

export function GameCardGrid() {
  return (
    <>
      {/* Header */}
      <div className="animate-slide-up mb-16">
        <div className="mb-4 flex items-center gap-3">
          <Gamepad2 className="text-primary-50 h-6 w-6" />
          <p className="section-label">Interactive Lab</p>
        </div>
        <h1 className="font-poppins mb-4 text-5xl font-bold md:text-7xl">
          <span className="neon-green">GAME</span> <span className="neon-cyan">LAB</span>
        </h1>
        <p className="text-neutral-70 max-w-xl text-sm leading-relaxed">
          Browser-native games built with vanilla Canvas API and React — zero game engines, zero
          dependencies. Pure JavaScript mastery on display.
        </p>
      </div>

      {/* Game cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game, index) => {
          const Icon = game.icon;
          return (
            <Link key={game.id} href={game.href} className="group block">
              <div
                className="glass animate-scale-in relative h-full overflow-hidden rounded-sm border transition-all duration-500 hover:scale-[1.03]"
                style={{
                  borderColor: ava(game.accent, 0.19),
                  animationDelay: `${index * 120}ms`,
                  animationFillMode: 'both',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = ava(game.accent, 0.44);
                  e.currentTarget.style.boxShadow = `0 0 30px ${ava(game.accent, 0.13)}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = ava(game.accent, 0.19);
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {/* Holographic hover */}
                <div className="holographic pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Top bar */}
                <div
                  className="h-px"
                  style={{
                    background: `linear-gradient(to right, ${av(game.accent)}, transparent)`,
                  }}
                />

                <div className="relative z-10 p-6">
                  {/* Icon + subtitle */}
                  <div className="mb-6 flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-sm"
                      style={{
                        background: ava(game.accent, 0.08),
                        border: `1px solid ${ava(game.accent, 0.25)}`,
                      }}
                    >
                      <Icon className="h-6 w-6" style={{ color: av(game.accent) }} />
                    </div>
                    <AccentChip accent={game.accent}>{game.difficulty}</AccentChip>
                  </div>

                  {/* Title */}
                  <p className="font-poppins text-neutral-60 mb-1 text-xs tracking-widest uppercase lg:text-sm">
                    {game.subtitle}
                  </p>
                  <h2 className="font-poppins text-neutral-90 mb-3 text-2xl font-bold transition-colors group-hover:text-neutral-100">
                    {game.title}
                  </h2>

                  <p className="text-neutral-70 mb-6 text-sm leading-relaxed">{game.description}</p>

                  {/* Controls */}
                  <div className="mb-5">
                    <p className="text-neutral-60 mb-2 text-xs tracking-wider uppercase">
                      Controls
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {game.controls.map((c) => (
                        <span
                          key={c}
                          className="glass text-neutral-70 rounded-sm border border-white/10 px-2 py-1 text-xs lg:text-sm"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tech */}
                  <div className="mb-6">
                    <p className="text-neutral-60 mb-2 text-xs tracking-wider uppercase">
                      Built With
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {game.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded-sm px-2 py-1 text-xs lg:text-sm"
                          style={{
                            color: av(game.accent),
                            border: `1px solid ${ava(game.accent, 0.19)}`,
                            background: ava(game.accent, 0.03),
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Play CTA */}
                  <div
                    className="font-poppins flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-transform duration-300 group-hover:translate-x-1 lg:text-sm"
                    style={{ color: av(game.accent) }}
                  >
                    <span>&gt; Play Now</span>
                  </div>
                </div>

                {/* Bottom line */}
                <div
                  className="absolute bottom-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                  style={{
                    background: `linear-gradient(to right, ${av(game.accent)}, transparent)`,
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="animate-fade-in mt-12 text-center [animation-delay:600ms]">
        <p className="text-neutral-60 font-poppins text-xs tracking-widest uppercase lg:text-sm">
          All games built with zero game engines — pure web APIs &amp; React
        </p>
      </div>
    </>
  );
}
