import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/sections/navigation';
import { Footer } from '@/components/sections/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { ARTICLES, type ArticleSectionType } from '@/lib/data/blog';
import { ACCENT_CLASSES, av } from '@/lib/accent';
import { siteConfig } from '@/lib/schema';

// Pre-render all blog post pages at build time
export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return {};

  return {
    title: `${article.title} | Md. Saniuzzaman Robin`,
    description: article.excerpt,
    keywords: article.tags,
    alternates: {
      canonical: `${siteConfig.url}/blog/${article.slug}`,
    },
    openGraph: {
      type: 'article',
      url: `${siteConfig.url}/blog/${article.slug}`,
      title: article.title,
      description: article.excerpt,
      siteName: 'Saniuzzaman Robin Portfolio',
      publishedTime: article.date,
      tags: article.tags,
      images: [
        {
          url: `${siteConfig.url}/og_image.png`,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      creator: '@saniuzzaman_robin',
      images: [`${siteConfig.url}/og_image.png`],
    },
  };
}

function ContentSection({ section }: { section: ArticleSectionType }) {
  switch (section.type) {
    case 'heading':
      return (
        <h2 className="font-poppins text-neutral-90 mt-12 mb-4 text-2xl font-bold md:text-3xl">
          {section.content}
        </h2>
      );

    case 'subheading':
      return (
        <h3 className="font-poppins text-neutral-90 mt-8 mb-3 text-xl font-semibold">
          {section.content}
        </h3>
      );

    case 'paragraph':
      return (
        <p className="text-neutral-70 mb-6 text-base leading-relaxed md:text-lg">
          {section.content}
        </p>
      );

    case 'code':
      return (
        <div className="border-neutral-20 my-6 overflow-hidden rounded-xl border">
          <div className="bg-neutral-10 border-neutral-20 flex items-center justify-between border-b px-4 py-2">
            <span className="text-neutral-60 font-mono text-xs tracking-wider uppercase lg:text-sm">
              {section.language}
            </span>
          </div>
          <pre className="bg-neutral-5 overflow-x-auto p-5">
            <code className="text-neutral-80 font-mono text-sm leading-relaxed whitespace-pre">
              {section.content}
            </code>
          </pre>
        </div>
      );

    case 'list':
      const Tag = section.ordered ? 'ol' : 'ul';
      return (
        <Tag className={`mb-6 space-y-2 pl-6 ${section.ordered ? 'list-decimal' : 'list-disc'}`}>
          {section.items.map((item, i) => (
            <li key={i} className="text-neutral-70 text-base leading-relaxed md:text-lg">
              {item}
            </li>
          ))}
        </Tag>
      );

    case 'callout': {
      const styles: Record<typeof section.variant, string> = {
        info: 'border-secondary-50/40 bg-secondary-50/5 text-secondary-50',
        tip: 'border-primary-50/40 bg-primary-50/5 text-primary-50',
        warning: 'border-tertiary-50/40 bg-tertiary-50/5 text-tertiary-50',
      };
      const icons: Record<typeof section.variant, string> = {
        info: 'ℹ',
        tip: '💡',
        warning: '⚠',
      };
      return (
        <div className={`my-6 rounded-r-xl border-l-4 px-5 py-4 ${styles[section.variant]}`}>
          <span className="mr-2 font-bold">{icons[section.variant]}</span>
          <span className="text-neutral-70">{section.content}</span>
        </div>
      );
    }

    default:
      return null;
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();

  const c = ACCENT_CLASSES[article.color];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    keywords: article.tags.join(', '),
    url: `${siteConfig.url}/blog/${article.slug}`,
    image: `${siteConfig.url}/og_image.png`,
    author: {
      '@type': 'Person',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Person',
      name: siteConfig.name,
    },
  };

  return (
    <>
      <SchemaScript schema={schema} />
      <main className="bg-neutral-5 text-neutral-90 min-h-screen">
        <Navigation />

        <article className="mx-auto max-w-4xl px-6 py-24 md:px-12 lg:px-20">
          {/* Back link */}
          <div className="animate-fade-in mb-12">
            <Link
              href="/blog"
              className={`font-poppins inline-flex items-center gap-2 text-sm tracking-wider uppercase transition-all duration-200 ${c.text} ${c.textHover} hover:-translate-x-1`}
            >
              ← Back to Blog
            </Link>
          </div>

          {/* Header */}
          <header className="animate-slide-right mb-12">
            <div className="mb-6 flex items-center gap-3">
              <span className="text-4xl">{article.emoji}</span>
              <span
                className={`font-poppins text-xs tracking-widest uppercase lg:text-sm ${c.text}`}
              >
                {article.category}
              </span>
            </div>

            <h1 className="font-poppins mb-6 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
              {article.title}
            </h1>

            <p className="text-neutral-70 mb-8 max-w-2xl text-lg leading-relaxed md:text-xl">
              {article.excerpt}
            </p>

            <div className="text-neutral-60 flex flex-wrap items-center gap-4 text-sm">
              <span>{article.date}</span>
              <span>·</span>
              <span>{article.readTime}</span>
            </div>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              {article.tags.map((tag, i) => (
                <span
                  key={i}
                  className={`rounded-full border px-3 py-1 font-mono text-xs lg:text-sm ${c.tag} ${c.borderSoft}`}
                  style={{ color: av(article.color) }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Divider */}
          <div
            className={`mb-12 h-px ${c.borderMedium}`}
            style={{ background: `linear-gradient(to right, ${av(article.color)}, transparent)` }}
          />

          {/* Article body */}
          <div className="animate-fade-in [animation-delay:200ms]">
            {article.content.map((section, i) => (
              <ContentSection key={i} section={section} />
            ))}
          </div>

          {/* Footer nav */}
          <div className="border-neutral-20 animate-fade-in mt-20 flex flex-col items-start justify-between gap-6 border-t pt-10 [animation-delay:400ms] sm:flex-row sm:items-center">
            <div>
              <p className="text-neutral-60 mb-1 text-sm">Written by</p>
              <p className="font-poppins text-neutral-90 font-semibold">{siteConfig.name}</p>
              <p className="text-neutral-60 text-sm">Full-Stack Software Engineer</p>
            </div>
            <Link
              href="/blog"
              className={`font-poppins inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm tracking-wider uppercase transition-all duration-200 ${c.text} ${c.borderSoft} hover:${c.borderMedium}`}
            >
              More Articles →
            </Link>
          </div>
        </article>

        <Footer />
      </main>
    </>
  );
}
