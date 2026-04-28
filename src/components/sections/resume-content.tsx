import { Download } from 'lucide-react';
import { CV_DATA } from '@/lib/cv-data';

export function ResumeContent() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 bg-linear-to-br from-neutral-10 to-neutral-5">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-16 animate-slide-right">
          <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
            <div>
              <h1 className="font-space-grotesk text-5xl md:text-6xl font-bold mb-2">
                {CV_DATA.name}
              </h1>
              <p className="text-primary-50 text-lg font-space-grotesk uppercase tracking-widest">
                {CV_DATA.title}
              </p>
            </div>
            <a
              href="/CV_SANIUZZAMAN_ROBIN.pdf"
              download
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-50 text-white font-space-grotesk font-bold rounded-lg hover:bg-primary-60 transition duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-50/50 hover:-translate-y-1 whitespace-nowrap"
            >
              <Download className="w-5 h-5" />
              <span>Download Resume</span>
            </a>
          </div>
          <p className="text-neutral-70 text-base max-w-3xl leading-relaxed mb-6">
            {CV_DATA.summary}
          </p>
          <div className="flex gap-6 text-neutral-70 text-sm flex-wrap">
            <span>📧 {CV_DATA.email}</span>
            <span>📱 {CV_DATA.phone}</span>
            <span>📍 {CV_DATA.location}</span>
          </div>
        </div>

        {/* Experience */}
        <div className="mb-16 animate-slide-up [animation-delay:100ms]">
          <h2 className="font-space-grotesk text-3xl font-bold text-primary-50 mb-8">Experience</h2>
          <div className="space-y-8">
            {CV_DATA.experience.map((exp, index) => (
              <div
                key={index}
                className="bg-neutral-5 rounded-xl p-8 border border-neutral-20 hover:border-neutral-30 transition duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`font-space-grotesk text-xl font-bold text-primary-50 mb-1`}>
                      {exp.title}
                    </h3>
                    <p className="text-neutral-70">{exp.company}</p>
                  </div>
                  <span className="text-neutral-60 text-sm font-space-grotesk">{exp.period}</span>
                </div>
                <ul className="space-y-2 text-neutral-70 text-sm">
                  {exp.achievements.map((achievement, i) => (
                    <li key={i}>✓ {achievement}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-16 animate-slide-up [animation-delay:200ms]">
          <h2 className="font-space-grotesk text-3xl font-bold text-secondary-50 mb-8">
            Technical Skills
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Frontend',
                skills: CV_DATA.skills.frontend,
              },
              {
                title: 'Backend',
                skills: CV_DATA.skills.backend,
              },
              {
                title: 'Others',
                skills: CV_DATA.skills.others,
              },
            ].map((skillSet, index) => (
              <div key={index} className="bg-neutral-5 rounded-xl p-6 border border-neutral-20">
                <h3 className="font-space-grotesk font-bold mb-3">{skillSet.title}</h3>
                <p className="text-neutral-70 text-sm leading-relaxed">{skillSet.skills}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Education & Certifications */}
        <div className="mb-16 animate-slide-up [animation-delay:300ms]">
          <h2 className="font-space-grotesk text-3xl font-bold text-tertiary-50 mb-8">
            Education & Certifications
          </h2>
          <div className="space-y-6">
            {CV_DATA.education.map((edu, index) => (
              <div key={index} className="bg-neutral-5 rounded-xl p-8 border border-neutral-20">
                <h3 className="font-space-grotesk text-lg font-bold mb-2">{edu.degree}</h3>
                <p className="text-neutral-70 mb-2">
                  {edu.institution} • {edu.period}
                </p>
                <p className="text-neutral-70 text-sm">{edu.location}</p>
              </div>
            ))}
            <div className="bg-neutral-5 rounded-xl p-8 border border-neutral-20">
              <h3 className="font-space-grotesk text-lg font-bold mb-2">
                {CV_DATA.competitiveProgramming.title}
              </h3>
              <p className="text-neutral-70 text-sm">
                {CV_DATA.competitiveProgramming.achievements.map((achievement, i) => (
                  <div key={i}>• {achievement}</div>
                ))}
              </p>
            </div>
            <div className="bg-neutral-5 rounded-xl p-8 border border-neutral-20">
              <h3 className="font-space-grotesk text-lg font-bold mb-2">
                {CV_DATA.problemSetting.title}
              </h3>
              <p className="text-neutral-70 text-sm">{CV_DATA.problemSetting.description}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-neutral-10 rounded-2xl p-12 border border-primary-50/30 text-center animate-scale-in [animation-delay:400ms]">
          <h3 className="font-space-grotesk text-2xl font-bold mb-4">Ready to work together?</h3>
          <p className="text-neutral-70 mb-6">
            Let's connect and discuss how I can contribute to your next project.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="mailto:saniuzzamanrobin07@gmail.com"
              className="px-8 py-3 bg-primary-50 text-white font-space-grotesk font-bold rounded-lg hover:bg-primary-60 transition duration-300 hover:scale-105"
            >
              Get In Touch
            </a>
            <a
              href="https://linkedin.com/in/saniuzzaman-robin"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-primary-50 text-primary-50 font-space-grotesk font-bold rounded-lg hover:bg-primary-50/10 transition duration-300"
            >
              LinkedIn Profile
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
