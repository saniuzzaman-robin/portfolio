import { Download, Mail, ExternalLink } from 'lucide-react';
import { CV_DATA } from '@/lib/cv-data';
import { av, ava, type AccentToken } from '@/lib/accent';

const ACCENT_ORDER = ['primary', 'secondary', 'tertiary'] as const;

export function ResumeContent() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="aurora-blob aurora-blob-primary absolute top-0 right-0 h-100 w-100 opacity-10" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16">
          <div
            className="glass relative mb-8 overflow-hidden rounded-2xl p-8"
            style={{ borderTop: '3px solid var(--color-primary-40)' }}
          >
            <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
              <div>
                <h1 className="text-midnight-950 mb-2 text-4xl font-bold md:text-5xl">
                  {CV_DATA.name}
                </h1>
                <p className="gradient-text mb-4 text-base font-bold tracking-widest uppercase">
                  {CV_DATA.title}
                </p>
                <div className="text-midnight-500 flex flex-wrap gap-5 text-xs lg:text-sm">
                  <span>✉ {CV_DATA.email}</span>
                  <span>☏ {CV_DATA.phone}</span>
                  <span>⊙ {CV_DATA.location}</span>
                </div>
              </div>
              <a
                href="/CV_SANIUZZAMAN_ROBIN.pdf"
                download
                className="btn-primary inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-bold tracking-widest uppercase"
              >
                <Download className="h-4 w-4" />
                <span>Download CV</span>
              </a>
            </div>

            <p className="text-midnight-500 relative z-10 mt-6 max-w-3xl text-sm leading-relaxed">
              {CV_DATA.summary}
            </p>
          </div>
        </div>

        {/* Experience */}
        <div className="mb-16">
          <div className="mb-10 flex items-center gap-3">
            <div className="from-primary-40/40 h-px flex-1 bg-linear-to-r to-transparent" />
            <h2
              className="text-2xl font-bold tracking-widest uppercase"
              style={{ color: av('primary') }}
            >
              Experience
            </h2>
            <div className="from-primary-40/40 h-px flex-1 bg-linear-to-l to-transparent" />
          </div>

          <div className="relative">
            <div
              className="absolute top-0 bottom-0 left-4 w-px"
              style={{
                background:
                  'linear-gradient(to bottom, var(--color-primary-40), var(--color-secondary-40), var(--color-tertiary-40), transparent)',
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
                        backgroundColor: 'var(--bg-primary)',
                        boxShadow: `0 0 8px ${accent}`,
                      }}
                    >
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                    </div>

                    <div
                      className="glass group overflow-hidden rounded-2xl transition-all duration-500"
                      style={{ borderLeft: `3px solid ${accent}` }}
                    >
                      <div className="relative z-10 p-6">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-midnight-950 group-hover:text-midnight-950 text-lg font-bold transition-colors">
                              {exp.company}
                            </h3>
                            <p
                              className="mt-0.5 text-sm font-bold tracking-wider uppercase"
                              style={{ color: accent }}
                            >
                              {exp.title}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span
                              className="rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase lg:text-sm"
                              style={{
                                color: accent,
                                border: `1px solid ${accentA(0.3)}`,
                                background: accentA(0.08),
                              }}
                            >
                              {exp.duration}
                            </span>
                            <span className="text-midnight-500 text-xs lg:text-sm">
                              {exp.period.replace(' -', ' –')}
                            </span>
                          </div>
                        </div>

                        <ul className="mb-4 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                          {exp.achievements.map((ach, i) => (
                            <li
                              key={i}
                              className="text-midnight-500 flex items-start gap-2 text-xs leading-relaxed lg:text-sm"
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
                              className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
                              style={{
                                color: accent,
                                border: `1px solid ${accentA(0.25)}`,
                                background: accentA(0.06),
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Technical Skills */}
        <div className="mb-16">
          <div className="mb-10 flex items-center gap-3">
            <div className="from-secondary-40/40 h-px flex-1 bg-linear-to-r to-transparent" />
            <h2
              className="text-2xl font-bold tracking-widest uppercase"
              style={{ color: av('secondary') }}
            >
              Technical Skills
            </h2>
            <div className="from-secondary-40/40 h-px flex-1 bg-linear-to-l to-transparent" />
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
              return (
                <div
                  key={title}
                  className="glass rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
                  style={{ borderTop: `3px solid ${accent}` }}
                >
                  <p
                    className="mb-3 text-xs font-bold tracking-widest uppercase lg:text-sm"
                    style={{ color: accent }}
                  >
                    {title}
                  </p>
                  <p className="text-midnight-500 text-sm leading-relaxed">{skills}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Education & Achievements */}
        <div className="mb-16">
          <div className="mb-10 flex items-center gap-3">
            <div className="from-tertiary-40/40 h-px flex-1 bg-linear-to-r to-transparent" />
            <h2
              className="text-2xl font-bold tracking-widest uppercase"
              style={{ color: av('tertiary') }}
            >
              Education & CP
            </h2>
            <div className="from-tertiary-40/40 h-px flex-1 bg-linear-to-l to-transparent" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {CV_DATA.education.map((edu, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
                style={{ borderTop: `3px solid ${av('primary')}` }}
              >
                <h3 className="text-midnight-950 mb-1 text-base font-bold">{edu.degree}</h3>
                <p
                  className="mb-1 text-xs font-bold tracking-wider uppercase lg:text-sm"
                  style={{ color: av('primary') }}
                >
                  {edu.institution}
                </p>
                <p className="text-midnight-500 text-xs lg:text-sm">
                  {edu.period} · {edu.location}
                </p>
              </div>
            ))}
            <div
              className="glass rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
              style={{ borderTop: `3px solid ${av('secondary')}` }}
            >
              <h3 className="text-midnight-950 mb-3 text-base font-bold">
                Competitive Programming
              </h3>
              <ul className="space-y-1.5">
                {CV_DATA.competitiveProgramming.achievements.map((a, i) => (
                  <li
                    key={i}
                    className="text-midnight-500 flex items-start gap-2 text-xs lg:text-sm"
                  >
                    <span className="mt-0.5 shrink-0" style={{ color: av('secondary') }}>
                      ▸
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="glass rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
              style={{ borderTop: `3px solid ${av('tertiary')}` }}
            >
              <h3 className="text-midnight-950 mb-2 text-base font-bold">
                {CV_DATA.problemSetting.title}
              </h3>
              <p className="text-midnight-500 text-xs leading-relaxed lg:text-sm">
                {CV_DATA.problemSetting.description}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className="glass relative overflow-hidden rounded-2xl p-10 text-center transition-all duration-300 hover:shadow-lg"
          style={{ borderTop: '3px solid var(--color-primary-40)' }}
        >
          <h3 className="text-midnight-950 mb-3 text-2xl font-bold">Ready to work together?</h3>
          <p className="text-midnight-500 mx-auto mb-8 max-w-md text-sm">
            Let&apos;s connect and discuss how I can contribute to your next project.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:saniuzzamanrobin07@gmail.com"
              className="btn-primary inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold tracking-widest uppercase"
            >
              <Mail className="h-4 w-4" />
              Get In Touch
            </a>
            <a
              href="https://linkedin.com/in/saniuzzaman-robin"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold tracking-widest uppercase"
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
