'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Briefcase, MapPin } from 'lucide-react';
import { CV_DATA } from '@/lib/cv-data';
import { av, ava, type AccentToken } from '@/lib/accent';
import { SectionHeader } from '@/components/ui/section-header';

function JobCard({ job }: { job: (typeof CV_DATA.experience)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const accent = av(job.accent as AccentToken);
  const accentA = (a: number) => ava(job.accent as AccentToken, a);

  return (
    <div
      className="glass overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="p-6">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-start justify-between gap-4 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Briefcase className="h-4 w-4 shrink-0" style={{ color: accent }} />
              <h3 className="text-midnight-950 text-lg font-bold">{job.company}</h3>
            </div>
            <p className="text-sm font-semibold" style={{ color: accent }}>
              {job.title}
            </p>
            <div className="text-midnight-500 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.duration}
              </span>
              <span>{job.period.replace(' -', ' –')}</span>
            </div>
          </div>

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
        <p className="text-midnight-500 mt-3 text-sm leading-relaxed">{job.description}</p>

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
                {job.achievements && job.achievements.length > 0 && (
                  <div className="mb-4">
                    <p className="text-midnight-500 mb-3 text-xs font-semibold tracking-wider uppercase">
                      Key Impact
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {job.achievements.slice(0, 6).map((ach, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 rounded-xl p-3 text-xs leading-relaxed"
                          style={{ background: accentA(0.04) }}
                        >
                          <span className="mt-0.5 shrink-0 text-[10px]" style={{ color: accent }}>
                            ◆
                          </span>
                           <span className="text-midnight-500">{ach}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium transition-all hover:scale-105"
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
            : `linear-gradient(to right, ${accentA(0.1)}, transparent)`,
        }}
      />
    </div>
  );
}

export function ProfessionalJourney() {
  const jobs = CV_DATA.experience;

  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="aurora-blob aurora-blob-primary absolute top-1/4 left-1/3 h-100 w-100 opacity-10" />
        <div
          className="aurora-blob aurora-blob-secondary absolute right-1/4 bottom-1/3 h-87.5 w-87.5 opacity-10"
          style={{ animationDelay: '-6s' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <SectionHeader
          label="Career Timeline"
          title={
            <>
              Professional <span className="gradient-text">Journey</span>
            </>
          }
          description={`${CV_DATA.yearsOfExperience} years of crafting exceptional software experiences across companies and continents`}
        />

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute top-0 bottom-0 left-5.5 w-0.5 md:left-1/2 md:-translate-x-px"
            style={{
              background:
                'linear-gradient(to bottom, var(--color-primary-40), var(--color-secondary-50), var(--color-tertiary-40))',
              opacity: 0.2,
            }}
          />

          <div className="space-y-12">
            {jobs.map((job, i) => {
              const accent = av(job.accent as AccentToken);
              return (
                <div key={i} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute top-8 left-4.5 z-10 md:left-1/2 md:-translate-x-1/2">
                    <div className="relative">
                      <div
                        className="h-3 w-3 rounded-full border-2"
                        style={{ borderColor: accent, background: 'var(--surface-bg, #0f172a)' }}
                      />
                      <div
                        className="absolute inset-0 h-3 w-3 animate-ping rounded-full opacity-20"
                        style={{ backgroundColor: accent, animationDuration: '3s' }}
                      />
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}
                  >
                    <JobCard job={job} />
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
