'use client';

import { motion } from 'framer-motion';
import { Download, Mail, Phone, MapPin, Briefcase, GraduationCap, Trophy } from 'lucide-react';
import { CV_DATA } from '@/lib/cv-data';

export function ResumeSheet() {
  return (
    <section className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 md:px-12 md:py-28 lg:px-20">
      <div className="relative z-10 mx-auto max-w-4xl space-y-8 sm:space-y-10">
        {/* Executive Header Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="craft-card space-y-4 rounded-2xl border border-(--border-subtle) p-5 sm:space-y-6 sm:rounded-3xl sm:p-8 md:p-10"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-(--border-subtle) pb-4 sm:flex-row sm:items-start sm:gap-6 sm:pb-6">
            <div>
              <h1 className="editorial-title text-2xl font-extrabold text-(--text-main) sm:text-3xl md:text-4xl">
                {CV_DATA.name}
              </h1>
              <p className="mt-1 font-mono text-xs font-semibold text-indigo-500 sm:text-sm">
                {CV_DATA.title}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-(--text-secondary)">
                <a
                  href={`mailto:${CV_DATA.email}`}
                  className="group flex items-center gap-1.5 transition-colors hover:text-indigo-400"
                >
                  <Mail className="h-3.5 w-3.5 text-indigo-500 transition-transform group-hover:scale-110" />
                  <span>{CV_DATA.email}</span>
                </a>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{CV_DATA.phone}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{CV_DATA.location}</span>
                </span>
              </div>
            </div>

            <a
              href="/CV_SANIUZZAMAN_ROBIN.pdf"
              download
              className="btn-primary group gap-2 self-start px-3.5 py-2 text-xs sm:self-auto"
            >
              <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              <span>Download PDF CV</span>
            </a>
          </div>

          <div>
            <h2 className="mb-1.5 font-mono text-[10px] font-bold tracking-wider text-(--text-muted) uppercase sm:text-xs">
              Profile Summary
            </h2>
            <p className="text-xs leading-relaxed text-(--text-secondary) sm:text-sm">
              {CV_DATA.summary}
            </p>
          </div>
        </motion.div>

        {/* Technical Skills Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="craft-card space-y-3 rounded-2xl border border-(--border-subtle) p-5 sm:space-y-4 sm:rounded-3xl sm:p-8"
        >
          <h2 className="font-heading flex items-center gap-2 text-base font-bold text-(--text-main) sm:text-lg">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>Technical Skills Matrix</span>
          </h2>

          <div className="space-y-2.5 text-xs sm:space-y-3">
            {[
              { label: 'Frontend & Backend', data: CV_DATA.technicalSkills.frontendBackend },
              { label: 'Data, Cloud & Infrastructure', data: CV_DATA.technicalSkills.dataInfrastructure },
              { label: 'Testing, SEO & Growth', data: CV_DATA.technicalSkills.testingGrowth },
            ].map((cat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-(--border-subtle) hover:border-(--border-hover) bg-(--surface-1) p-3 sm:rounded-2xl sm:p-4 transition-colors shadow-xs"
              >
                <span className="mb-1 block font-mono text-[10px] font-bold tracking-wider text-(--text-main) uppercase sm:text-[11px]">
                  {cat.label}
                </span>
                <p className="font-mono text-[11px] text-(--text-secondary) sm:text-xs">
                  {cat.data.join(' • ')}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Work Experience */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="editorial-title flex items-center gap-2 text-xl font-bold text-(--text-main) sm:text-2xl">
              <Briefcase className="h-4 w-4 text-indigo-500 sm:h-5 sm:w-5" />
              <span>Professional Experience</span>
            </h2>
            <span className="font-mono text-xs text-(--text-muted)">5+ Years Track Record</span>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {CV_DATA.experience.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
                whileHover={{ y: -3 }}
                className="craft-card space-y-3 rounded-2xl border border-(--border-subtle) p-5 sm:space-y-4 sm:rounded-3xl sm:p-7 md:p-8"
              >
                <div className="flex flex-col justify-between gap-1.5 border-b border-(--border-subtle) pb-3 sm:flex-row sm:items-center sm:pb-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-(--text-main) sm:text-xl">
                      {exp.company}
                    </h3>
                    <p className="mt-0.5 font-mono text-xs font-semibold text-indigo-500">
                      {exp.title}
                    </p>
                  </div>
                  <div className="font-mono text-[11px] text-(--text-muted) sm:text-right sm:text-xs">
                    <p className="font-bold text-(--text-main)">{exp.period}</p>
                    <p className="text-[10px] sm:text-[11px]">{exp.location}</p>
                  </div>
                </div>

                {/* Highlights */}
                <ul className="space-y-2">
                  {exp.highlights.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs leading-relaxed text-(--text-secondary) sm:text-sm"
                    >
                      <span className="mt-0.5 shrink-0 font-bold text-indigo-500">❖</span>
                      <div>
                        <strong className="font-semibold text-(--text-main)">{item.topic}: </strong>
                        <span>{item.detail}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Tech pills */}
                <div className="flex flex-wrap gap-1 border-t border-(--border-subtle) pt-2.5 sm:pt-3">
                  {exp.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded border border-(--border-subtle) hover:border-indigo-500/40 bg-(--surface-2) px-2 py-0.5 font-mono text-[9px] text-(--text-muted) hover:text-(--text-main) sm:text-[10px] transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Education & Achievements */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          {/* Education */}
          <motion.div
            whileHover={{ y: -3 }}
            className="craft-card space-y-2.5 rounded-2xl border border-(--border-subtle) p-5 sm:space-y-3 sm:rounded-3xl sm:p-7"
          >
            <h2 className="font-heading flex items-center gap-2 text-sm font-bold text-(--text-main) sm:text-base">
              <GraduationCap className="h-4 w-4 text-indigo-500" />
              <span>Education</span>
            </h2>
            <div>
              <p className="text-xs font-bold text-(--text-main) sm:text-sm">
                {CV_DATA.education[0].degree}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-indigo-500 sm:text-xs">
                {CV_DATA.education[0].institution} ({CV_DATA.education[0].period})
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-(--text-secondary)">
                {CV_DATA.education[0].highlights}
              </p>
            </div>
          </motion.div>

          {/* Core Achievements */}
          <motion.div
            whileHover={{ y: -3 }}
            className="craft-card space-y-2.5 rounded-2xl border border-(--border-subtle) p-5 sm:space-y-3 sm:rounded-3xl sm:p-7"
          >
            <h2 className="font-heading flex items-center gap-2 text-sm font-bold text-(--text-main) sm:text-base">
              <Trophy className="h-4 w-4 text-cyan-500" />
              <span>Competitive Achievements</span>
            </h2>
            <ul className="space-y-1.5 text-xs text-(--text-secondary)">
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-cyan-500">◆</span>
                <span>
                  <strong>1,700+ Problems Solved:</strong> Codeforces Specialist (Max 1544).
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-cyan-500">◆</span>
                <span>
                  <strong>ICPC Dhaka Regional &amp; NCPC:</strong> Competed across 10+ contests.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-cyan-500">◆</span>
                <span>
                  <strong>Problem Setter &amp; Judge:</strong> University camp trainer.
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
