'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { FEATURED_PROJECTS } from '@/lib/data/featured-projects';
import { av, ava } from '@/lib/accent';

export function FeaturedProjects() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 relative cyber-grid-dense">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="section-label mb-3 animate-fade-in">Featured Project</p>
          <div className="flex items-end justify-between flex-wrap gap-6">
            <h2 className="font-space-grotesk font-bold text-4xl md:text-5xl animate-slide-up [animation-delay:100ms]">
              MuslimPro <span className="neon-cyan">Web Platform</span>
            </h2>
            <div className="glass border border-primary-50/20 px-4 py-2 rounded-sm animate-fade-in [animation-delay:200ms]">
              <span className="text-xs font-space-grotesk text-primary-50 uppercase tracking-widest">
                3M+ Daily Users
              </span>
            </div>
          </div>
          <p className="text-neutral-70 max-w-2xl mt-4 text-sm leading-relaxed animate-slide-up [animation-delay:200ms]">
            Engineered verified prayer times engine serving 1M+ daily hits. Built comprehensive
            Islamic tools recognized as the most accurate Muslim lifestyle app worldwide.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_PROJECTS.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div
                className="relative h-full glass rounded-sm border transition-all duration-500 overflow-hidden animate-scale-in hover:scale-[1.03]"
                style={{
                  borderColor: ava(feature.accent, 0.19),
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = ava(feature.accent, 0.44);
                  el.style.boxShadow = `0 0 20px ${ava(feature.accent, 0.15)}, 0 0 40px ${ava(feature.accent, 0.06)}`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = ava(feature.accent, 0.19);
                  el.style.boxShadow = '';
                }}
              >
                {/* Holographic hover overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 holographic pointer-events-none" />

                {/* Number watermark */}
                <div
                  className="absolute top-3 right-4 font-space-grotesk font-bold text-4xl opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ color: av(feature.accent) }}
                >
                  {feature.number}
                </div>

                <div className="relative z-10 p-6">
                  {/* Tag */}
                  <span
                    className="terminal-text text-xs mb-4 inline-block"
                    style={{
                      color: av(feature.accent),
                      borderColor: ava(feature.accent, 0.25),
                      backgroundColor: ava(feature.accent, 0.06),
                    }}
                  >
                    {feature.tag}
                  </span>

                  {/* Title */}
                  <h3 className="font-space-grotesk font-bold text-lg mb-3 text-neutral-90 group-hover:text-neutral-100 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-neutral-70 text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Link indicator */}
                  <div
                    className="flex items-center gap-2 text-xs font-space-grotesk uppercase tracking-widest transition-all duration-300 group-hover:translate-x-1"
                    style={{ color: av(feature.accent) }}
                  >
                    <span>Explore</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                  style={{
                    background: `linear-gradient(to right, ${av(feature.accent)}, transparent)`,
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
