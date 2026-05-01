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
    'Full-stack software engineer with 5+ years of experience building production-grade web applications and backend systems. Specialized in NestJS for scalable APIs and microservices, Next.js and Angular for performant frontend experiences. Proven expertise in system architecture, performance optimization, and competitive programming with 1700+ problems solved.',

  // Short descriptions for different contexts
  shortBio:
    'Software engineer with 5+ years of experience building production-grade web applications.',
  aboutMeTitle: 'Software Engineer · 5+ Years',
  aboutMeDesc:
    'I specialize in building production-grade web applications and backend systems. My expertise spans full-stack development with NestJS for scalable APIs and Next.js & Angular for performant frontends. Passionate about clean code, system architecture, and solving complex problems.',

  // Experience data
  experience: [
    {
      company: 'Bitsmedia Pte Ltd.',
      title: 'Software Engineer',
      titleFull: 'Software Engineer',
      period: '01/2024 - Present',
      startDate: '2024-01',
      endDate: null,
      duration: '~2.4 years',
      description:
        'Developing full-stack features using Next.js and NestJS. Architecting scalable APIs with caching optimization via Redis and MongoDB.',
      descriptionLong:
        'Develop and maintain full-stack features using Next.js and NestJS. Architect scalable solutions with API implementation and performance optimization. Integrated caching and SSR optimizations for Next.js pages. Implemented scalable architecture with Redis and MongoDB.',
      achievements: [
        'Develop and maintain full-stack features using Next.js and NestJS',
        'Architect scalable solutions with API implementation and performance optimization',
        'Integrated caching and SSR optimizations for Next.js pages',
        'Implemented scalable architecture with Redis and MongoDB',
      ],
      skills: ['Next.js', 'NestJS', 'Redis', 'MongoDB', 'TypeScript', 'System Design'],
      accent: 'primary',
      highlights: [
        { label: 'Stack', value: 'Next.js + NestJS' },
        { label: 'Performance', value: 'Caching & Optimization' },
        { label: 'Database', value: 'MongoDB & Redis' },
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
        'Led a 4-member team and developed an Admin Panel with Angular. Maintained reusable frontend libraries and managed project architecture.',
      descriptionLong:
        'Coordinated 4-member development team. Spearheaded development of Admin Panel with Angular. Maintained reusable frontend libraries and components. Managed project architecture and caching strategies.',
      achievements: [
        'Coordinated 4-member development team',
        'Spearheaded development of Admin Panel with Angular',
        'Maintained reusable frontend libraries and components',
        'Managed project architecture and caching strategies',
      ],
      skills: ['Angular', 'TypeScript', 'RxJS', 'Angular Material', 'Team Leadership'],
      accent: 'secondary',
      highlights: [
        { label: 'Team', value: '4 members' },
        { label: 'Frontend', value: 'Admin Panel' },
        { label: 'Libraries', value: 'Reusable Components' },
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
        'Built responsive web apps with Angular & Angular Material. Created a custom Selenium wrapper and ran JMeter load tests for performance.',
      descriptionLong:
        'Developed responsive web applications using Angular and Angular Material. Created custom Selenium wrapper for automated testing. Conducted load testing with JMeter for performance analysis. Collaborated with UX and backend teams on complex features.',
      achievements: [
        'Developed responsive web applications using Angular and Angular Material',
        'Created custom Selenium wrapper for automated testing',
        'Conducted load testing with JMeter for performance analysis',
        'Collaborated with UX and backend teams on complex features',
      ],
      skills: ['Angular', 'Angular Material', 'Selenium', 'JMeter', 'Testing'],
      accent: 'tertiary',
      highlights: [
        { label: 'Testing', value: 'Selenium & JMeter' },
        { label: 'Responsive', value: 'Angular Material' },
        { label: 'Performance', value: 'Load Testing' },
      ],
    },
  ],

  // Skills with proficiency levels
  skills: {
    frontend: 'Next.js, Angular, React, Tailwind, RxJS, Zustand, Angular Material, Shadcn',
    backend: 'NestJS, .NET (C#), GCP, RabbitMQ, Redis, MongoDB, REST, TDD, SOLID',
    others: 'Git, Postman, Selenium, JMeter, Jest, SEO, Agile, Scrum',
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
        { name: 'REST APIs', level: 95 },
        { name: 'MongoDB', level: 92 },
        { name: 'Redis', level: 90 },
        { name: 'System Architecture', level: 91 },
        { name: 'Database Optimization', level: 88 },
        { name: '.NET (C#)', level: 82 },
        { name: 'RabbitMQ', level: 85 },
      ],
    },
    {
      category: 'DevOps & Tools',
      accent: 'tertiary',
      icon: '🔧',
      skills: [
        { name: 'Git', level: 95 },
        { name: 'Agile / Scrum', level: 90 },
        { name: 'Jest / Testing', level: 90 },
        { name: 'GCP / Cloud', level: 82 },
        { name: 'Selenium / Automation', level: 85 },
        { name: 'JMeter / Performance', level: 80 },
        { name: 'CI/CD Pipelines', level: 85 },
        { name: 'Docker / Containers', level: 80 },
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
      'Solved 1700+ problems across Codeforces, Codechef, LightOJ, UVA. Led teams at 10+ national contests including ICPC Dhaka Regional and NCPC. Judge and problem setter for university programming contests.',
    achievements: [
      'Solved 1700+ problems (Codeforces, Codechef, LightOJ, UVA)',
      'Led CP team in 10+ national level contests',
      'ICPC Dhaka Regional Finalist',
    ],
  },

  // Problem Setting & Judging
  problemSetting: {
    title: 'Problem Setter & Judge',
    description: 'Organized and judged several Intra and Inter-University Programming contests',
  },

  // About sections for different pages
  aboutSections: [
    {
      title: 'Software Engineer · 5+ Years',
      accent: 'primary',
      body: 'I specialize in building production-grade web applications and backend systems. My expertise spans full-stack development with NestJS for scalable APIs and Next.js & Angular for performant frontends. Passionate about clean code, system architecture, and solving complex problems.',
    },
    {
      title: 'Competitive Programming Background',
      accent: 'secondary',
      body: 'Solved 1700+ problems across Codeforces, Codechef, LightOJ, UVA. Led teams at 10+ national contests including ICPC Dhaka Regional and NCPC. Judge and problem setter for university programming contests.',
    },
    {
      title: 'Beyond Development',
      accent: 'tertiary',
      body: 'Passionate about mentoring developers, conducting code reviews, and architectural planning. Experienced with Agile methodologies, Git workflows, testing frameworks, and DevOps practices. Continuous learner exploring emerging technologies.',
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
