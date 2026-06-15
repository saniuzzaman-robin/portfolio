import type { CSSProperties } from 'react';
import { CV_DATA } from '@/lib/cv-data';
import { av, ava, type AccentToken } from '@/lib/accent';

export function ProfessionalJourney() {
  const jobs = CV_DATA.experience;

  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20">
      {/* Background */}
      <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-20" />
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary-50/3 absolute top-0 right-0 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-tertiary-50/3 absolute bottom-0 left-0 h-96 w-96 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Header */}
        <div className="animate-slide-right mb-20">
          <p className="section-label mb-3">Experience</p>
          <h2 className="font-poppins text-4xl font-bold md:text-5xl">
            Professional <span className="neon-green">Journey</span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical spine — left-aligned */}
          <div
            className="absolute top-0 bottom-0 left-4 w-px md:left-6"
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
                  className="animate-slide-up relative pl-14 md:pl-20"
                  style={{ animationDelay: `${index * 120}ms`, animationFillMode: 'both' }}
                >
                  {/* Timeline node */}
                  <div
                    className="animate-glow absolute top-5 left-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 md:left-3.5"
                    style={{
                      borderColor: accent,
                      backgroundColor: '#080d1a',
                      boxShadow: `0 0 10px ${accent}, 0 0 24px ${accentA(0.25)}`,
                    }}
                  >
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                  </div>

                  {/* Card */}
                  <div
                    className="glass card-shine group overflow-hidden rounded-sm border-(--jb) transition-all duration-500 hover:border-(--jb-h)"
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
                      className="pointer-events-none absolute top-0 right-0 h-48 w-48 opacity-[0.05] transition-opacity duration-500 group-hover:opacity-[0.12]"
                      style={{
                        background: `radial-gradient(circle at top right, ${accent}, transparent 65%)`,
                      }}
                    />

                    <div className="relative z-10 p-6 md:p-8">
                      {/* Header row */}
                      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="font-poppins text-neutral-90 mb-1 text-xl font-bold transition-colors group-hover:text-neutral-100 md:text-2xl">
                            {job.company}
                          </h3>
                          <p
                            className="font-poppins text-sm font-bold tracking-wider uppercase"
                            style={{ color: accent }}
                          >
                            {job.title}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <span
                            className="font-poppins rounded-sm px-3 py-1 text-xs font-bold tracking-widest uppercase lg:text-sm"
                            style={{
                              color: accent,
                              border: `1px solid ${accentA(0.3)}`,
                              background: accentA(0.07),
                            }}
                          >
                            {job.duration}
                          </span>
                          <span className="text-neutral-60 font-poppins text-xs lg:text-sm">
                            {job.period.replace(' -', ' –')}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-neutral-70 mb-6 text-sm leading-relaxed">
                        {job.descriptionLong}
                      </p>

                      {/* Key achievements */}
                      <div className="mb-6">
                        <p
                          className="font-poppins mb-3 text-[10px] font-bold tracking-widest uppercase"
                          style={{ color: accent }}
                        >
                          Key Contributions
                        </p>
                        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                          {job.achievements.slice(0, 6).map((ach, i) => (
                            <li
                              key={i}
                              className="text-neutral-70 flex items-start gap-2 text-xs leading-relaxed lg:text-sm"
                            >
                              <span
                                className="mt-0.5 shrink-0 text-[10px]"
                                style={{ color: accent }}
                              >
                                ▸
                              </span>
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
                            className="font-poppins rounded-sm px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase"
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
                      className="h-px w-0 transition-all duration-700 group-hover:w-full"
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
