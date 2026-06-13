/**
 * Centralized CV Data
 * Single source of truth for all CV-related content
 */

export const CV_DATA = {
  name: 'Md. Saniuzzaman Robin',
  title: 'Full-Stack Software Engineer',
  yearsOfExperience: '5+',
  email: 'saniuzzamanrobin07@gmail.com',
  phone: '+880 1811 685 391',
  location: 'Dhaka, Bangladesh',

  // Professional summary
  summary:
    'Software Engineer with 5+ years of experience building high-traffic, production-grade applications for millions of global users. Expert in Next.js/NestJS/MongoDB/Redis and Angular. Proven track record in microservices design, tech leadership, performance optimization, and transforming complex business requirements into scalable architectures. Strong computer science foundation rooted in competitive programming (ICPC Regional).',

  // Short descriptions for different contexts
  shortBio:
    'Software engineer with 5+ years of experience building production-grade applications for millions of global users.',
  aboutMeTitle: 'Software Engineer · 5+ Years',
  aboutMeDesc:
    'I build production-grade web applications and backend systems serving millions of global users. Expert in Next.js and NestJS for full-stack delivery, Angular for enterprise frontends. Passionate about clean architecture, performance optimization, and impactful engineering.',

  // Experience data
  experience: [
    {
      company: 'Bitsmedia Pte Ltd.',
      title: 'Software Engineer (Full-Stack)',
      titleFull: 'Software Engineer (Full-Stack)',
      period: '01/2024 - Present',
      startDate: '2024-01',
      endDate: null,
      duration: '~2.5 years',
      description:
        'Building full-stack features for MuslimPro — a platform with 180M+ app downloads — using Next.js and NestJS. Delivered Prayer Times migration, Giving platform relaunch (30% YoY donation increase), Qalbox video streaming, and Admin Console from scratch.',
      descriptionLong:
        'Develop full-stack features using Next.js and NestJS for MuslimPro, serving millions of global users. Migrated Prayer Times engine from Kotlin to NestJS with MaxMind GeoIP and Google Maps integration. Re-platformed legacy WordPress Giving engine to Next.js/WooCommerce with advanced SEO, driving a 30% YoY increase in donations in 2025–2026. Built Qalbox video streaming (shorts, live streams, search). Engineered Admin Console from scratch with reusable tables, forms, and auth modules. Delivered backend microservices for Journal, Inspiration, Referral, and Gamification. Supported Islamic Calendar release. Led Settings Revamp from JSON data-fetching to modular stream-optimized feature components. Integrated SEO (structured data, sitemaps, og tags) and Google Ads & Analytics.',
      achievements: [
        'Migrated Prayer Times engine from Kotlin to NestJS with MaxMind GeoIP & Google Maps APIs',
        'Re-platformed Giving donation engine from WordPress to Next.js/WooCommerce — drove 30% YoY donation increase',
        'Engineered Admin Console from scratch in Next.js with auth, reusable tables, forms, and navigation',
        'Built Qalbox video streaming: completed shorts page, integrated live streaming and search',
        'Delivered backend microservices for Journal, Inspiration, Referral, and Gamification features',
        'Led Settings Revamp: migrated JSON data-fetching to modular, stream-optimized feature components',
        'Implemented Islamic Calendar backend APIs and supported FE integration',
        'Integrated SEO (structured data, sitemaps, og tags, robots.txt) and Google Ads & Analytics',
        'Implemented Redis caching, MongoDB index optimization, and SSR/SSG/streaming for performance',
        'Conduct code reviews, architecture feedback, and guide engineering peers',
      ],
      skills: [
        'Next.js',
        'NestJS',
        'Redis',
        'MongoDB',
        'TypeScript',
        'Google Pub/Sub',
        'GCP',
        'WooCommerce',
        'SEO',
        'Microservices',
      ],
      accent: 'primary',
      highlights: [
        { label: 'Stack', value: 'Next.js + NestJS' },
        { label: 'Impact', value: '30% Donation Increase' },
        { label: 'Scale', value: 'Millions of Users' },
      ],
    },
    {
      company: 'KONA Software Lab Ltd.',
      title: 'Software Engineer - L02',
      titleFull: 'Software Engineer - L02',
      period: '10/2022 - 01/2024',
      startDate: '2022-10',
      endDate: '2024-01',
      duration: '15 months',
      description:
        'Led a 4-member team building an enterprise-grade multi-tenant e-commerce Admin Panel in Angular. Owned internal frontend libraries and expanded to .NET 6 backend with CQRS, SAGA patterns, and microservices.',
      descriptionLong:
        'Stepped up to lead and manage a 4-member development team when the lead departed. Spearheaded multi-tenant e-commerce Admin Panel in Angular with RBAC, dynamic URL-based bootstrap, advanced inventory, product/order management, reporting, and real-time notifications. Owned and maintained internal frontend libraries (auth, themes, query/command services, WebSockets) enabling cross-team reuse. Collaborated closely with PM, HOD, Principal Architects, designers, and QA for quarterly roadmap delivery. Later expanded to .NET 6 backend — implemented CQRS, SAGA patterns, and product/order/cart microservices for a new e-commerce platform.',
      achievements: [
        'Led and managed a 4-member software development team, stepping up when the team lead left',
        'Spearheaded multi-tenant e-commerce Admin Panel in Angular with RBAC and dynamic URL-based bootstrap',
        'Implemented complex features: inventory, product & order pipelines, reporting, real-time notifications',
        'Owned internal frontend libraries (auth, themes, query/command services, WebSockets) for cross-team efficiency',
        'Collaborated with PM, HOD, Principal Architects, designers, and QA for quarterly roadmap delivery',
        'Expanded to .NET 6 backend — implemented CQRS, SAGA patterns and product/order/cart microservices',
      ],
      skills: [
        'Angular',
        'TypeScript',
        'RxJS',
        'Angular Material',
        '.NET 6',
        'C#',
        'CQRS',
        'SAGA',
        'Microservices',
        'Team Leadership',
      ],
      accent: 'secondary',
      highlights: [
        { label: 'Team', value: '4 Members Led' },
        { label: 'Architecture', value: 'CQRS + SAGA' },
        { label: 'Libraries', value: 'Internal Frontend Libs' },
      ],
    },
    {
      company: 'SELISE Digital Platforms',
      title: 'Software Engineer',
      titleFull: 'Software Engineer',
      period: '03/2021 - 10/2022',
      startDate: '2021-03',
      endDate: '2022-10',
      duration: '19 months',
      description:
        "Joined through the STP (Super Talent Program) — top 5 out of hundreds of applicants. Primary frontend engineer for IPEX AG (Switzerland's market leader in building damage management), delivering 60–70% of all UI features.",
      descriptionLong:
        "Joined through SELISE's STP (Super Talent Program) after placing top 5 in competitive programming rounds. Primary frontend engineer for IPEX AG — Switzerland's market leader in building damage management and digitization — and Berger Paints. Built complex Angular + Angular Material UIs: reactive forms, advanced calculation engines, data tables, drag-and-drop workflow dashboards, navigation, tooltips, and popups. Implemented automated OCR-based PDF processing pipeline for insurance claim case management. Built custom Selenium wrapper for regression testing across 6+ enterprise platforms. Conducted JMeter load testing to isolate performance bottlenecks.",
      achievements: [
        'Joined via STP (Super Talent Program) — achieved top 5 out of hundreds of applicants',
        'Acted as primary frontend driver — independently executed 60–70% of all UI deliverables',
        'Built complex Angular UI for IPEX AG: reactive forms, calculation engines, data tables, drag-and-drop dashboards',
        'Implemented automated OCR-based PDF processing pipeline for insurance claim case management',
        'Developed Selenium wrapper framework automating regression testing across 6+ enterprise platforms',
        'Conducted JMeter load testing to isolate and resolve performance bottlenecks',
      ],
      skills: ['Angular', 'Angular Material', 'Selenium', 'JMeter', 'TypeScript', 'RxJS'],
      accent: 'tertiary',
      highlights: [
        { label: 'Hiring', value: 'STP Top 5' },
        { label: 'Output', value: '60–70% FE Work' },
        { label: 'Testing', value: 'Selenium + JMeter' },
      ],
    },
  ],

  // Skills with proficiency levels
  skills: {
    frontend:
      'Next.js, Angular, React, Tailwind CSS, RxJS, Zustand, Angular Material, Shadcn, WooCommerce',
    backend:
      'NestJS, .NET 6 (C#), GCP, Google Pub/Sub, Redis, MongoDB, REST, Microservices, CQRS, SAGA, SOLID',
    others:
      'Git, Selenium, JMeter, Jest, MaxMind GeoIP, SEO, Google Analytics (GTM), AI Tools (Gemini/Copilot), Agile, Scrum',
  },

  // Detailed skill categories with proficiency levels
  skillsDetailed: [
    {
      category: 'Frontend Development',
      accent: 'primary',
      icon: '⚡',
      skills: [
        { name: 'Next.js', level: 95 },
        { name: 'React', level: 92 },
        { name: 'Angular', level: 95 },
        { name: 'TypeScript', level: 93 },
        { name: 'Tailwind CSS', level: 94 },
        { name: 'RxJS / State Management', level: 90 },
        { name: 'Angular Material / Shadcn', level: 88 },
        { name: 'Performance Optimization', level: 87 },
      ],
    },
    {
      category: 'Backend Development',
      accent: 'secondary',
      icon: '🚀',
      skills: [
        { name: 'NestJS', level: 96 },
        { name: 'REST APIs / Microservices', level: 95 },
        { name: 'MongoDB', level: 92 },
        { name: 'Redis', level: 90 },
        { name: 'System Architecture', level: 91 },
        { name: 'CQRS / SAGA Patterns', level: 85 },
        { name: 'Google Pub/Sub / GCP', level: 84 },
        { name: '.NET 6 (C#)', level: 82 },
      ],
    },
    {
      category: 'DevOps & Tools',
      accent: 'tertiary',
      icon: '🔧',
      skills: [
        { name: 'Git', level: 95 },
        { name: 'SEO / Google Analytics (GTM)', level: 90 },
        { name: 'Jest / Testing', level: 90 },
        { name: 'Selenium / Automation', level: 86 },
        { name: 'Agile / Scrum', level: 90 },
        { name: 'JMeter / Performance', level: 80 },
        { name: 'AI Tools (Gemini / Copilot)', level: 88 },
        { name: 'MaxMind GeoIP / Maps APIs', level: 83 },
      ],
    },
  ],

  // Education
  education: [
    {
      degree: 'B.Sc. in Computer Science & Engineering',
      institution: 'Cumilla University',
      period: '01/2016 - 12/2020',
      location: 'Cumilla, Bangladesh',
    },
  ],

  // Competitive Programming
  competitiveProgramming: {
    title: 'Competitive Programming Achievements',
    description:
      'Solved 1700+ problems across Codeforces, Codechef, LightOJ, and UVA. Participated in 10+ national contests including ICPC Dhaka Regional and NCPC. Led CP team and was later selected as a member of the university first-choice team. Codeforces Specialist — Max Rating 1544.',
    achievements: [
      'Solved 1700+ problems (Codeforces Specialist — Max Rating 1544)',
      'Participated in 10+ national contests: ICPC Dhaka Regional, NCPC, and university circuits',
      "Led CP team; later selected as member of the university's first-choice team",
      'Official Judge & Problem Setter for intra and inter-university programming contests',
    ],
  },

  // Problem Setting & Judging
  problemSetting: {
    title: 'Problem Setter & Judge',
    description:
      'Designed, tested, and judged problems for several Intra and Inter-University Programming contests, ensuring mathematical rigor and fairness.',
  },

  // About sections for different pages
  aboutSections: [
    {
      title: 'Software Engineer · 5+ Years',
      accent: 'primary',
      body: 'I build production-grade web applications and backend systems serving millions of global users. My stack centers on Next.js and NestJS for full-stack feature delivery, and Angular for enterprise frontends. I care deeply about performance — from SSR/SSG strategies and Redis caching to MongoDB index tuning and streaming architectures.',
    },
    {
      title: 'Competitive Programming Background',
      accent: 'secondary',
      body: 'Solved 1700+ problems across Codeforces, Codechef, LightOJ, and UVA. Participated in 10+ national contests including ICPC Dhaka Regional and NCPC. Led my university CP team and was later selected for the first-choice team. Official Judge & Problem Setter for intra and inter-university contests. Codeforces Specialist — Max Rating 1544.',
    },
    {
      title: 'Beyond Development',
      accent: 'tertiary',
      body: 'I lead teams, conduct thorough code reviews, and mentor engineers on architecture and best practices. Experienced with Agile/Scrum workflows and cross-functional collaboration with PMs, designers, QA, and principal architects. Actively leveraging AI-assisted development (Gemini & GitHub Copilot) to ship faster within current usage tiers.',
    },
  ],

  // Highlights for about page
  highlights: [
    {
      icon: '🎯',
      title: 'Problem Solver',
      desc: 'Tackling complex challenges with creative algorithmic solutions',
      accent: 'primary',
    },
    {
      icon: '🚀',
      title: 'Performance Driven',
      desc: 'Building fast, responsive, scalable systems that serve millions',
      accent: 'secondary',
    },
    {
      icon: '💡',
      title: 'Innovator',
      desc: 'Exploring emerging technologies and modern best practices',
      accent: 'tertiary',
    },
  ],
};
