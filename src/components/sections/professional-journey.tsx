'use client';

import { useState } from 'react';
import { CV_DATA } from '@/lib/cv-data';
import { av, ava, type AccentToken } from '@/lib/accent';

export function ProfessionalJourney() {
  const jobs = CV_DATA.experience;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20">
      {/* Enhanced Background */}
      <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-10" />
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary-50/5 animate-pulse-slow absolute top-20 right-10 h-150 w-150 rounded-full blur-[120px]" />
        <div
          className="bg-secondary-50/5 animate-pulse-slow absolute top-1/2 left-1/4 h-100 w-100 rounded-full blur-[100px]"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="bg-tertiary-50/5 animate-pulse-slow absolute bottom-20 left-10 h-125 w-125 rounded-full blur-[110px]"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="animate-slide-right mb-16 text-center">
          <p className="section-label mb-4">Career Timeline</p>
          <h2 className="font-poppins text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
            Professional <span className="neon-green">Journey</span>
          </h2>
          <p className="text-neutral-60 mx-auto mt-4 max-w-2xl text-sm md:text-base">
            {CV_DATA.yearsOfExperience} years of crafting exceptional software experiences
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Central Timeline Spine */}
          <div
            className="absolute top-0 bottom-0 left-8 hidden w-0.5 md:left-1/2 md:block"
            style={{
              background:
                'linear-gradient(to bottom, var(--color-primary-50), var(--color-secondary-50), var(--color-tertiary-50), var(--color-primary-50))',
              opacity: 0.3,
            }}
          />

          {/* Mobile Timeline Spine */}
          <div
            className="absolute top-0 bottom-0 left-8 w-0.5 md:hidden"
            style={{
              background:
                'linear-gradient(to bottom, var(--color-primary-50), var(--color-secondary-50), var(--color-tertiary-50))',
              opacity: 0.3,
            }}
          />

          <div className="space-y-16 md:space-y-24">
            {jobs.map((job, index) => {
              const accent = av(job.accent as AccentToken);
              const accentA = (a: number) => ava(job.accent as AccentToken, a);
              const isExpanded = expandedIndex === index;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`animate-slide-up relative ${
                    isEven ? 'md:pr-[calc(50%+3rem)] md:text-right' : 'md:pl-[calc(50%+3rem)]'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  {/* Timeline Node - Desktop (center) */}
                  <div
                    className="absolute top-8 left-6 z-20 hidden h-8 w-8 items-center justify-center rounded-full border-2 md:left-[calc(50%-1rem)] md:flex"
                    style={{
                      borderColor: accent,
                      backgroundColor: '#080d1a',
                      boxShadow: `0 0 20px ${accentA(0.4)}, 0 0 40px ${accentA(0.2)}`,
                    }}
                  >
                    <div
                      className="h-3 w-3 animate-pulse rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                  </div>

                  {/* Timeline Node - Mobile (left) */}
                  <div
                    className="absolute top-8 left-6 z-20 flex h-6 w-6 items-center justify-center rounded-full border-2 md:hidden"
                    style={{
                      borderColor: accent,
                      backgroundColor: '#080d1a',
                      boxShadow: `0 0 15px ${accentA(0.3)}`,
                    }}
                  >
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
                  </div>

                  {/* Card */}
                  <div
                    className={`glass group relative ml-20 overflow-hidden rounded-lg border transition-all duration-500 md:ml-0 ${
                      isExpanded ? 'shadow-2xl' : ''
                    }`}
                    style={{
                      borderColor: isExpanded ? accentA(0.5) : accentA(0.2),
                      boxShadow: isExpanded ? `0 0 40px ${accentA(0.15)}` : 'none',
                    }}
                  >
                    {/* Animated Border Glow */}
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        background: `linear-gradient(135deg, ${accentA(0.1)}, transparent, ${accentA(0.1)})`,
                        backgroundSize: '200% 200%',
                        animation: 'gradient-shift 3s ease infinite',
                      }}
                    />

                    {/* Top Accent Bar */}
                    <div
                      className="h-1"
                      style={{
                        background: `linear-gradient(to right, ${accent}, ${accentA(0.5)}, transparent)`,
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10 p-6 md:p-8">
                      {/* Header */}
                      <button
                        onClick={() => setExpandedIndex(isExpanded ? null : index)}
                        className="group/header w-full text-left transition-transform duration-300 active:scale-[0.99]"
                      >
                        <div
                          className={`flex items-start justify-between gap-4 ${isEven ? 'md:flex-row-reverse' : ''}`}
                        >
                          <div className={`flex-1 ${isEven ? 'md:text-right' : ''}`}>
                            <div className="flex items-center gap-3">
                              {!isEven && (
                                <div
                                  className="hidden h-px w-12 md:block"
                                  style={{
                                    background: `linear-gradient(to right, ${accent}, transparent)`,
                                  }}
                                />
                              )}
                              <h3 className="font-poppins text-neutral-90 text-2xl font-bold transition-all duration-300 group-hover/header:text-neutral-100 md:text-3xl">
                                {job.company}
                              </h3>
                              {isEven && (
                                <div
                                  className="hidden h-px w-12 md:block"
                                  style={{
                                    background: `linear-gradient(to left, ${accent}, transparent)`,
                                  }}
                                />
                              )}
                            </div>
                            <p
                              className="font-poppins mt-2 text-sm font-bold tracking-wide uppercase md:text-base"
                              style={{ color: accent }}
                            >
                              {job.title}
                            </p>
                          </div>

                          <div
                            className={`flex shrink-0 flex-col gap-2 ${isEven ? 'md:items-start' : 'md:items-end'}`}
                          >
                            <span
                              className="font-poppins rounded-md px-4 py-1.5 text-xs font-bold tracking-widest uppercase shadow-lg"
                              style={{
                                color: accent,
                                border: `1px solid ${accentA(0.4)}`,
                                background: accentA(0.1),
                                boxShadow: `0 0 20px ${accentA(0.15)}`,
                              }}
                            >
                              {job.duration}
                            </span>
                            <span className="text-neutral-60 font-poppins text-xs">
                              {job.period.replace(' -', ' –')}
                            </span>
                          </div>
                        </div>
                      </button>

                      {/* Expandable Content */}
                      <div
                        className="overflow-hidden transition-all duration-500 ease-in-out"
                        style={{
                          maxHeight: isExpanded ? '2000px' : '0px',
                          opacity: isExpanded ? 1 : 0,
                        }}
                      >
                        <div className="space-y-6 pt-6">
                          {/* Description */}
                          {job.descriptionLong && (
                            <div
                              className={`animate-slide-up border-l-2 pl-4 ${isEven ? 'md:border-r-2 md:border-l-0 md:pr-4 md:pl-0 md:text-right' : ''}`}
                              style={{
                                borderColor: accentA(0.3),
                                animationDelay: '100ms',
                              }}
                            >
                              <p className="text-neutral-70 leading-relaxed">
                                {job.descriptionLong}
                              </p>
                            </div>
                          )}

                          {/* Key Achievements */}
                          {job.achievements && job.achievements.length > 0 && (
                            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                              <div
                                className={`mb-4 flex items-center gap-3 ${isEven ? 'md:justify-end' : ''}`}
                              >
                                <div
                                  className="h-px w-8"
                                  style={{ backgroundColor: accentA(0.4) }}
                                />
                                <p
                                  className="font-poppins text-xs font-bold tracking-widest uppercase"
                                  style={{ color: accent }}
                                >
                                  Key Impact
                                </p>
                                <div
                                  className="h-px w-8"
                                  style={{ backgroundColor: accentA(0.4) }}
                                />
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {job.achievements.slice(0, 6).map((ach, i) => (
                                  <div
                                    key={i}
                                    className={`glass text-neutral-70 group/item flex items-start gap-3 rounded-md border p-3 text-sm transition-all duration-300 hover:scale-[1.02] ${
                                      isEven ? 'md:flex-row-reverse md:text-right' : ''
                                    }`}
                                    style={{
                                      borderColor: accentA(0.15),
                                      background: accentA(0.03),
                                    }}
                                  >
                                    <span
                                      className="mt-1 shrink-0 text-xs transition-transform duration-300 group-hover/item:scale-125"
                                      style={{ color: accent }}
                                    >
                                      ◆
                                    </span>
                                    <span className="leading-relaxed">{ach}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tech Stack */}
                          {job.skills && job.skills.length > 0 && (
                            <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                              <div
                                className={`flex flex-wrap gap-2 ${isEven ? 'md:justify-end' : ''}`}
                              >
                                {job.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="font-poppins group/skill rounded-md px-3 py-1.5 text-xs font-bold tracking-wide uppercase transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                    style={{
                                      color: accent,
                                      border: `1px solid ${accentA(0.25)}`,
                                      background: accentA(0.08),
                                    }}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expand Indicator */}
                      <div
                        className={`mt-4 flex items-center gap-2 ${isEven ? 'md:justify-end' : ''}`}
                      >
                        <button
                          onClick={() => setExpandedIndex(isExpanded ? null : index)}
                          className="text-neutral-60 hover:text-neutral-90 flex items-center gap-2 text-xs font-medium transition-all duration-300"
                          style={{
                            color: isExpanded ? accent : undefined,
                          }}
                        >
                          <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
                          <svg
                            className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Glow */}
                    <div
                      className="h-px transition-all duration-700"
                      style={{
                        background: isExpanded
                          ? `linear-gradient(to right, ${accent}, ${accentA(0.5)}, ${accent})`
                          : `linear-gradient(to right, transparent, ${accentA(0.3)}, transparent)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
