import { CV_DATA } from '@/lib/cv-data';

const TECH = [
  ...CV_DATA.technicalSkills.frontendBackend,
  ...CV_DATA.technicalSkills.dataInfrastructure.slice(0, 5),
];

export function TechMarquee() {
  return (
    <div
      className="relative overflow-hidden border-y border-line bg-surface/40 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] py-5"
      aria-label="Technologies I work with"
    >
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {TECH.map((tech) => (
              <li
                key={tech}
                className="flex items-center gap-8 pr-8 font-mono text-sm whitespace-nowrap text-fg-subtle"
              >
                {tech}
                <span aria-hidden className="size-1 rotate-45 bg-primary/60" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
