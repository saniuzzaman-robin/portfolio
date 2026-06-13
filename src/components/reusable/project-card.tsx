import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ExternalLink, type LucideIcon } from 'lucide-react';
import { ACCENT_CLASSES, av, ava, type AccentToken } from '@/lib/accent';

interface ProjectCardProps {
  title: string;
  category: string;
  description: string;
  technologies: string[];
  link: string;
  color: AccentToken;
  icon: LucideIcon;
  delay?: number;
}

export function ProjectCard({
  title,
  category,
  description,
  technologies,
  link,
  color,
  icon: Icon,
  delay = 0,
}: ProjectCardProps) {
  const c = ACCENT_CLASSES[color];
  const accent = av(color);
  const isExternal = link.startsWith('http');

  return (
    <div
      className="relative glass card-shine rounded-sm border-(--ca) hover:border-(--ca-h) hover:shadow-(--cs) animate-scale-in group transition-all duration-500 hover:scale-[1.02] overflow-hidden flex flex-col"
      style={
        {
          '--ca': ava(color, 0.18),
          '--ca-h': ava(color, 0.48),
          '--cs': `0 0 24px ${ava(color, 0.13)}, 0 0 48px ${ava(color, 0.06)}`,
          animationDelay: `${delay}ms`,
          animationFillMode: 'both',
        } as CSSProperties
      }
    >
      {/* Holographic hover overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 holographic pointer-events-none" />

      {/* Top accent gradient bar */}
      <div
        className="h-px shrink-0"
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
      />

      {/* Corner gradient wash */}
      <div
        className="absolute top-0 left-0 w-24 h-24 opacity-[0.08] group-hover:opacity-[0.16] transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${accent} 0%, transparent 70%)` }}
      />

      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Icon + Category row */}
        <div className="flex items-start justify-between mb-5">
          <div
            className="p-2.5 rounded-sm border transition-all duration-300 group-hover:scale-110"
            style={{
              borderColor: ava(color, 0.28),
              background: ava(color, 0.07),
              color: accent,
            }}
          >
            <Icon className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <span
            className={`text-[10px] uppercase tracking-widest font-space-grotesk font-bold px-2.5 py-1 rounded-full ${c.tag}`}
          >
            {category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-space-grotesk text-base font-bold mb-3 text-neutral-90 group-hover:text-neutral-100 transition-colors leading-snug">
          {title}
        </h3>

        {/* Description */}
        <p className="text-neutral-60 text-sm mb-5 leading-relaxed flex-1">{description}</p>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="text-[10px] px-2.5 py-0.5 rounded-full font-space-grotesk font-bold uppercase tracking-wide"
              style={{
                color: accent,
                border: `1px solid ${ava(color, 0.22)}`,
                background: ava(color, 0.05),
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Link */}
        <Link
          href={link}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="flex items-center gap-2 text-xs font-space-grotesk uppercase tracking-widest group-hover:translate-x-1 transition-transform duration-300 w-fit"
          style={{ color: accent }}
        >
          <span>View Project</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Bottom accent sweep line */}
      <div
        className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-700"
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
      />
    </div>
  );
}
