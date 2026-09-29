/**
 * Structured Data / JSON-LD Schema Generator
 * Helps with SEO and search engine understanding
 */

import { CV_DATA } from './cv-data';
import { OG_IMAGE, SITE_NAME, SITE_URL } from './site';
import { LOCALES } from '@/i18n/config';

const siteConfig = {
  name: CV_DATA.name,
  title: CV_DATA.title,
  description: CV_DATA.shortBio,
  url: SITE_URL,
  email: CV_DATA.email,
  phone: CV_DATA.phone,
  location: CV_DATA.location,
  social: {
    github: CV_DATA.github,
    linkedin: CV_DATA.linkedin,
  },
};

/**
 * Generate Person schema for homepage/about
 */
export function generatePersonSchema() {
  const current = CV_DATA.experience.find((exp) => exp.endDate === null);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteConfig.url}/#person`,
    name: siteConfig.name,
    alternateName: 'Saniuzzaman Robin',
    jobTitle: CV_DATA.role,
    description: siteConfig.description,
    url: siteConfig.url,
    email: `mailto:${siteConfig.email}`,
    telephone: siteConfig.phone,
    image: `${siteConfig.url}${OG_IMAGE.url}`,
    knowsAbout: [
      'Full-Stack Development',
      'NestJS',
      'Next.js',
      'Angular',
      'TypeScript',
      'React',
      'MongoDB',
      'Redis',
      'Microservices',
      'System Architecture',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dhaka',
      addressCountry: 'BD',
    },
    ...(current && { worksFor: { '@type': 'Organization', name: current.company } }),
    alumniOf: CV_DATA.education.map((edu) => ({
      '@type': 'CollegeOrUniversity',
      name: edu.institution,
    })),
    sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
  };
}

/**
 * Generate WebSite schema (site-wide, rendered in the root layout)
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: SITE_NAME,
    url: siteConfig.url,
    inLanguage: [...LOCALES],
    author: { '@id': `${siteConfig.url}/#person` },
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
 * Generate WebPage schema
 */
export function generateWebPageSchema(options: {
  title: string;
  description: string;
  url: string;
  /** BCP 47 language of the page, e.g. `bn`. */
  inLanguage: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: options.title,
    description: options.description,
    url: options.url,
    inLanguage: options.inLanguage,
    image: options.image || `${siteConfig.url}${OG_IMAGE.url}`,
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    about: { '@id': `${siteConfig.url}/#person` },
  };
}

/**
 * Generate CollectionPage schema for projects/blog
 */
export function generateCollectionSchema(options: {
  name: string;
  description: string;
  url: string;
  inLanguage?: string;
  items: Array<{ name: string; description: string; url: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: options.name,
    description: options.description,
    url: options.url,
    ...(options.inLanguage && { inLanguage: options.inLanguage }),
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
