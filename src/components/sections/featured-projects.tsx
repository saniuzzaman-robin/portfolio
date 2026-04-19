'use client';

import Link from 'next/link';
import { Book, Calendar, Heart, Play } from 'lucide-react';

export function FeaturedProjects() {
  const features = [
    {
      icon: Book,
      title: 'Prayer Times',
      description:
        'Verified prayer times with geolocation accuracy, Qibla direction, and real-time Adhan notifications',
      href: 'https://app.muslimpro.com/prayer-times',
      color: 'primary',
      delay: '0ms',
    },
    {
      icon: Calendar,
      title: 'Islamic Calendar',
      description:
        'Complete Islamic calendar with Hijri dates, Islamic events, and festival schedules',
      href: 'https://app.muslimpro.com/islamic-calendar',
      color: 'secondary',
      delay: '100ms',
    },
    {
      icon: Heart,
      title: 'Giving Platform',
      description:
        'Charitable giving platform for Badal Hajj, Quranic donations, and community support',
      href: 'https://app.muslimpro.com/giving',
      color: 'tertiary',
      delay: '200ms',
    },
    {
      icon: Play,
      title: 'Qalbox',
      description:
        'Video streaming platform with Quranic recitations, tafsir, hadith studies, and Arabic lessons',
      href: 'https://app.muslimpro.com/qalbox',
      color: 'primary',
      delay: '300ms',
    },
  ];

  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 bg-neutral-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="text-secondary-50 text-xs uppercase tracking-widest mb-4 font-space-grotesk animate-fade-in">
            Featured Project
          </p>
          <h2 className="font-space-grotesk font-bold text-3xl md:text-4xl mb-4 animate-slide-up [animation-delay:100ms]">
            MuslimPro Web Platform
          </h2>
          <p className="text-neutral-70 max-w-2xl animate-slide-up [animation-delay:200ms]">
            Engineered verified prayer times engine serving 180M+ downloads with
            9.7M daily users. Built comprehensive Islamic tools and charitable
            giving platform recognized as the most accurate Muslim lifestyle app
            worldwide.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Link
                key={index}
                href={feature.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div
                  className={`bg-neutral-5 rounded-2xl p-6 border border-neutral-20 hover:border-neutral-30 transition-all duration-300 h-full animate-scale-in hover:shadow-lg hover:-translate-y-1 will-change-transform`}
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300 will-change-transform">
                    <IconComponent
                      className="w-10 h-10 text-primary-50"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-space-grotesk font-bold text-lg mb-3 text-neutral-90 group-hover:text-primary-50 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-70 text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="inline-flex items-center gap-2 text-primary-50 font-space-grotesk text-xs uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300 will-change-transform">
                    Explore <span>→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
