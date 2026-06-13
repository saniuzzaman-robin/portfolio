import type { CSSProperties } from 'react';
import { Download, Mail, ExternalLink } from 'lucide-react';
import { CV_DATA } from '@/lib/cv-data';
import { av, ava, type AccentToken } from '@/lib/accent';

const ACCENT_ORDER = ['primary', 'secondary', 'tertiary'] as const;

export function ResumeContent() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 cyber-grid-dense opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="mb-16 animate-slide-right">
          <div className="glass card-shine rounded-sm border border-primary-50/15 p-8 mb-8 relative overflow-hidden">
            <div
              className="h-px mb-6"
              style={{
                background:
                  'linear-gradient(to right, var(--color-primary-50), var(--color-secondary-50), transparent)',
              }}
            />
            <div
              className="absolute top-0 right-0 w-64 h-64 opacity-[0.04] pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at top right, var(--color-primary-50), transparent 65%)',
              }}
            />

            <div className="relative z-10 flex justify-between items-start flex-wrap gap-6">
              <div>
                <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold mb-2 text-neutral-90">
                  {CV_DATA.name}
                </h1>
                <p className="neon-green font-space-grotesk text-base uppercase tracking-widest mb-4">
                  {CV_DATA.title}
                </p>
                <div className="flex flex-wrap gap-5 text-neutral-60 text-xs font-space-grotesk">
                  <span>✉ {CV_DATA.email}</span>
                  <span>☏ {CV_DATA.phone}</span>
                  <span>⊙ {CV_DATA.location}</span>
                </div>
              </div>
              <a
                href="/CV_SANIUZZAMAN_ROBIN.pdf"
                download
                className="btn-neon-green inline-flex items-center gap-2 px-6 py-3 rounded-sm font-space-grotesk font-bold text-sm uppercase tracking-widest shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download CV</span>
              </a>
            </div>

            <p className="text-neutral-70 text-sm leading-relaxed mt-6 max-w-3xl relative z-10">
              {CV_DATA.summary}
            </p>
          </div>
        </div>

        {/* ── Experience ───────────────────────────────────────── */}
        <div className="mb-16 animate-slide-up [animation-delay:100ms]">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-linear-to-r from-primary-50/40 to-transparent" />
            <h2 className="font-space-grotesk text-2xl font-bold neon-green uppercase tracking-widest">
              Experience
            </h2>
            <div className="h-px flex-1 bg-linear-to-l from-primary-50/40 to-transparent" />
          </div>

          {/* Timeline */}
          <div className="relative">
            <div
              className="absolute left-4 top-0 bottom-0 w-px"
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
                      className="absolute left-1.5 top-5 w-5 h-5 rounded-full border-2 z-10 flex items-center justify-center"
                      style={{
                        borderColor: accent,
                        backgroundColor: '#080d1a',
                        boxShadow: `0 0 8px ${accent}`,
                      }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                    </div>

                    <div
                      className="glass card-shine rounded-sm border-(--rb) hover:border-(--rb-h) transition-all duration-500 group overflow-hidden"
                      style={{ '--rb': accentA(0.18), '--rb-h': accentA(0.42) } as CSSProperties}
                    >
                      <div
                        className="h-px"
                        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                      />
                      <div
                        className="absolute top-0 right-0 w-40 h-40 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at top right, ${accent}, transparent 65%)`,
                        }}
                      />

                      <div className="relative z-10 p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                          <div>
                            <h3 className="font-space-grotesk font-bold text-lg text-neutral-90 group-hover:text-neutral-100 transition-colors">
                              {exp.company}
                            </h3>
                            <p
                              className="text-sm font-space-grotesk font-bold uppercase tracking-wider mt-0.5"
                              style={{ color: accent }}
                            >
                              {exp.title}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span
                              className="text-xs font-space-grotesk font-bold px-3 py-1 rounded-sm uppercase tracking-widest"
                              style={{
                                color: accent,
                                border: `1px solid ${accentA(0.28)}`,
                                background: accentA(0.07),
                              }}
                            >
                              {exp.duration}
                            </span>
                            <span className="text-neutral-60 text-xs">
                              {exp.period.replace(' -', ' –')}
                            </span>
                          </div>
                        </div>

                        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-4">
                          {exp.achievements.map((ach, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-xs text-neutral-70 leading-relaxed"
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
                              className="text-[10px] px-2 py-0.5 font-space-grotesk font-bold uppercase tracking-wide rounded-sm"
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

        {/* ── Technical Skills ─────────────────────────────────── */}
        <div className="mb-16 animate-slide-up [animation-delay:200ms]">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-linear-to-r from-secondary-50/40 to-transparent" />
            <h2 className="font-space-grotesk text-2xl font-bold neon-cyan uppercase tracking-widest">
              Technical Skills
            </h2>
            <div className="h-px flex-1 bg-linear-to-l from-secondary-50/40 to-transparent" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
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
                  className="glass rounded-sm border-(--skb) hover:border-(--skb-h) p-6 transition-all duration-300"
                  style={{ '--skb': accentA(0.18), '--skb-h': accentA(0.42) } as CSSProperties}
                >
                  <div
                    className="h-px mb-4"
                    style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                  />
                  <p
                    className="font-space-grotesk font-bold text-xs uppercase tracking-widest mb-3"
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
        <div className="mb-16 animate-slide-up [animation-delay:300ms]">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-linear-to-r from-tertiary-50/40 to-transparent" />
            <h2 className="font-space-grotesk text-2xl font-bold neon-purple uppercase tracking-widest">
              Education & CP
            </h2>
            <div className="h-px flex-1 bg-linear-to-l from-tertiary-50/40 to-transparent" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {CV_DATA.education.map((edu, i) => (
              <div
                key={i}
                className="glass rounded-sm border border-primary-50/15 hover:border-primary-50/38 p-6 transition-all duration-300"
              >
                <div className="h-px mb-4 bg-linear-to-r from-primary-50/50 to-transparent" />
                <h3 className="font-space-grotesk font-bold text-base text-neutral-90 mb-1">
                  {edu.degree}
                </h3>
                <p className="text-primary-50 text-xs font-space-grotesk font-bold uppercase tracking-wider mb-1">
                  {edu.institution}
                </p>
                <p className="text-neutral-60 text-xs">
                  {edu.period} · {edu.location}
                </p>
              </div>
            ))}
            <div className="glass rounded-sm border border-secondary-50/15 hover:border-secondary-50/38 p-6 transition-all duration-300">
              <div className="h-px mb-4 bg-linear-to-r from-secondary-50/50 to-transparent" />
              <h3 className="font-space-grotesk font-bold text-base text-neutral-90 mb-3">
                Competitive Programming
              </h3>
              <ul className="space-y-1.5">
                {CV_DATA.competitiveProgramming.achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-neutral-70">
                    <span className="text-secondary-50 mt-0.5 shrink-0">▸</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-sm border border-tertiary-50/15 hover:border-tertiary-50/38 p-6 transition-all duration-300">
              <div className="h-px mb-4 bg-linear-to-r from-tertiary-50/50 to-transparent" />
              <h3 className="font-space-grotesk font-bold text-base text-neutral-90 mb-2">
                {CV_DATA.problemSetting.title}
              </h3>
              <p className="text-neutral-70 text-xs leading-relaxed">
                {CV_DATA.problemSetting.description}
              </p>
            </div>
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <div className="glass rounded-sm border border-primary-50/20 hover:border-primary-50/40 p-10 text-center animate-scale-in [animation-delay:400ms] transition-all duration-300 relative overflow-hidden">
          <div
            className="h-px mb-8"
            style={{
              background:
                'linear-gradient(to right, transparent, var(--color-primary-50), var(--color-secondary-50), transparent)',
            }}
          />
          <h3 className="font-space-grotesk text-2xl font-bold mb-3 text-neutral-90">
            Ready to work together?
          </h3>
          <p className="text-neutral-70 text-sm mb-8 max-w-md mx-auto">
            Let's connect and discuss how I can contribute to your next project.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="mailto:saniuzzamanrobin07@gmail.com"
              className="btn-neon-green inline-flex items-center gap-2 px-8 py-3 rounded-sm font-space-grotesk font-bold text-sm uppercase tracking-widest"
            >
              <Mail className="w-4 h-4" />
              Get In Touch
            </a>
            <a
              href="https://linkedin.com/in/saniuzzaman-robin"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon-cyan inline-flex items-center gap-2 px-8 py-3 rounded-sm font-space-grotesk font-bold text-sm uppercase tracking-widest"
            >
              <ExternalLink className="w-4 h-4" />
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
