import type { Metadata } from 'next';
import { Navigation } from '@/components/sections/navigation';
import { BlogGrid } from '@/components/sections/blog-grid';
import { Footer } from '@/components/sections/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { AdUnit } from '@/components/reusable/ad-unit';
import { generateCollectionSchema } from '@/lib/schema';
import { AD_SLOTS } from '@/lib/ads-config';

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
    url: 'https://saniuzzaman.dev/blog',
    title: 'Blog | Saniuzzaman Robin',
    description: 'Insights on web development, software architecture, and programming.',
    images: [
      {
        url: 'https://saniuzzaman.dev/logo.png',
        width: 1200,
        height: 630,
        alt: 'Saniuzzaman Robin - Blog',
      },
    ],
  },
};

export default function Blog() {
  const blogItems = [
    {
      name: 'Building Scalable APIs with NestJS',
      description: 'Guide to creating production-grade APIs',
      url: 'https://saniuzzaman.dev/blog',
    },
    {
      name: 'Next.js Performance Optimization',
      description: 'Tips and tricks for optimizing Next.js applications',
      url: 'https://saniuzzaman.dev/blog',
    },
  ];

  return (
    <>
      <SchemaScript
        schema={generateCollectionSchema({
          name: 'Blog',
          description: 'Articles and insights on software engineering',
          url: 'https://saniuzzaman.dev/blog',
          items: blogItems,
        })}
      />
      <main className="bg-neutral-5 text-neutral-90">
        <Navigation />
        <BlogGrid />
        <div className="px-4 py-8 border-t border-white/5">
          <AdUnit slot={AD_SLOTS.BLOG_BANNER} format="horizontal" className="max-w-4xl mx-auto" />
        </div>
        <Footer />
      </main>
    </>
  );
}
