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
        <h2 className="font-space-grotesk text-2xl md:text-3xl font-bold mt-12 mb-4 text-neutral-90">
          {section.content}
        </h2>
      );

    case 'subheading':
      return (
        <h3 className="font-space-grotesk text-xl font-semibold mt-8 mb-3 text-neutral-90">
          {section.content}
        </h3>
      );

    case 'paragraph':
      return (
        <p className="text-neutral-70 leading-relaxed mb-6 text-base md:text-lg">
          {section.content}
        </p>
      );

    case 'code':
      return (
        <div className="my-6 rounded-xl overflow-hidden border border-neutral-20">
          <div className="flex items-center justify-between px-4 py-2 bg-neutral-10 border-b border-neutral-20">
            <span className="font-mono text-xs text-neutral-60 uppercase tracking-wider">
              {section.language}
            </span>
          </div>
          <pre className="bg-neutral-5 p-5 overflow-x-auto">
            <code className="font-mono text-sm leading-relaxed text-neutral-80 whitespace-pre">
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
            <li key={i} className="text-neutral-70 leading-relaxed text-base md:text-lg">
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
        <div className={`my-6 border-l-4 rounded-r-xl px-5 py-4 ${styles[section.variant]}`}>
          <span className="font-bold mr-2">{icons[section.variant]}</span>
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

        <article className="px-6 py-24 md:px-12 lg:px-20 max-w-4xl mx-auto">
          {/* Back link */}
          <div className="mb-12 animate-fade-in">
            <Link
              href="/blog"
              className={`font-space-grotesk text-sm uppercase tracking-wider inline-flex items-center gap-2 transition-all duration-200 ${c.text} ${c.textHover} hover:-translate-x-1`}
            >
              ← Back to Blog
            </Link>
          </div>

          {/* Header */}
          <header className="mb-12 animate-slide-right">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{article.emoji}</span>
              <span className={`text-xs uppercase tracking-widest font-space-grotesk ${c.text}`}>
                {article.category}
              </span>
            </div>

            <h1 className="font-space-grotesk text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>

            <p className="text-neutral-70 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-60">
              <span>{article.date}</span>
              <span>·</span>
              <span>{article.readTime}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-6">
              {article.tags.map((tag, i) => (
                <span
                  key={i}
                  className={`text-xs px-3 py-1 rounded-full border font-mono ${c.tag} ${c.borderSoft}`}
                  style={{ color: av(article.color) }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Divider */}
          <div
            className={`h-px mb-12 ${c.borderMedium}`}
            style={{ background: `linear-gradient(to right, ${av(article.color)}, transparent)` }}
          />

          {/* Article body */}
          <div className="animate-fade-in [animation-delay:200ms]">
            {article.content.map((section, i) => (
              <ContentSection key={i} section={section} />
            ))}
          </div>

          {/* Footer nav */}
          <div className="mt-20 pt-10 border-t border-neutral-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-fade-in [animation-delay:400ms]">
            <div>
              <p className="text-neutral-60 text-sm mb-1">Written by</p>
              <p className="font-space-grotesk font-semibold text-neutral-90">{siteConfig.name}</p>
              <p className="text-neutral-60 text-sm">Full-Stack Software Engineer</p>
            </div>
            <Link
              href="/blog"
              className={`font-space-grotesk text-sm uppercase tracking-wider inline-flex items-center gap-2 border px-5 py-3 rounded-xl transition-all duration-200 ${c.text} ${c.borderSoft} hover:${c.borderMedium}`}
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
