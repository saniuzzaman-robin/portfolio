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
    tools: { label: 'Tools', description: 'Developer utilities that run locally' },
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
    tools: 'Tools',
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
    backToTop: 'Top',
  },
  tools: {
    label: 'Tools',
    title: 'Developer tools,',
    accent: 'fast & private.',
    description:
      'Formatters, encoders, generators and inspectors for everyday engineering work. Everything runs in your browser — nothing you paste leaves this tab.',
    search: 'Search tools',
    searchPlaceholder: 'Search tools…',
    noResults: 'No tools match “{query}”',
    privacy: {
      title: 'Your data never leaves your device',
      description:
        'These tools are safe for everyone to use, including with private or sensitive input.',
      points: {
        local: {
          title: 'Processed on your device',
          text: 'Everything you paste, type or drop is handled by code running in your browser. There is no server that receives it, and no account is needed.',
        },
        noUpload: {
          title: 'Nothing is uploaded or stored',
          text: "The tools make no network requests with your input. The site's security policy also blocks pages from sending data anywhere except this site and Google Analytics, which only counts page visits.",
        },
        stored: {
          title: 'Kept only in your browser',
          text: "Inputs are saved in your browser's local storage so you can pick up where you left off. Keys, passwords and passphrases are never saved. On a shared computer, clear this site's data when you are done.",
        },
      },
      seo: 'Runs entirely in your browser: nothing is uploaded.',
    },
    categories: {
      data: 'Data & formats',
      encoding: 'Encoding',
      security: 'Security',
      generators: 'Generators',
      text: 'Text',
      web: 'Web & design',
      infra: 'Time & network',
    },
    items: {
      json: {
        label: 'JSON',
        title: 'JSON Formatter & Validator',
        description:
          'Format, minify, validate and repair JSON with exact error positions, a searchable tree view and JSONPath queries. Big numbers are kept exactly.',
      },
      format: {
        label: 'Format & Minify',
        title: 'Code Formatter & Minifier',
        description:
          'Beautify HTML, CSS, SCSS, Less, JavaScript, TypeScript, JSON, XML, SQL in 20 dialects, YAML, Markdown and GraphQL with Prettier, and minify HTML, CSS, JavaScript, JSON and XML. Shows exact error positions and how much minifying saves.',
      },
      encode: {
        label: 'Encode / Decode',
        title: 'Encoder & Decoder',
        description:
          'Base64, Base32, hex, binary, URL, HTML entities, Unicode escapes, punycode, quoted-printable and ROT13, both ways. Also converts files to base64 and data URIs and back, and splits URLs into editable parts.',
      },
      jwt: {
        label: 'JWT',
        title: 'JWT Debugger',
        description:
          'Decode, verify and sign JSON Web Tokens. Shows color-coded parts and readable claims with expiry status, and checks HS, RS, PS, ES and EdDSA signatures with a secret, PEM key, certificate or JWK.',
      },
      crypto: {
        label: 'Hash & Crypto',
        title: 'Hash, HMAC & Encryption Tools',
        description:
          'MD5, SHA-1, SHA-2, SHA-3, Keccak and CRC-32 hashes and HMACs of text or files, with checksum comparison. AES-GCM/CBC/CTR encryption compatible with OpenSSL and CryptoJS, bcrypt hashing and checking, and RSA, EC and Ed25519 key pairs as PEM or JWK.',
      },
      generate: {
        label: 'Generators',
        title: 'UUID, ULID, NanoID & Password Generator',
        description:
          'Generate UUIDs (v1, v3, v4, v5, v6, v7), ULIDs, NanoIDs, MongoDB ObjectIds and random bytes in bulk, and inspect any UUID, ULID or ObjectId for its version and embedded time. Strong passwords and passphrases with their entropy shown, all from a cryptographically secure source.',
      },
      diff: {
        label: 'Diff',
        title: 'Text & JSON Diff',
        description:
          'Compare two texts or JSON documents side by side or unified, with word- and character-level highlights, collapsible unchanged lines and change navigation. JSON mode ignores key order and lists every added, removed and changed path.',
      },
      convert: {
        label: 'Convert',
        title: 'JSON, YAML, CSV & XML Converter',
        description:
          'Convert JSON to and from YAML, CSV/TSV, XML and query strings, or generate TypeScript interfaces and Zod schemas from a JSON sample. Handles multi-document YAML, quoted CSV fields, nested columns and XML attributes, and keeps big numbers exact.',
      },
      time: {
        label: 'Time',
        title: 'Epoch Converter, Date Difference & Cron',
        description:
          'Convert Unix timestamps (seconds to nanoseconds) to and from ISO 8601, RFC 2822 and any time zone, measure the time between two dates, add durations, and explain cron expressions with their next runs, DST included. Supports Quartz L, W and #.',
      },
      regex: {
        label: 'Regex',
        title: 'Regex Tester',
        description:
          'Test JavaScript regular expressions with live match highlighting, a match and capture group table, replace and split previews, a token-by-token explanation and a cheat sheet. Supports every flag including d-style indices, v and named groups, and stops runaway patterns instead of freezing the tab.',
      },
      text: {
        label: 'Text',
        title: 'Text Tools: Case, Lines, Counter & Escape',
        description:
          'Convert text between camelCase, snake_case, kebab-case, Title Case and more, make URL slugs, sort and dedupe lines, count words, characters, graphemes and bytes, escape strings for JSON, JavaScript, SQL, regex, CSV or shell, and generate lorem ipsum.',
      },
      color: {
        label: 'Color',
        title: 'Color Converter & Contrast Checker',
        description:
          'Convert any CSS color between HEX, RGB, HSL, HWB, OKLCH, OKLab and CMYK, pick colors visually, check WCAG 2 contrast and APCA against a background, and build a tints and shades scale. Out-of-gamut colors are flagged.',
      },
      network: {
        label: 'Network',
        title: 'IP Subnet & CIDR Calculator',
        description:
          'Calculate IPv4 and IPv6 CIDR blocks: network, broadcast, host range, netmask, wildcard, host count and a binary view, with private and reserved ranges named. Split a block into subnets, and check which blocks in a list contain an address or overlap each other.',
      },
      'qr-code': {
        label: 'QR Code',
        title: 'QR Code Generator',
        description:
          'Make QR codes for text, URLs, Wi-Fi networks, contact cards and emails. Choose the error correction level, size, quiet zone and colors (with a warning when contrast is too low), and download crisp SVG or PNG files.',
      },
      markdown: {
        label: 'Markdown',
        title: 'Markdown Editor & Preview',
        description:
          'Write Markdown with a live, sanitized preview: CommonMark plus GitHub tables, task lists and strikethrough, with synced scrolling. Copy the HTML or download it as a complete page.',
      },
    },
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
    toolsTitle: 'Developer Tools',
    toolsDescription:
      'Free, private developer tools that run entirely in your browser, so nothing is uploaded: JSON formatter, encoders, JWT debugger, hashing, ID generators, diff and more.',
    toolsCollection: 'Browser-based developer tools',
    resumeTitle: 'Experience & Resume',
    resumeDescription:
      'Resume of Md. Saniuzzaman Robin: 5+ years of software engineering across Bitsmedia (MuslimPro), KONA Software Lab and SELISE Digital Platforms. Skills, experience, education and achievements.',
    resumePage: 'Resume',
    resumePageDescription: 'Complete resume with work experience, technical skills, and education',
  },
};

export type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };
export type Messages = Widen<typeof en>;
