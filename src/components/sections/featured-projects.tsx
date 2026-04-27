'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function FeaturedProjects() {
  const features = [
    {
      title: 'Prayer Times',
      description:
        'Verified prayer times with geolocation accuracy, Qibla direction, and real-time Adhan notifications',
      href: 'https://app.muslimpro.com/prayer-times',
      tag: 'Geolocation + API',
      accent: '#00ff87',
      number: '01',
    },
    {
      title: 'Islamic Calendar',
      description:
        'Complete Islamic calendar with Hijri dates, Islamic events, and festival schedules',
      href: 'https://app.muslimpro.com/islamic-calendar',
      tag: 'Date Systems',
      accent: '#00d4ff',
      number: '02',
    },
    {
      title: 'Giving Platform',
      description:
        'Charitable giving platform for Badal Hajj, Quranic donations, and community support',
      href: 'https://app.muslimpro.com/giving',
      tag: 'FinTech + UX',
      accent: '#a476ff',
      number: '03',
    },
    {
      title: 'Qalbox',
      description:
        'Video streaming platform with Quranic recitations, tafsir, hadith studies, and Arabic lessons',
      href: 'https://app.muslimpro.com/qalbox',
      tag: 'Streaming + Media',
      accent: '#00ff87',
      number: '04',
    },
  ];

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
                9.7M Daily Users
              </span>
            </div>
          </div>
          <p className="text-neutral-70 max-w-2xl mt-4 text-sm leading-relaxed animate-slide-up [animation-delay:200ms]">
            Engineered verified prayer times engine serving 180M+ downloads. Built comprehensive
            Islamic tools recognized as the most accurate Muslim lifestyle app worldwide.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
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
                  borderColor: `${feature.accent}30`,
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = `${feature.accent}70`;
                  el.style.boxShadow = `0 0 20px ${feature.accent}25, 0 0 40px ${feature.accent}10`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = `${feature.accent}30`;
                  el.style.boxShadow = '';
                }}
              >
                {/* Holographic hover overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 holographic pointer-events-none" />

                {/* Number watermark */}
                <div
                  className="absolute top-3 right-4 font-space-grotesk font-bold text-4xl opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ color: feature.accent }}
                >
                  {feature.number}
                </div>

                <div className="relative z-10 p-6">
                  {/* Tag */}
                  <span
                    className="terminal-text text-xs mb-4 inline-block"
                    style={{
                      color: feature.accent,
                      borderColor: `${feature.accent}40`,
                      backgroundColor: `${feature.accent}10`,
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
                    style={{ color: feature.accent }}
                  >
                    <span>Explore</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                  style={{
                    background: `linear-gradient(to right, ${feature.accent}, transparent)`,
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
