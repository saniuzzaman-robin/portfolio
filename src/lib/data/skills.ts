import { Cpu, Database, Layout, ShieldCheck, type LucideIcon } from 'lucide-react';

export interface SkillDomain {
  id: string;
  icon: LucideIcon;
  title: string;
  badge: string;
  description: string;
  technologies: { name: string; level: string }[];
}

export const SKILL_DOMAINS: SkillDomain[] = [
  {
    id: 'frontend',
    icon: Layout,
    title: 'Frontend Architecture',
    badge: 'Enterprise SSR & Microfrontends',
    description:
      'Production SSR/SSG/ISR with Next.js, multi-tenant Angular enterprise panels, and reactive RxJS/NgRx state pipelines.',
    technologies: [
      { name: 'Next.js (App Router)', level: 'Advanced' },
      { name: 'React & TypeScript', level: 'Advanced' },
      { name: 'Angular (14-17)', level: 'Advanced' },
      { name: 'RxJS & NgRx', level: 'Expert' },
      { name: 'Tailwind CSS', level: 'Advanced' },
      { name: 'WebSockets', level: 'Advanced' },
    ],
  },
  {
    id: 'backend',
    icon: Cpu,
    title: 'Distributed Backend',
    badge: 'High-Concurrency Microservices',
    description:
      'Resilient NestJS microservices, event-driven pipelines, CQRS & SAGA patterns, and high-throughput coordinate resolution.',
    technologies: [
      { name: 'NestJS & Node.js', level: 'Advanced' },
      { name: 'CQRS & SAGA Pattern', level: 'Advanced' },
      { name: 'REST & WebSockets APIs', level: 'Advanced' },
      { name: 'Kotlin to NestJS Migration', level: 'Production' },
      { name: '.NET 6 & C#', level: 'Proficient' },
      { name: 'Dependency Injection', level: 'Advanced' },
    ],
  },
  {
    id: 'data',
    icon: Database,
    title: 'Data & Infrastructure',
    badge: 'Low-Latency In-Memory Caching',
    description:
      'Distributed caching strategies with Redis, MongoDB indexing optimizations, and GCP Pub/Sub message queues.',
    technologies: [
      { name: 'Redis Caching (Sliding TTL)', level: 'Expert' },
      { name: 'MongoDB Index Optimization', level: 'Advanced' },
      { name: 'GCP Pub/Sub & Cloud Run', level: 'Proficient' },
      { name: 'MaxMind GeoIP Resolution', level: 'Production' },
      { name: 'Google Maps APIs', level: 'Advanced' },
      { name: 'Aggregation Pipelines', level: 'Advanced' },
    ],
  },
  {
    id: 'reliability',
    icon: ShieldCheck,
    title: 'Testing & Reliability',
    badge: 'Custom Regression Frameworks',
    description:
      'Custom Selenium wrapper frameworks, regression test automation across 6+ platforms, and JMeter load testing under peak loads.',
    technologies: [
      { name: 'Selenium Custom Framework', level: 'Expert' },
      { name: 'JMeter Load & Stress Testing', level: 'Advanced' },
      { name: 'Vitest & Jest Unit Testing', level: 'Advanced' },
      { name: 'CI/CD Automation Pipelines', level: 'Advanced' },
      { name: 'Cross-Platform Automation', level: 'Expert' },
      { name: 'Performance Profiling', level: 'Advanced' },
    ],
  },
];
