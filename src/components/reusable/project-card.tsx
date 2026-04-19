'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

type ColorType = 'primary' | 'secondary' | 'tertiary';

interface ProjectCardProps {
  title: string;
  category: string;
  description: string;
  technologies: string[];
  link: string;
  color: ColorType;
  icon: LucideIcon;
  delay?: number;
}

const colorMap: Record<
  ColorType,
  { text: string; border: string; hover: string }
> = {
  primary: {
    text: 'text-primary-50',
    border: 'border-primary-50',
    hover: 'hover:text-primary-60',
  },
  secondary: {
    text: 'text-secondary-50',
    border: 'border-secondary-50',
    hover: 'hover:text-secondary-60',
  },
  tertiary: {
    text: 'text-tertiary-50',
    border: 'border-tertiary-50',
    hover: 'hover:text-tertiary-60',
  },
};

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
  const colorClasses = colorMap[color];
  const isExternal = link.startsWith('http');

  return (
    <div
      className={`bg-neutral-10 rounded-2xl border ${colorClasses.border} overflow-hidden group transition-all duration-300 animate-scale-in hover:shadow-lg will-change-transform`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-8">
        <div className="mb-4 text-4xl group-hover:scale-110 transition-transform duration-300 will-change-transform">
          <Icon className="w-10 h-10" strokeWidth={1.5} />
        </div>
        <div className="mb-4">
          <span
            className={`text-xs uppercase tracking-widest font-space-grotesk ${colorClasses.text}`}
          >
            {category}
          </span>
        </div>
        <h3 className="font-space-grotesk text-xl font-bold mb-3 group-hover:text-primary-50 transition duration-300">
          {title}
        </h3>
        <p className="text-neutral-70 text-sm mb-6 leading-relaxed">
          {description}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="text-xs bg-neutral-5 text-neutral-70 px-2 py-1 rounded-full hover:scale-105 transition-transform duration-200 will-change-transform"
            >
              {tech}
            </span>
          ))}
        </div>
        <Link
          href={link}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className={`${colorClasses.text} font-space-grotesk text-sm uppercase tracking-wider ${colorClasses.hover} transition inline-flex items-center gap-2 group-hover:translate-x-2 duration-300 will-change-transform`}
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
