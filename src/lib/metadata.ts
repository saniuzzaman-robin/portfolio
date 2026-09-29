import type { Metadata } from 'next';
import { CV_DATA } from '@/lib/cv-data';
import { OG_IMAGE, SITE_NAME } from '@/lib/site';

/**
 * Per-page metadata with canonical URL, Open Graph and Twitter cards.
 * Relative URLs resolve against `metadataBase` set in the root layout.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
  type = 'website',
}: {
  /** Page title; the root layout template appends the site owner's name. */
  title?: string;
  description: string;
  path: `/${string}`;
  keywords?: string[];
  type?: 'website' | 'profile';
}): Metadata {
  const fullTitle = title ? `${title} | ${CV_DATA.name}` : `${CV_DATA.name} | ${CV_DATA.title}`;
  const image = { ...OG_IMAGE, alt: `${CV_DATA.name} — ${CV_DATA.title}` };

  return {
    ...(title ? { title } : { title: { absolute: fullTitle } }),
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      locale: 'en_US',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image.url],
    },
  };
}
