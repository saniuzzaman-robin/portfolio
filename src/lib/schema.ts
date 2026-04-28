/**
 * Structured Data / JSON-LD Schema Generator
 * Helps with SEO and search engine understanding
 */

import { CV_DATA } from './cv-data';

const getSiteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://saniuzzaman.dev';

export const siteConfig = {
  name: CV_DATA.name,
  title: CV_DATA.title,
  description: CV_DATA.shortBio,
  url: getSiteUrl(),
  email: CV_DATA.email,
  phone: CV_DATA.phone,
  location: CV_DATA.location,
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
    workExperience: CV_DATA.experience.map((exp) => ({
      '@type': 'WorkExperience',
      jobTitle: exp.title,
      employer: {
        '@type': 'Organization',
        name: exp.company,
      },
      startDate: exp.startDate,
      ...(exp.endDate && { endDate: exp.endDate }),
      description: exp.descriptionLong,
    })),
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
