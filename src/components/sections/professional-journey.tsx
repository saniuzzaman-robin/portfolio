import type { CSSProperties } from 'react';
import { CV_DATA } from '@/lib/cv-data';
import { av, ava, type AccentToken } from '@/lib/accent';

export function ProfessionalJourney() {
  const jobs = CV_DATA.experience;

  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 cyber-grid-dense opacity-20 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary-50/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-20 animate-slide-right">
          <p className="section-label mb-3">Experience</p>
          <h2 className="font-space-grotesk text-4xl md:text-5xl font-bold">
            Professional <span className="neon-green">Journey</span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical spine — left-aligned */}
          <div
            className="absolute left-4 md:left-6 top-0 bottom-0 w-px"
            style={{
              background:
                'linear-gradient(to bottom, var(--color-primary-50), var(--color-secondary-50), var(--color-tertiary-50), transparent)',
            }}
          />

          <div className="space-y-12">
            {jobs.map((job, index) => {
              const accent = av(job.accent as AccentToken);
              const accentA = (a: number) => ava(job.accent as AccentToken, a);

              return (
                <div
                  key={index}
                  className="relative pl-14 md:pl-20 animate-slide-up"
                  style={{ animationDelay: `${index * 120}ms`, animationFillMode: 'both' }}
                >
                  {/* Timeline node */}
                  <div
                    className="absolute left-1.5 md:left-3.5 top-5 w-5 h-5 rounded-full border-2 animate-glow z-10 flex items-center justify-center"
                    style={{
                      borderColor: accent,
                      backgroundColor: '#080d1a',
                      boxShadow: `0 0 10px ${accent}, 0 0 24px ${accentA(0.25)}`,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                  </div>

                  {/* Card */}
                  <div
                    className="glass card-shine rounded-sm border-(--jb) hover:border-(--jb-h) transition-all duration-500 group overflow-hidden"
                    style={
                      {
                        '--jb': accentA(0.18),
                        '--jb-h': accentA(0.45),
                      } as CSSProperties
                    }
                  >
                    {/* Top gradient bar */}
                    <div
                      className="h-px"
                      style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                    />

                    {/* Corner glow */}
                    <div
                      className="absolute top-0 right-0 w-48 h-48 opacity-[0.05] group-hover:opacity-[0.12] transition-opacity duration-500 pointer-events-none"
                      style={{ background: `radial-gradient(circle at top right, ${accent}, transparent 65%)` }}
                    />

                    <div className="relative z-10 p-6 md:p-8">
                      {/* Header row */}
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                        <div>
                          <h3 className="font-space-grotesk font-bold text-xl md:text-2xl text-neutral-90 group-hover:text-neutral-100 transition-colors mb-1">
                            {job.company}
                          </h3>
                          <p
                            className="text-sm font-space-grotesk font-bold uppercase tracking-wider"
                            style={{ color: accent }}
                          >
                            {job.title}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span
                            className="text-xs font-space-grotesk font-bold px-3 py-1 rounded-sm uppercase tracking-widest"
                            style={{
                              color: accent,
                              border: `1px solid ${accentA(0.3)}`,
                              background: accentA(0.07),
                            }}
                          >
                            {job.duration}
                          </span>
                          <span className="text-neutral-60 text-xs font-space-grotesk">
                            {job.period.replace(' -', ' –')}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-neutral-70 text-sm leading-relaxed mb-6">
                        {job.descriptionLong}
                      </p>

                      {/* Key achievements */}
                      <div className="mb-6">
                        <p
                          className="text-[10px] uppercase tracking-widest font-space-grotesk font-bold mb-3"
                          style={{ color: accent }}
                        >
                          Key Contributions
                        </p>
                        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                          {job.achievements.slice(0, 6).map((ach, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-neutral-70 leading-relaxed">
                              <span className="mt-0.5 shrink-0 text-[10px]" style={{ color: accent }}>▸</span>
                              <span>{ach}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tech stack */}
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] px-2.5 py-0.5 font-space-grotesk font-bold uppercase tracking-wide rounded-sm"
                            style={{
                              color: accent,
                              border: `1px solid ${accentA(0.22)}`,
                              background: accentA(0.05),
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom sweep */}
                    <div
                      className="h-px w-0 group-hover:w-full transition-all duration-700"
                      style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
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
