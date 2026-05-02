import type { Metadata } from 'next';
import { Navigation } from '@/components/sections/navigation';
import { BlogGrid } from '@/components/sections/blog-grid';
import { Footer } from '@/components/sections/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generateCollectionSchema, siteConfig } from '@/lib/schema';
import { ARTICLES } from '@/lib/data/blog';

export const metadata: Metadata = {
  title: 'Blog | Md. Saniuzzaman Robin',
  description:
    'Articles on web development, software engineering, competitive programming, and tech insights. Learn about best practices in Next.js, NestJS, system design, and more.',
  keywords: [
    'blog',
    'articles',
    'web development',
    'software engineering',
    'tech',
    'programming',
    'next.js',
    'nestjs',
  ],
  alternates: {
    canonical: 'https://saniuzzaman.dev/blog',
  },
  openGraph: {
    type: 'website',
    url: 'https://saniuzzaman.dev/blog',
    title: 'Blog | Saniuzzaman Robin',
    description: 'Insights on web development, software architecture, and programming.',
    siteName: 'Saniuzzaman Robin Portfolio',
    images: [
      {
        url: 'https://saniuzzaman.dev/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Saniuzzaman Robin - Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Saniuzzaman Robin',
    description: 'Technical articles and insights on web development',
    creator: '@saniuzzaman_robin',
    images: ['https://saniuzzaman.dev/og_image.png'],
  },
};

export default function Blog() {
  return (
    <>
      <SchemaScript
        schema={generateCollectionSchema({
          name: 'Blog',
          description: 'Articles and insights on software engineering',
          url: `${siteConfig.url}/blog`,
          items: ARTICLES.map((a) => ({
            name: a.title,
            description: a.excerpt,
            url: `${siteConfig.url}/blog/${a.slug}`,
          })),
        })}
      />
      <main className="bg-neutral-5 text-neutral-90">
        <Navigation />
        <BlogGrid />
        <Footer />
      </main>
    </>
  );
}
