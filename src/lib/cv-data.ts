/**
 * Centralized CV Data
 * Single source of truth for all CV-related content matching the official CV
 */

export const CV_DATA = {
  name: 'Md. Saniuzzaman Robin',
  title: 'Software Engineer',
  role: 'Full-Stack Software Engineer',
  yearsOfExperience: '5+',
  email: 'saniuzzamanrobin07@gmail.com',
  phone: '+880 1811 685 391',
  location: 'Dhaka, Bangladesh',
  github: 'https://github.com/saniuzzaman-robin',
  linkedin: 'https://linkedin.com/in/saniuzzaman-robin',

  // Profile summary from CV
  summary:
    'Software Engineer with 5+ years of experience building high-traffic, production-grade applications for millions of global users. Expert in Next.js/NestJS/MongoDB/Redis and Angular. Proven track record in microservices design, tech leadership, performance optimization, and transforming complex business requirements into scalable architectures. Strong computer science foundation rooted in competitive programming (ICPC Regional).',

  shortBio:
    'Software Engineer with 5+ years of experience building high-traffic, production-grade applications for millions of global users with Next.js, NestJS, and Angular.',

  aboutMeTitle: 'Software Engineer · 5+ Years',
  aboutMeDesc:
    'I architect and build high-traffic, production-grade web applications and backend microservices serving millions of global users. Expert in Next.js and NestJS for full-stack delivery, and Angular for enterprise frontend platforms.',

  // Key metrics
  stats: [
    { label: 'Years Experience', value: '5+', numeric: 5, suffix: '+', accent: 'primary' },
    { label: 'Global Scale', value: '180M+', numeric: 180, suffix: 'M+', accent: 'secondary', sub: 'Users Served' },
    { label: 'Problems Solved', value: '1,700+', numeric: 1700, suffix: '+', accent: 'tertiary', sub: 'Codeforces Specialist' },
    { label: 'Donation Growth', value: '30%', numeric: 30, suffix: '%', accent: 'primary', sub: 'YoY Business Impact' },
  ],

  // Technical Skills structured by CV sections
  technicalSkills: {
    frontendBackend: [
      'Next.js',
      'Angular',
      'React',
      'NestJS',
      'TypeScript',
      'REST APIs',
      'Microservices',
      'CQRS',
      'SAGA',
      'Tailwind CSS',
      'RxJS',
    ],
    dataInfrastructure: [
      'MongoDB',
      'Redis',
      'GCP',
      'Google Pub/Sub',
      'WebSockets',
      'SSR/SSG optimization',
      'MaxMind GeoIP',
      'Google Maps APIs',
    ],
    testingGrowth: [
      'Selenium',
      'JMeter',
      'Jest',
      'SEO',
      'Google Analytics (GTM)',
      'AI Tools (Gemini/Copilot)',
      'Agile',
      'Scrum',
    ],
  },

  // Skills Detailed with proficiency levels
  skillsDetailed: [
    {
      category: 'Frontend & Full-Stack',
      accent: 'primary' as const,
      icon: '⚡',
      description: 'Building high-performance, accessible, and responsive user interfaces at scale.',
      skills: [
        { name: 'Next.js (App Router / SSR / SSG / Streaming)', level: 96 },
        { name: 'Angular (Reactive Forms, RxJS, Angular Material)', level: 95 },
        { name: 'React & Modern Frontend Architecture', level: 94 },
        { name: 'TypeScript & JavaScript (ESNext)', level: 95 },
        { name: 'Tailwind CSS & Design Systems', level: 92 },
        { name: 'State Management (RxJS / Zustand)', level: 90 },
      ],
    },
    {
      category: 'Backend & Microservices',
      accent: 'secondary' as const,
      icon: '🚀',
      description: 'Designing distributed backend systems, event-driven pipelines, and caching layers.',
      skills: [
        { name: 'NestJS & Node.js Microservices', level: 95 },
        { name: 'REST APIs & System Design', level: 96 },
        { name: 'MongoDB (Index Optimization & Aggregations)', level: 92 },
        { name: 'Redis (Caching & Rate Limiting)', level: 92 },
        { name: 'Architectural Patterns (CQRS & SAGA)', level: 88 },
        { name: 'GCP & Google Cloud Pub/Sub', level: 85 },
      ],
    },
    {
      category: 'Testing, DevOps & Growth',
      accent: 'tertiary' as const,
      icon: '🔧',
      description: 'Ensuring resilience, test coverage, search visibility, and developer velocity.',
      skills: [
        { name: 'SEO & Structured Data (Schema.org, OG, Sitemaps)', level: 94 },
        { name: 'Selenium Test Automation Frameworks', level: 88 },
        { name: 'JMeter Load & Performance Testing', level: 85 },
        { name: 'Jest / Vitest / Unit Testing', level: 90 },
        { name: 'Google Analytics & Tag Manager (GTM)', level: 88 },
        { name: 'AI Augmented Workflows (Gemini / Copilot)', level: 92 },
      ],
    },
  ],

  // Professional Experience exactly as on CV
  experience: [
    {
      company: 'Bitsmedia Pte Ltd.',
      title: 'Software Engineer (Full-Stack)',
      period: '01/2024 – present',
      startDate: '2024-01',
      endDate: null,
      location: 'Dhaka, Bangladesh',
      accent: 'primary' as const,
      summary:
        'Develop full-stack features using Next.js/NestJS for platforms serving millions of global users. Architected backend microservices utilizing Redis caching, MongoDB index optimization, and GCP Pub/Sub.',
      achievements: [
        'Develop full-stack features using Next.js/NestJS for platforms serving millions of global users.',
        'Architected backend microservices utilizing Redis caching, MongoDB index optimization, and GCP Pub/Sub.',
        'Migrated core legacy Kotlin Prayer Times engine to NestJS, integrating MaxMind GeoIP and Google Maps APIs to deliver optimized, lightning-fast location searches.',
        'Re-platformed the legacy WordPress "Giving" engine to a modern Next.js/WooCommerce framework with advanced SEO features, accelerating page load speeds and driving a 30% YoY increase in donations in 2025-2026.',
        'Engineered an enterprise Admin Console from scratch in Next.js, creating reusable filters, tables, and auth modules that slashed feature development times for core product modules.',
        'Revamped main app performance by shifting legacy JSON data-fetching architecture to modular, stream-optimized feature components.',
        'Conduct code reviews, provide architecture feedbacks, and guide engineering peers.',
      ],
      highlights: [
        {
          topic: 'Scale & Architecture',
          detail:
            'Develop full-stack features using Next.js/NestJS for platforms serving millions of global users. Architected backend microservices utilizing Redis caching, MongoDB index optimization, and GCP Pub/Sub.',
        },
        {
          topic: 'Migration & Geolocation',
          detail:
            'Migrated core legacy Kotlin Prayer Times engine to NestJS, integrating MaxMind GeoIP and Google Maps APIs to deliver optimized, lightning-fast location searches.',
        },
        {
          topic: 'Business Growth',
          detail:
            'Re-platformed the legacy WordPress "Giving" engine to a modern Next.js/WooCommerce framework with advanced SEO features, accelerating page load speeds and driving a 30% YoY increase in donations in 2025-2026.',
        },
        {
          topic: 'Internal Frameworks & Leadership',
          detail:
            'Engineered an enterprise Admin Console from scratch in Next.js, creating reusable filters, tables, and auth modules that slashed feature development times for core product modules. Revamped main app performance by shifting legacy JSON data-fetching architecture to modular, stream-optimized feature components. Conduct code reviews, provide architecture feedbacks, and guide engineering peers.',
        },
      ],
      skills: [
        'Next.js',
        'NestJS',
        'Redis',
        'MongoDB',
        'GCP Pub/Sub',
        'TypeScript',
        'WooCommerce',
        'SEO',
        'Microservices',
        'System Architecture',
      ],
    },
    {
      company: 'KONA Software Lab Ltd.',
      title: 'Software Engineer - L02',
      period: '10/2022 – 01/2024',
      startDate: '2022-10',
      endDate: '2024-01',
      location: 'Dhaka, Bangladesh',
      accent: 'secondary' as const,
      summary:
        'Stepped up to lead and manage a 4-member software development team. Managed cross-functional coordination and spearheaded an enterprise-grade multi-tenant e-commerce Admin Panel in Angular.',
      achievements: [
        'Stepped up to lead and manage a 4-member software development team.',
        'Managed cross-functional coordination with Product Managers, Head of Department, Principal Architects, UI/UX designers, and QA to seamlessly scope, breakdown, and deliver quarterly feature roadmaps.',
        'Owned and maintained internal frontend libraries (auth, themes, query layers, WebSockets), significantly improving cross-team UI development efficiency.',
        'Spearheaded an enterprise-grade multi-tenant e-commerce Admin Panel in Angular.',
        'Implemented complex reactive architectures for dynamic multi-tenant bootstrap setups based on URL context, role-based access control (RBAC), advanced inventory pipelines, reporting management, and real time notifications.',
      ],
      highlights: [
        {
          topic: 'Team Leadership',
          detail:
            'Stepped up to lead and manage a 4-member software development team. Managed cross-functional coordination with Product Managers, Head of Department, Principal Architects, UI/UX designers, and QA to seamlessly scope, breakdown, and deliver quarterly feature roadmaps.',
        },
        {
          topic: 'Core Libraries',
          detail:
            'Owned and maintained internal frontend libraries (auth, themes, query layers, WebSockets), significantly improving cross-team UI development efficiency.',
        },
        {
          topic: 'Multi-Tenant Admin Development',
          detail:
            'Spearheaded an enterprise-grade multi-tenant e-commerce Admin Panel in Angular. Implemented complex reactive architectures for dynamic multi-tenant bootstrap setups based on URL context, role-based access control (RBAC), advanced inventory pipelines, reporting management, and real time notifications.',
        },
      ],
      skills: [
        'Angular',
        'TypeScript',
        'RxJS',
        'Angular Material',
        'WebSockets',
        'RBAC',
        'Multi-Tenancy',
        'Team Leadership',
        'Architecture',
      ],
    },
    {
      company: 'SELISE Digital Platforms',
      title: 'Software Engineer',
      period: '03/2021 – 10/2022',
      startDate: '2021-03',
      endDate: '2022-10',
      location: 'Dhaka, Bangladesh',
      accent: 'tertiary' as const,
      summary:
        'Acted as the primary driver for frontend development, independently executing 60-70% of all user interface deliverables for high-profile clients, primarily IPEX AG (market leader in Swiss building damage management).',
      achievements: [
        'Acted as the primary driver for frontend development, independently executing 60-70% of all user interface deliverables for high-profile clients, primarily IPEX AG (market leader in Swiss building damage management and digitization).',
        'Built interactive, highly responsive enterprise UI components in Angular and Angular Material, optimizing complex data tables, advanced calculation engines, dynamic reactive forms, and drag-and-drop workflow dashboards.',
        'Built a custom Selenium wrapper framework to automate regression testing across 6+ distinct enterprise web platforms.',
        'Conducted JMeter load testing to isolate system bottlenecks.',
      ],
      highlights: [
        {
          topic: 'Core Delivery',
          detail:
            'Acted as the primary driver for frontend development, independently executing 60-70% of all user interface deliverables for high-profile clients, primarily IPEX AG (the market leader in Swiss building damage management and digitization).',
        },
        {
          topic: 'Feature Engineering',
          detail:
            'Built interactive, highly responsive enterprise UI components in Angular and Angular Material, optimizing complex data tables, advanced calculation engines, dynamic reactive forms, and drag-and-drop workflow dashboards.',
        },
        {
          topic: 'Automation',
          detail:
            'Built a custom Selenium wrapper framework to automate regression testing across 6+ distinct enterprise web platforms. Conducted JMeter load testing to isolate system bottlenecks.',
        },
      ],
      skills: [
        'Angular',
        'Angular Material',
        'TypeScript',
        'Reactive Forms',
        'Selenium',
        'JMeter',
        'Test Automation',
        'Performance Testing',
      ],
    },
  ],

  // Education exactly from CV
  education: [
    {
      degree: 'B.Sc. in Computer Science & Engineering',
      institution: 'Comilla University',
      period: '2016 – 2020',
      location: 'Cumilla, Bangladesh',
      accent: 'primary' as const,
      highlights:
        'Strong computer science foundation in Data Structures, Algorithms, Discrete Mathematics, OOP, Database Systems, Computer Networks, and Operating Systems.',
    },
  ],

  // Competitive Programming & Core Achievements from CV
  competitiveProgramming: {
    title: 'Competitive Programming & Achievements',
    summary:
      'Solved 1,700+ Problems (Codeforces Specialist - Max Rating 1544). Compete in 10+ national contests including ICPC Dhaka Regional & NCPC. Official Judge & Problem Setter for university-level contests.',
    items: [
      {
        title: 'Problem Solver (1,700+ Problems)',
        description: 'Codeforces Specialist (Max Rating 1544), active on Codeforces, Codechef, LightOJ, and UVA.',
        icon: '🏆',
      },
      {
        title: 'ICPC Dhaka Regional & NCPC',
        description: 'Competed in 10+ national programming contests, representing Comilla University first team.',
        icon: '🥇',
      },
      {
        title: 'Official Judge & Problem Setter',
        description: 'Authored, tested and judged algorithmic contest problems for university-level competitions.',
        icon: '⚖️',
      },
      {
        title: 'SELISE Super Talent Program (STP)',
        description: 'Achieved top 10 rank among hundreds of competitive applicants during hiring selection.',
        icon: '🌟',
      },
    ],
  },
};
