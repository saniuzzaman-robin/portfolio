import type { CSSProperties } from 'react';
import { Download, Mail, ExternalLink } from 'lucide-react';
import { CV_DATA } from '@/lib/cv-data';
import { av, ava, type AccentToken } from '@/lib/accent';

const ACCENT_ORDER = ['primary', 'secondary', 'tertiary'] as const;

export function ResumeContent() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20">
      {/* Background */}
      <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-20" />
      <div className="bg-primary-50/3 pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="animate-slide-right mb-16">
          <div className="glass card-shine border-primary-50/15 relative mb-8 overflow-hidden rounded-sm border p-8">
            <div
              className="mb-6 h-px"
              style={{
                background:
                  'linear-gradient(to right, var(--color-primary-50), var(--color-secondary-50), transparent)',
              }}
            />
            <div
              className="pointer-events-none absolute top-0 right-0 h-64 w-64 opacity-[0.04]"
              style={{
                background:
                  'radial-gradient(circle at top right, var(--color-primary-50), transparent 65%)',
              }}
            />

            <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
              <div>
                <h1 className="font-poppins text-neutral-90 mb-2 text-4xl font-bold md:text-5xl">
                  {CV_DATA.name}
                </h1>
                <p className="neon-green font-poppins mb-4 text-base tracking-widest uppercase">
                  {CV_DATA.title}
                </p>
                <div className="text-neutral-60 font-poppins flex flex-wrap gap-5 text-xs lg:text-sm">
                  <span>✉ {CV_DATA.email}</span>
                  <span>☏ {CV_DATA.phone}</span>
                  <span>⊙ {CV_DATA.location}</span>
                </div>
              </div>
              <a
                href="/CV_SANIUZZAMAN_ROBIN.pdf"
                download
                className="btn-neon font-poppins inline-flex shrink-0 items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold tracking-widest uppercase"
              >
                <Download className="h-4 w-4" />
                <span>Download CV</span>
              </a>
            </div>

            <p className="text-neutral-70 relative z-10 mt-6 max-w-3xl text-sm leading-relaxed">
              {CV_DATA.summary}
            </p>
          </div>
        </div>

        {/* ── Experience ───────────────────────────────────────── */}
        <div className="animate-slide-up mb-16 [animation-delay:100ms]">
          <div className="mb-10 flex items-center gap-3">
            <div className="from-primary-50/40 h-px flex-1 bg-linear-to-r to-transparent" />
            <h2 className="font-poppins neon-green text-2xl font-bold tracking-widest uppercase">
              Experience
            </h2>
            <div className="from-primary-50/40 h-px flex-1 bg-linear-to-l to-transparent" />
          </div>

          {/* Timeline */}
          <div className="relative">
            <div
              className="absolute top-0 bottom-0 left-4 w-px"
              style={{
                background:
                  'linear-gradient(to bottom, var(--color-primary-50), var(--color-secondary-50), var(--color-tertiary-50), transparent)',
              }}
            />

            <div className="space-y-8">
              {CV_DATA.experience.map((exp, index) => {
                const accentToken = ACCENT_ORDER[index % 3];
                const accent = av(accentToken as AccentToken);
                const accentA = (a: number) => ava(accentToken as AccentToken, a);

                return (
                  <div key={index} className="relative pl-12">
                    {/* Node */}
                    <div
                      className="absolute top-5 left-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2"
                      style={{
                        borderColor: accent,
                        backgroundColor: '#080a1a',
                        boxShadow: `0 0 8px ${accent}`,
                      }}
                    >
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                    </div>

                    <div
                      className="glass card-shine group overflow-hidden rounded-sm border-(--rb) transition-all duration-500 hover:border-(--rb-h)"
                      style={{ '--rb': accentA(0.18), '--rb-h': accentA(0.42) } as CSSProperties}
                    >
                      <div
                        className="h-px"
                        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                      />
                      <div
                        className="pointer-events-none absolute top-0 right-0 h-40 w-40 opacity-[0.05] transition-opacity group-hover:opacity-[0.1]"
                        style={{
                          background: `radial-gradient(circle at top right, ${accent}, transparent 65%)`,
                        }}
                      />

                      <div className="relative z-10 p-6">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-poppins text-neutral-90 text-lg font-bold transition-colors group-hover:text-neutral-100">
                              {exp.company}
                            </h3>
                            <p
                              className="font-poppins mt-0.5 text-sm font-bold tracking-wider uppercase"
                              style={{ color: accent }}
                            >
                              {exp.title}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span
                              className="font-poppins rounded-sm px-3 py-1 text-xs font-bold tracking-widest uppercase lg:text-sm"
                              style={{
                                color: accent,
                                border: `1px solid ${accentA(0.28)}`,
                                background: accentA(0.07),
                              }}
                            >
                              {exp.duration}
                            </span>
                            <span className="text-neutral-60 text-xs lg:text-sm">
                              {exp.period.replace(' -', ' –')}
                            </span>
                          </div>
                        </div>

                        <ul className="mb-4 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                          {exp.achievements.map((ach, i) => (
                            <li
                              key={i}
                              className="text-neutral-70 flex items-start gap-2 text-xs leading-relaxed lg:text-sm"
                            >
                              <span className="mt-0.5 shrink-0" style={{ color: accent }}>
                                ▸
                              </span>
                              <span>{ach}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="flex flex-wrap gap-1.5">
                          {exp.skills.map((skill) => (
                            <span
                              key={skill}
                              className="font-poppins rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
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

        {/* ── Technical Skills ─────────────────────────────────── */}
        <div className="animate-slide-up mb-16 [animation-delay:200ms]">
          <div className="mb-10 flex items-center gap-3">
            <div className="from-secondary-50/40 h-px flex-1 bg-linear-to-r to-transparent" />
            <h2 className="font-poppins neon-cyan text-2xl font-bold tracking-widest uppercase">
              Technical Skills
            </h2>
            <div className="from-secondary-50/40 h-px flex-1 bg-linear-to-l to-transparent" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Frontend',
                skills: CV_DATA.skills.frontend,
                accent: 'primary' as AccentToken,
              },
              {
                title: 'Backend',
                skills: CV_DATA.skills.backend,
                accent: 'secondary' as AccentToken,
              },
              {
                title: 'Tools & Others',
                skills: CV_DATA.skills.others,
                accent: 'tertiary' as AccentToken,
              },
            ].map(({ title, skills, accent: accentToken }) => {
              const accent = av(accentToken);
              const accentA = (a: number) => ava(accentToken, a);
              return (
                <div
                  key={title}
                  className="glass rounded-sm border-(--skb) p-6 transition-all duration-300 hover:border-(--skb-h)"
                  style={{ '--skb': accentA(0.18), '--skb-h': accentA(0.42) } as CSSProperties}
                >
                  <div
                    className="mb-4 h-px"
                    style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                  />
                  <p
                    className="font-poppins mb-3 text-xs font-bold tracking-widest uppercase lg:text-sm"
                    style={{ color: accent }}
                  >
                    {title}
                  </p>
                  <p className="text-neutral-70 text-sm leading-relaxed">{skills}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Education & Achievements ─────────────────────────── */}
        <div className="animate-slide-up mb-16 [animation-delay:300ms]">
          <div className="mb-10 flex items-center gap-3">
            <div className="from-tertiary-50/40 h-px flex-1 bg-linear-to-r to-transparent" />
            <h2 className="font-poppins neon-purple text-2xl font-bold tracking-widest uppercase">
              Education & CP
            </h2>
            <div className="from-tertiary-50/40 h-px flex-1 bg-linear-to-l to-transparent" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {CV_DATA.education.map((edu, i) => (
              <div
                key={i}
                className="glass border-primary-50/15 hover:border-primary-50/38 rounded-sm border p-6 transition-all duration-300"
              >
                <div className="from-primary-50/50 mb-4 h-px bg-linear-to-r to-transparent" />
                <h3 className="font-poppins text-neutral-90 mb-1 text-base font-bold">
                  {edu.degree}
                </h3>
                <p className="text-primary-50 font-poppins mb-1 text-xs font-bold tracking-wider uppercase lg:text-sm">
                  {edu.institution}
                </p>
                <p className="text-neutral-60 text-xs lg:text-sm">
                  {edu.period} · {edu.location}
                </p>
              </div>
            ))}
            <div className="glass border-secondary-50/15 hover:border-secondary-50/38 rounded-sm border p-6 transition-all duration-300">
              <div className="from-secondary-50/50 mb-4 h-px bg-linear-to-r to-transparent" />
              <h3 className="font-poppins text-neutral-90 mb-3 text-base font-bold">
                Competitive Programming
              </h3>
              <ul className="space-y-1.5">
                {CV_DATA.competitiveProgramming.achievements.map((a, i) => (
                  <li key={i} className="text-neutral-70 flex items-start gap-2 text-xs lg:text-sm">
                    <span className="text-secondary-50 mt-0.5 shrink-0">▸</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass border-tertiary-50/15 hover:border-tertiary-50/38 rounded-sm border p-6 transition-all duration-300">
              <div className="from-tertiary-50/50 mb-4 h-px bg-linear-to-r to-transparent" />
              <h3 className="font-poppins text-neutral-90 mb-2 text-base font-bold">
                {CV_DATA.problemSetting.title}
              </h3>
              <p className="text-neutral-70 text-xs leading-relaxed lg:text-sm">
                {CV_DATA.problemSetting.description}
              </p>
            </div>
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <div className="glass border-primary-50/20 hover:border-primary-50/40 animate-scale-in relative overflow-hidden rounded-sm border p-10 text-center transition-all duration-300 [animation-delay:400ms]">
          <div
            className="mb-8 h-px"
            style={{
              background:
                'linear-gradient(to right, transparent, var(--color-primary-50), var(--color-secondary-50), transparent)',
            }}
          />
          <h3 className="font-poppins text-neutral-90 mb-3 text-2xl font-bold">
            Ready to work together?
          </h3>
          <p className="text-neutral-70 mx-auto mb-8 max-w-md text-sm">
            Let's connect and discuss how I can contribute to your next project.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:saniuzzamanrobin07@gmail.com"
              className="btn-neon font-poppins inline-flex items-center gap-2 rounded-lg px-8 py-3 text-sm font-bold tracking-widest uppercase"
            >
              <Mail className="h-4 w-4" />
              Get In Touch
            </a>
            <a
              href="https://linkedin.com/in/saniuzzaman-robin"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 hover:bg-secondary-50/10 border-white/10 hover:border-secondary-50/30 font-poppins inline-flex items-center gap-2 rounded-lg border px-8 py-3 text-sm font-bold tracking-widest uppercase text-neutral-70 transition-all duration-300 hover:text-neutral-90"
            >
              <ExternalLink className="h-4 w-4" />
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
