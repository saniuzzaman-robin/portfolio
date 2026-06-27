'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Briefcase, MapPin } from 'lucide-react';
import { CV_DATA } from '@/lib/cv-data';
import { av, ava, type AccentToken } from '@/lib/accent';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion-wrapper';
import { SectionHeader } from '@/components/ui/section-header';

function TimelineDot({ accent }: { accent: string }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="h-4 w-4 rounded-full border-2" style={{ borderColor: accent, background: 'var(--color-neutral-5)' }} />
      <div
        className="absolute h-8 w-8 animate-ping rounded-full opacity-20"
        style={{ backgroundColor: accent, animationDuration: '3s' }}
      />
    </div>
  );
}

function JobCard({ job, index }: { job: typeof CV_DATA.experience[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const accent = av(job.accent as AccentToken);
  const accentA = (a: number) => ava(job.accent as AccentToken, a);
  const isLeft = index % 2 === 0;

  return (
    <StaggerItem>
      <div className={`group relative flex ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
        {/* Timeline connector - desktop */}
        <div className="hidden md:block md:w-1/2" />

        {/* Center dot */}
        <div className="absolute top-6 left-5 z-10 md:left-1/2 md:-translate-x-1/2">
          <TimelineDot accent={accent} />
        </div>

        {/* Card */}
        <div className={`ml-14 flex-1 md:ml-0 md:w-1/2 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
          <motion.div
            layout
            className="relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg"
            style={{
              borderColor: expanded ? accentA(0.4) : accentA(0.12),
              background: accentA(0.015),
            }}
          >
            {/* Accent top bar */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${accent}, ${accentA(0.3)})` }} />

            <div className="p-5 md:p-6">
              {/* Header row */}
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-start justify-between gap-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                    <h3 className="font-poppins text-neutral-90 text-lg font-bold md:text-xl">
                      {job.company}
                    </h3>
                  </div>
                  <p className="font-poppins text-sm font-semibold tracking-wide" style={{ color: accent }}>
                    {job.title}
                  </p>
                  <div className="text-neutral-50 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.duration}
                    </span>
                    <span>{job.period.replace(' -', ' –')}</span>
                  </div>
                </div>

                {/* Expand/collapse */}
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 shrink-0"
                  style={{ color: accent }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>

              {/* Description */}
              <p className="text-neutral-70 mt-3 text-sm leading-relaxed">
                {job.description}
              </p>

              {/* Expandable achievements */}
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4">
                      {/* Achievements */}
                      {job.achievements && job.achievements.length > 0 && (
                        <div className="mb-4">
                          <p className="font-poppins mb-3 text-[10px] font-bold tracking-widest uppercase" style={{ color: accent }}>
                            Key Impact
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {job.achievements.slice(0, 6).map((ach, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2.5 rounded-lg p-3 text-xs leading-relaxed transition-colors"
                                style={{ background: accentA(0.04) }}
                              >
                                <span className="mt-0.5 shrink-0 text-[10px]" style={{ color: accent }}>
                                  ◆
                                </span>
                                <span className="text-neutral-70">{ach}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.map((skill) => (
                            <span
                              key={skill}
                              className="font-poppins rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase transition-all hover:scale-105"
                              style={{
                                color: accent,
                                background: accentA(0.08),
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom glow line */}
            <div
              className="h-px transition-all duration-500"
              style={{
                background: expanded
                  ? `linear-gradient(to right, ${accent}, ${accentA(0.3)})`
                  : `linear-gradient(to right, ${accentA(0.08)}, transparent)`,
              }}
            />
          </motion.div>
        </div>
      </div>
    </StaggerItem>
  );
}

export function ProfessionalJourney() {
  const jobs = CV_DATA.experience;

  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20">
      {/* Background ambient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary-50/4 absolute top-1/4 left-1/3 h-96 w-96 rounded-full blur-[120px]" />
        <div className="bg-secondary-50/3 absolute bottom-1/3 right-1/4 h-80 w-80 rounded-full blur-[100px]" />
        <div className="bg-tertiary-50/3 absolute -top-10 right-1/3 h-64 w-64 rounded-full blur-[90px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <SectionHeader
          label="Career Timeline"
          title={<>Professional <span className="gradient-text">Journey</span></>}
          description={`${CV_DATA.yearsOfExperience} years of crafting exceptional software experiences across companies and continents`}
        />

        {/* Timeline line */}
        <div className="relative">
          <div
            className="absolute top-0 bottom-0 left-5 w-0.5 md:left-1/2 md:-translate-x-px"
            style={{
              background: 'linear-gradient(to bottom, var(--color-primary-50), var(--color-secondary-50), var(--color-tertiary-50))',
              opacity: 0.15,
            }}
          />

          <StaggerContainer className="space-y-16">
            {jobs.map((job, i) => (
              <JobCard key={i} job={job} index={i} />
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
