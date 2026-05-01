'use client';

import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { GAMES } from '@/lib/data/games';
import { av, ava } from '@/lib/accent';

export function GameCardGrid() {
  return (
    <>
      {/* Header */}
      <div className="mb-16 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <Gamepad2 className="w-6 h-6 text-primary-50" />
          <p className="section-label">Interactive Lab</p>
        </div>
        <h1 className="font-space-grotesk font-bold text-5xl md:text-7xl mb-4">
          <span className="neon-green">GAME</span> <span className="neon-cyan">LAB</span>
        </h1>
        <p className="text-neutral-70 text-sm max-w-xl leading-relaxed">
          Browser-native games built with vanilla Canvas API and React — zero game engines, zero
          dependencies. Pure JavaScript mastery on display.
        </p>
      </div>

      {/* Game cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GAMES.map((game, index) => {
          const Icon = game.icon;
          return (
            <Link key={game.id} href={game.href} className="group block">
              <div
                className="relative glass rounded-sm border h-full transition-all duration-500 overflow-hidden animate-scale-in hover:scale-[1.03]"
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
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 holographic pointer-events-none" />

                {/* Top bar */}
                <div
                  className="h-px"
                  style={{
                    background: `linear-gradient(to right, ${av(game.accent)}, transparent)`,
                  }}
                />

                <div className="relative z-10 p-6">
                  {/* Icon + subtitle */}
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="w-12 h-12 rounded-sm flex items-center justify-center"
                      style={{
                        background: ava(game.accent, 0.08),
                        border: `1px solid ${ava(game.accent, 0.25)}`,
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: av(game.accent) }} />
                    </div>
                    <span
                      className="terminal-text text-xs"
                      style={{
                        color: av(game.accent),
                        borderColor: ava(game.accent, 0.25),
                        background: ava(game.accent, 0.06),
                      }}
                    >
                      {game.difficulty}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="text-xs font-space-grotesk uppercase tracking-widest mb-1 text-neutral-60">
                    {game.subtitle}
                  </p>
                  <h2 className="font-space-grotesk font-bold text-2xl mb-3 text-neutral-90 group-hover:text-neutral-100 transition-colors">
                    {game.title}
                  </h2>

                  <p className="text-neutral-70 text-sm leading-relaxed mb-6">{game.description}</p>

                  {/* Controls */}
                  <div className="mb-5">
                    <p className="text-xs text-neutral-60 uppercase tracking-wider mb-2">
                      Controls
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {game.controls.map((c) => (
                        <span
                          key={c}
                          className="text-xs px-2 py-1 rounded-sm glass border border-white/10 text-neutral-70"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tech */}
                  <div className="mb-6">
                    <p className="text-xs text-neutral-60 uppercase tracking-wider mb-2">
                      Built With
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {game.tech.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-1 rounded-sm"
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
                    className="flex items-center gap-2 text-xs font-space-grotesk font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform duration-300"
                    style={{ color: av(game.accent) }}
                  >
                    <span>&gt; Play Now</span>
                  </div>
                </div>

                {/* Bottom line */}
                <div
                  className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
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
      <div className="mt-12 text-center animate-fade-in [animation-delay:600ms]">
        <p className="text-neutral-60 text-xs font-space-grotesk uppercase tracking-widest">
          All games built with zero game engines — pure web APIs &amp; React
        </p>
      </div>
    </>
  );
}
