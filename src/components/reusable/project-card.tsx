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
      className="glass card-shine animate-scale-in group relative flex flex-col overflow-hidden rounded-sm border-(--ca) transition-all duration-500 hover:scale-[1.02] hover:border-(--ca-h) hover:shadow-(--cs)"
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
      <div className="holographic pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Top accent gradient bar */}
      <div
        className="h-px shrink-0"
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
      />

      {/* Corner gradient wash */}
      <div
        className="pointer-events-none absolute top-0 left-0 h-24 w-24 opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.16]"
        style={{ background: `linear-gradient(135deg, ${accent} 0%, transparent 70%)` }}
      />

      <div className="relative z-10 flex h-full flex-col p-6">
        {/* Icon + Category row */}
        <div className="mb-5 flex items-start justify-between">
          <div
            className="rounded-sm border p-2.5 transition-all duration-300 group-hover:scale-110"
            style={{
              borderColor: ava(color, 0.28),
              background: ava(color, 0.07),
              color: accent,
            }}
          >
            <Icon className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <span
            className={`font-poppins rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase ${c.tag}`}
          >
            {category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-poppins text-midnight-950 mb-3 text-base leading-snug font-bold transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-midnight-500 mb-5 flex-1 text-sm leading-relaxed">{description}</p>

        {/* Tech tags */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="font-poppins rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase"
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
          className="font-poppins flex w-fit items-center gap-2 text-xs tracking-widest uppercase transition-transform duration-300 group-hover:translate-x-1 lg:text-sm"
          style={{ color: accent }}
        >
          <span>View Project</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Bottom accent sweep line */}
      <div
        className="absolute bottom-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
      />
    </div>
  );
}
