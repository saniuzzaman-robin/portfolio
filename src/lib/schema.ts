/**
 * Structured Data / JSON-LD Schema Generator
 * Helps with SEO and search engine understanding
 */

const getSiteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://saniuzzaman.dev';

export const siteConfig = {
  name: 'Md. Saniuzzaman Robin',
  title: 'Full-Stack Software Engineer',
  description:
    'Full-stack software engineer with 5+ years of experience building production-grade web applications.',
  url: getSiteUrl(),
  email: 'saniuzzamanrobin07@gmail.com',
  phone: '+880 1811 685 391',
  location: 'Dhaka, Bangladesh',
  social: {
    github: 'https://github.com/saniuzzaman-robin',
    linkedin: 'https://linkedin.com/in/saniuzzaman-robin',
  },
};

/**
 * Generate Person schema for homepage/about
 */
export function generatePersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    jobTitle: 'Software Engineer',
    knowsAbout: [
      'Full-Stack Development',
      'NestJS',
      'Next.js',
      'Angular',
      'TypeScript',
      'React',
      'System Architecture',
      'Competitive Programming',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dhaka',
      addressCountry: 'BD',
    },
    sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
    image: `${siteConfig.url}/og-image.jpg`,
    workExperience: [
      {
        '@type': 'WorkExperience',
        jobTitle: 'Software Engineer',
        employer: {
          '@type': 'Organization',
          name: 'Bitsmedia Pte Ltd.',
        },
        startDate: '2024-01',
        description: 'Full-stack development with Next.js and NestJS',
      },
      {
        '@type': 'WorkExperience',
        jobTitle: 'Software Engineer - L02',
        employer: {
          '@type': 'Organization',
          name: 'KONA Software Lab Ltd.',
        },
        startDate: '2022-10',
        endDate: '2024-01',
        description: 'Team lead and frontend development with Angular',
      },
      {
        '@type': 'WorkExperience',
        jobTitle: 'Software Engineer',
        employer: {
          '@type': 'Organization',
          name: 'SELISE Digital Platforms',
        },
        startDate: '2021-03',
        endDate: '2022-10',
        description: 'Responsive web applications and testing automation',
      },
    ],
  };
}

/**
 * Generate BreadcrumbList schema for page navigation
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Project schema for projects page
 */
export function generateProjectSchema(project: {
  title: string;
  description: string;
  link: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: project.link,
    creator: {
      '@type': 'Person',
      name: siteConfig.name,
    },
  };
}

/**
 * Generate FAQPage schema for FAQ sections
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
  };
}

/**
 * Generate WebPage schema
 */
export function generateWebPageSchema(options: {
  title: string;
  description: string;
  url: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: options.title,
    description: options.description,
    url: options.url,
    image: options.image || `${siteConfig.url}/og-image.jpg`,
    creator: {
      '@type': 'Person',
      name: siteConfig.name,
    },
  };
}

/**
 * Generate CollectionPage schema for projects/blog
 */
export function generateCollectionSchema(options: {
  name: string;
  description: string;
  url: string;
  items: Array<{ name: string; description: string; url: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: options.name,
    description: options.description,
    url: options.url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: options.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          name: item.name,
          description: item.description,
          url: item.url,
        },
      })),
    },
  };
}

/**
 * Generate SoftwareApplication schema for browser game pages
 */
export function generateGameSchema(options: {
  name: string;
  description: string;
  url: string;
  genre: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: options.name,
    description: options.description,
    url: options.url,
    applicationCategory: 'Game',
    applicationSubCategory: options.genre,
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}
