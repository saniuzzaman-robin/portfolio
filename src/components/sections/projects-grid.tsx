'use client';

import { Book, Clock, Play, Settings, TestTube2, Smartphone } from 'lucide-react';
import { ProjectCard } from '../reusable/project-card';

export function ProjectsGrid() {
  const projects = [
    {
      id: 1,
      title: 'MuslimPro Web Platform',
      category: 'Full Stack',
      description:
        'Engineered verified prayer times engine with geolocation accuracy. Built Islamic calendar integration, charitable giving platform, and premium subscription system serving 3M+ daily users.',
      technologies: ['Next.js', 'NestJS', 'MongoDB', 'Redis', 'TypeScript'],
      link: 'https://app.muslimpro.com',
      color: 'primary' as const,
      icon: Book,
    },
    {
      id: 2,
      title: 'Prayer Times Web Integration',
      category: 'Full Stack',
      description:
        'Developed real-time prayer times calculation engine with accurate Qibla direction and Adhan notifications. Optimized with Redis caching for global delivery across timezones.',
      technologies: ['Next.js', 'API Integration', 'Geolocation', 'Redis'],
      link: 'https://app.muslimpro.com/prayer-times',
      color: 'secondary' as const,
      icon: Clock,
    },
    {
      id: 3,
      title: 'Qalbox Video Platform',
      category: 'Full Stack',
      description:
        'Built dedicated video streaming platform for Quranic content with subscription management and gift premium system. Implemented dynamic feature toggles and analytics.',
      technologies: ['Next.js', 'Video Streaming', 'Payment Integration', 'Analytics'],
      link: 'https://app.muslimpro.com/qalbox',
      color: 'tertiary' as const,
      icon: Play,
    },
    {
      id: 4,
      title: 'KONA Admin Panel',
      category: 'Frontend',
      description:
        'Spearheaded enterprise-grade Admin Panel development using Angular. Built reusable component libraries and maintained scalable frontend architecture for team of 4.',
      technologies: ['Angular', 'RxJS', 'TypeScript', 'Angular Material'],
      link: '#',
      color: 'primary' as const,
      icon: Settings,
    },
    {
      id: 5,
      title: 'Automated Testing Suite',
      category: 'Testing',
      description:
        'Created custom Selenium wrapper for automated testing and conducted performance analysis with JMeter. Improved application reliability and identified performance bottlenecks.',
      technologies: ['Selenium', 'JMeter', 'Python', 'Test Automation'],
      link: '#',
      color: 'secondary' as const,
      icon: TestTube2,
    },
    {
      id: 6,
      title: 'Responsive Web Applications',
      category: 'Full Stack',
      description:
        'Developed responsive web applications using Angular and Angular Material. Focused on performance optimization, accessibility, and seamless user experiences across devices.',
      technologies: ['Angular', 'Angular Material', 'Responsive Design', 'TypeScript'],
      link: '#',
      color: 'tertiary' as const,
      icon: Smartphone,
    },
  ];

  return (
    <section className="px-6 py-24 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20 animate-slide-right">
          <h1 className="font-space-grotesk text-5xl md:text-6xl font-bold mb-6">
            Projects & Work
          </h1>
          <p className="text-neutral-70 text-lg max-w-2xl">
            A collection of projects showcasing my expertise across full-stack development, system
            design, and problem-solving.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} {...project} delay={index * 75} />
          ))}
        </div>
      </div>
    </section>
  );
}
