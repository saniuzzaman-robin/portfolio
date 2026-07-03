import type { Metadata } from 'next';

export interface ToolMetadataInput {
  title: string;
  description: string;
  keywords: string[];
  toolPath: string; // e.g., 'base64', 'uuid', etc.
}

export function generateToolMetadata(input: ToolMetadataInput): Metadata {
  const baseUrl = 'https://saniuzzaman.dev';
  const canonicalUrl = `${baseUrl}/tools/${input.toolPath}`;

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Saniuzzaman Robin - Developer Tools',
      images: [
        {
          url: `${baseUrl}/og_tools.svg`,
          width: 1200,
          height: 630,
          alt: input.title,
          type: 'image/svg+xml',
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [`${baseUrl}/og_tools.svg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
  };
}
