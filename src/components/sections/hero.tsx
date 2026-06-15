'use client';

import Link from 'next/link';
import { TypewriterText } from '../reusable/typewriter-text';
import dynamic from 'next/dynamic';

const OrbitalVisualization = dynamic(
  () => import('../reusable/orbital-visualization').then((m) => m.OrbitalVisualization),
  { ssr: false }
);

const ParticleCanvas = dynamic(
  () => import('../reusable/particle-canvas').then((m) => m.ParticleCanvas),
  { ssr: false }
);

export function Hero() {
  return (
    <section className="cyber-grid relative flex min-h-dvh items-center overflow-hidden">
      {/* Particle Background */}
      <div className="absolute inset-0 z-0">
        <ParticleCanvas className="opacity-70" />
      </div>

      {/* Radial gradient overlays */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-primary-50/5 absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-secondary-50/5 absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-tertiary-50/5 absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 py-32 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          {/* Left — Text Content */}
          <div>
            {/* Terminal-style label */}
            <div className="animate-slide-down mb-8 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="bg-primary-50 h-3 w-3 rounded-full" />
              </div>
              <span className="terminal-text text-xs lg:text-sm">
                ~/saniuzzaman &gt;&gt; init portfolio.exe
              </span>
            </div>

            {/* Name with glitch effect */}
            <div className="animate-slide-up mb-6 [animation-delay:100ms]">
              <h1
                className="glitch font-poppins text-neutral-90 text-5xl leading-none font-bold tracking-tight md:text-7xl lg:text-8xl"
                data-text="SANIUZZAMAN"
              >
                SANIUZZAMAN
              </h1>
              <h2 className="font-poppins neon-green animate-slide-up mt-2 text-4xl font-bold [animation-delay:200ms] md:text-5xl lg:text-6xl">
                ROBIN
              </h2>
            </div>

            {/* Typewriter role */}
            <div className="animate-fade-in mb-8 flex h-10 items-center [animation-delay:400ms]">
              <TypewriterText
                texts={[
                  'Full-Stack Software Engineer',
                  'NestJS & Next.js Specialist',
                  'Angular Architecture Expert',
                  'Competitive Programmer',
                  'System Design Enthusiast',
                ]}
                className="font-poppins neon-cyan text-lg font-semibold md:text-2xl"
                cursorClassName="neon-cyan"
                speed={70}
                deleteSpeed={35}
                pause={1800}
              />
            </div>

            {/* Stats bar */}
            <div className="animate-fade-in mb-10 flex flex-wrap gap-3 [animation-delay:600ms]">
              {[
                { n: '5+', l: 'Years Exp.', color: 'var(--color-primary-50)' },
                { n: '1700+', l: 'Problems Solved', color: 'var(--color-secondary-50)' },
                { n: '30%', l: 'YoY Donation Growth', color: 'var(--color-tertiary-50)' },
              ].map((s, i) => (
                <div
                  key={s.l}
                  className="game-stat animate-slide-up text-center"
                  style={{ animationDelay: `${600 + i * 100}ms`, animationFillMode: 'both' }}
                >
                  <span className="game-stat-value" style={{ color: s.color }}>
                    {s.n}
                  </span>
                  <span className="game-stat-label">{s.l}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="animate-slide-up flex flex-wrap gap-4 [animation-delay:700ms]">
              <Link
                href="/projects"
                className="btn-neon-green font-poppins rounded-sm px-8 py-3 text-sm font-bold tracking-widest uppercase"
              >
                &gt; View Portfolio
              </Link>
              <Link
                href="/games"
                className="btn-neon-cyan font-poppins rounded-sm px-8 py-3 text-sm font-bold tracking-widest uppercase"
              >
                &gt; Play Games
              </Link>
              <Link
                href="/resume"
                className="glass border-neutral-30 font-poppins text-neutral-70 hover:text-neutral-90 rounded-sm border px-8 py-3 text-sm tracking-widest uppercase transition-colors duration-300 hover:border-neutral-50"
              >
                &gt; Resume
              </Link>
            </div>
          </div>

          {/* Right — 3D Orbital Visualization */}
          <div className="relative hidden h-125 bg-transparent lg:block xl:h-160">
            <OrbitalVisualization />
          </div>
        </div>

        {/* Scroll indicator — positioned above the ticker strip */}
        <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 animate-bounce flex-col items-center gap-2 opacity-60">
          <span className="text-neutral-60 font-poppins text-xs tracking-widest uppercase lg:text-sm">
            Scroll
          </span>
          <div className="from-primary-50 h-8 w-px bg-linear-to-b to-transparent" />
        </div>
      </div>

      {/* Scrolling tech ticker — sits at the absolute bottom of the hero, below the scroll indicator */}
      <div className="ticker-wrap absolute right-0 bottom-0 left-0 z-10 border-t border-white/5 py-2.5 opacity-40">
        <div className="ticker-track">
          {[
            'Next.js',
            'NestJS',
            'Angular',
            'MongoDB',
            'Redis',
            'TypeScript',
            'GCP',
            'Google Pub/Sub',
            'WooCommerce',
            'SEO',
            'Microservices',
            'CQRS',
            'SAGA',
            'MaxMind GeoIP',
            'React',
            'Tailwind CSS',
            '.NET 6',
            'Jest',
            'Selenium',
            'Next.js',
            'NestJS',
            'Angular',
            'MongoDB',
            'Redis',
            'TypeScript',
            'GCP',
            'Google Pub/Sub',
            'WooCommerce',
            'SEO',
            'Microservices',
            'CQRS',
            'SAGA',
            'MaxMind GeoIP',
            'React',
            'Tailwind CSS',
            '.NET 6',
            'Jest',
            'Selenium',
          ].map((tech, i) => (
            <span
              key={i}
              className="font-poppins text-neutral-60 mx-6 flex shrink-0 items-center gap-3 text-[10px] tracking-widest uppercase"
            >
              <span className="bg-primary-50/60 inline-block h-1 w-1 rounded-full" />
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
