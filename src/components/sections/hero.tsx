'use client';

import Link from 'next/link';
import { ParticleCanvas } from '../reusable/particle-canvas';
import { TypewriterText } from '../reusable/typewriter-text';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden cyber-grid">
      {/* Particle Background */}
      <div className="absolute inset-0 z-0">
        <ParticleCanvas className="opacity-70" />
      </div>

      {/* Radial gradient overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-50/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-50/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-tertiary-50/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 py-32 md:px-12 lg:px-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Left — Text Content */}
          <div>
            {/* Terminal-style label */}
            <div className="flex items-center gap-3 mb-8 animate-slide-down">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-primary-50" />
              </div>
              <span className="terminal-text text-xs">
                ~/saniuzzaman &gt;&gt; init portfolio.exe
              </span>
            </div>

            {/* Name with glitch effect */}
            <div className="mb-6 animate-slide-up [animation-delay:100ms]">
              <h1
                className="glitch font-space-grotesk font-bold text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight text-neutral-90"
                data-text="SANIUZZAMAN"
              >
                SANIUZZAMAN
              </h1>
              <h2 className="font-space-grotesk font-bold text-4xl md:text-5xl lg:text-6xl mt-2 neon-green animate-slide-up [animation-delay:200ms]">
                ROBIN
              </h2>
            </div>

            {/* Typewriter role */}
            <div className="mb-8 animate-fade-in [animation-delay:400ms] h-10 flex items-center">
              <TypewriterText
                texts={[
                  'Full-Stack Software Engineer',
                  'NestJS & Next.js Specialist',
                  'Angular Architecture Expert',
                  'Competitive Programmer',
                  'System Design Enthusiast',
                ]}
                className="font-space-grotesk text-lg md:text-2xl neon-cyan font-semibold"
                cursorClassName="neon-cyan"
                speed={70}
                deleteSpeed={35}
                pause={1800}
              />
            </div>

            {/* Stats bar */}
            <div className="flex gap-6 mb-10 animate-fade-in [animation-delay:600ms] flex-wrap">
              {[
                { n: '5+', l: 'Years' },
                { n: '1700+', l: 'Problems' },
                { n: '180M+', l: 'Users Reached' },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="font-space-grotesk font-bold text-2xl text-primary-50">{s.n}</div>
                  <div className="text-neutral-60 text-xs uppercase tracking-wider">{s.l}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 flex-wrap animate-slide-up [animation-delay:700ms]">
              <Link
                href="/projects"
                className="btn-neon-green px-8 py-3 rounded-sm font-space-grotesk font-bold text-sm uppercase tracking-widest"
              >
                &gt; View Portfolio
              </Link>
              <Link
                href="/games"
                className="btn-neon-cyan px-8 py-3 rounded-sm font-space-grotesk font-bold text-sm uppercase tracking-widest"
              >
                &gt; Play Games
              </Link>
              <Link
                href="/resume"
                className="glass border border-neutral-30 px-8 py-3 rounded-sm font-space-grotesk text-sm uppercase tracking-widest text-neutral-70 hover:text-neutral-90 hover:border-neutral-50 transition-colors duration-300"
              >
                &gt; Resume
              </Link>
            </div>
          </div>

          {/* Right — 3D Orbital Visualization */}
          <div className="hidden lg:flex items-center justify-center relative h-125 animate-fade-in [animation-delay:300ms]">
            {/* Core sphere */}
            <div className="absolute w-32 h-32 rounded-full glass neon-box-green flex items-center justify-center animate-glow z-10">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-primary-50/30 to-secondary-50/30 flex items-center justify-center">
                <span className="font-space-grotesk font-bold text-2xl neon-green">{'{}'}</span>
              </div>
            </div>

            {/* Orbit ring 1 */}
            <div
              className="absolute w-64 h-64 rounded-full border border-primary-50/20 animate-spin-slow"
              style={{ transformOrigin: 'center' }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary-50 neon-box-green animate-float" />
            </div>

            {/* Orbit ring 2 - tilted */}
            <div
              className="absolute w-80 h-80 rounded-full border border-secondary-50/20"
              style={{
                transform: 'rotateX(70deg) rotateZ(20deg)',
                animation: 'spin-slow 15s linear infinite reverse',
              }}
            >
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-secondary-50"
                style={{ boxShadow: '0 0 10px #00d4ff' }}
              />
            </div>

            {/* Orbit ring 3 - another tilt */}
            <div
              className="absolute w-96 h-96 rounded-full border border-tertiary-50/15"
              style={{
                transform: 'rotateX(40deg) rotateZ(-30deg)',
                animation: 'spin-slow 25s linear infinite',
              }}
            >
              <div
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-tertiary-50"
                style={{ boxShadow: '0 0 10px #a476ff' }}
              />
            </div>

            {/* Floating tech tags */}
            {[
              { label: 'NestJS', top: '10%', left: '60%', color: '#00ff87' },
              { label: 'Next.js', top: '75%', left: '65%', color: '#00d4ff' },
              { label: 'Angular', top: '15%', left: '5%', color: '#a476ff' },
              { label: 'Redis', top: '80%', left: '5%', color: '#00ff87' },
            ].map((tag, i) => (
              <div
                key={tag.label}
                className="absolute terminal-text animate-float"
                style={{
                  top: tag.top,
                  left: tag.left,
                  color: tag.color,
                  animationDelay: `${i * 0.8}s`,
                  fontSize: '0.7rem',
                }}
              >
                {tag.label}
              </div>
            ))}

            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary-50/40" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-secondary-50/40" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-tertiary-50/40" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary-50/40" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-60">
          <span className="text-xs text-neutral-60 uppercase tracking-widest font-space-grotesk">
            Scroll
          </span>
          <div className="w-px h-8 bg-linear-to-b from-primary-50 to-transparent" />
        </div>
      </div>
    </section>
  );
}
