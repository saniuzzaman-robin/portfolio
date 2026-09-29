/**
 * UI strings. English is the source of truth: `Messages` is inferred from it, so other
 * locales fail type-checking when a key is missing. `{name}` placeholders are filled by `fmt`.
 */
export const en = {
  common: {
    technologies: 'Technologies',
    available: 'Available for senior roles',
    resumePdf: 'Resume PDF',
    downloadResume: 'Download resume',
    email: 'Email',
    language: 'Language',
  },
  nav: {
    overview: { label: 'Overview', description: 'Work, experience & skills' },
    experience: { label: 'Experience', description: 'Full resume & timeline' },
    platforms: { label: 'Platforms', description: 'Systems designed & shipped' },
  },
  navbar: {
    primary: 'Primary',
    years: '{years} Yrs',
    openCommand: 'Open command menu',
    resume: 'Resume',
    toLight: 'Switch to light theme',
    toDark: 'Switch to dark theme',
    toggleMenu: 'Toggle navigation menu',
  },
  mobileNav: {
    dialog: 'Site navigation',
    close: 'Close navigation menu',
    nav: 'Mobile',
    menu: 'Menu',
    appearance: 'Appearance',
    theme: 'Theme',
    connect: 'Connect',
  },
  theme: { light: 'Light', dark: 'Dark', system: 'System' },
  command: {
    dialog: 'Command menu',
    placeholder: 'Type a command or search…',
    search: 'Search commands',
    navigate: 'Navigate',
    actions: 'Actions',
    theme: 'Theme',
    elsewhere: 'Elsewhere',
    downloadResume: 'Download resume (PDF)',
    copyEmail: 'Copy email address',
    emailCopied: 'Email copied',
    sendEmail: 'Send an email',
    themeItem: '{name} theme',
    noResults: 'No results for “{query}”',
    hintNavigate: '↑↓ to navigate · ↵ to select',
    hintToggle: '⌘K to toggle',
  },
  hero: {
    headline: 'Building fast, resilient products for',
    accent: '2.5M+ daily users.',
    intro:
      "I'm Robin — a full-stack engineer with {years} years shipping Next.js, NestJS and Angular systems at scale, with a competitive-programming foundation that keeps the architecture honest.",
    viewWork: 'View selected work',
  },
  profileCard: {
    chipUsers: '2.5M+ daily users',
    chipRank: 'Codeforces Specialist',
    summary: 'Profile summary: {role} based in {location}',
    years: '{years} years',
    currentlyAt: 'Currently at',
    since: 'since {year}',
  },
  selectedWork: {
    label: 'Selected work',
    title: 'Production platforms, shipped to millions.',
    description:
      "A few of the systems I've designed and built — from geolocation microservices to a re-platformed donation engine.",
    all: 'All platforms',
  },
  experience: {
    label: 'Experience',
    title: 'Five years of owning outcomes,',
    accent: 'not just tickets.',
    description:
      'From leading a team on a multi-tenant commerce platform to migrating the Prayer Times service that now handles 400+ req/s at peak.',
    fullResume: 'Full resume',
    current: 'Current',
    focusAreas: 'Focus areas',
  },
  capabilities: {
    label: 'Capabilities',
    title: 'Production architecture,',
    accent: 'rooted in algorithms.',
    description:
      'A dual foundation: years of shipping distributed systems, and a competitive-programming habit that sharpens every design decision.',
    algorithms: 'Algorithms & problem solving',
    problemsSolved: 'problems solved',
  },
  techMarquee: { label: 'Technologies I work with' },
  contact: {
    eyebrow: 'Contact',
    title: 'Have a hard problem worth solving?',
    accent: "Let's talk.",
    body: "I'm open to senior engineering roles and interesting collaborations. Email is the fastest way to reach me.",
    sayHello: 'Say hello',
    copy: { idle: 'Copy email', copied: 'Copied!', error: 'Copy failed' },
    localTime: 'Local time',
  },
  footer: {
    nav: 'Footer',
    navigate: 'Navigate',
    connect: 'Connect',
    copyright: '© {year} {name}. Built with Next.js & Tailwind CSS.',
    backToTop: 'Back to top',
  },
  projects: {
    label: 'Platforms',
    title: "Systems I've",
    accent: 'designed & shipped.',
    description:
      'Production platforms, internal tooling and test infrastructure across Bitsmedia (MuslimPro), KONA Software Lab and SELISE — filter by discipline below.',
    section: 'Projects',
    heading: 'All platforms',
    filter: 'Filter by category',
    all: 'All',
    internal: 'Internal',
  },
  resume: {
    eyebrow: 'Resume',
    downloadPdf: 'Download PDF',
    print: 'Print',
    profile: 'Profile',
    experience: 'Experience',
    education: 'Education',
    atAGlance: 'At a glance',
    skills: 'Skills',
    achievements: 'Achievements',
    skillGroups: {
      frontendBackend: 'Frontend & Backend',
      dataInfrastructure: 'Data & Infrastructure',
      testingGrowth: 'Testing & Growth',
    },
  },
  notFound: {
    title: 'This page wandered off.',
    description: "The page you're looking for doesn't exist or has been moved.",
    backHome: 'Back home',
    browse: 'Browse platforms',
  },
  error: {
    title: 'Something went wrong.',
    description:
      'An unexpected error occurred while rendering this page. Try again, or head back home.',
    tryAgain: 'Try again',
    goHome: 'Go home',
  },
  a11y: { skipToContent: 'Skip to main content' },
  meta: {
    home: 'Home',
    homeDescription: '{title} with 5+ years of engineering experience',
    projectsTitle: 'Platforms & Deliveries',
    projectsDescription:
      'Production platforms built by Md. Saniuzzaman Robin: MuslimPro Prayer Times, the Giving donation platform, Qalbox streaming, enterprise admin consoles and test automation, built with Next.js, NestJS and Angular.',
    projectsCollection: 'Engineering platforms and production applications',
    resumeTitle: 'Experience & Resume',
    resumeDescription:
      'Resume of Md. Saniuzzaman Robin: 5+ years of software engineering across Bitsmedia (MuslimPro), KONA Software Lab and SELISE Digital Platforms. Skills, experience, education and achievements.',
    resumePage: 'Resume',
    resumePageDescription: 'Complete resume with work experience, technical skills, and education',
  },
};

type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };
export type Messages = Widen<typeof en>;
