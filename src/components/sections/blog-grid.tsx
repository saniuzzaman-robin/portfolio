'use client';

import Link from 'next/link';
import { ARTICLES } from '@/lib/data/blog';

// Static class maps — Tailwind JIT requires full class strings to be present at build time.
// Dynamic string interpolation (e.g. `text-${color}-50`) is purged in production.
const COLOR_TEXT: Record<string, string> = {
  primary: 'text-primary-50',
  secondary: 'text-secondary-50',
  tertiary: 'text-tertiary-50',
};
const COLOR_LINK: Record<string, string> = {
  primary: 'text-primary-50 hover:text-primary-60',
  secondary: 'text-secondary-50 hover:text-secondary-60',
  tertiary: 'text-tertiary-50 hover:text-tertiary-60',
};

export function BlogGrid() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20 animate-slide-right">
          <h1 className="font-space-grotesk text-5xl md:text-6xl font-bold mb-6">
            Blog & Articles
          </h1>
          <p className="text-neutral-70 text-lg max-w-2xl">
            Technical insights, tutorials, and thoughts on software engineering, system design, and
            competitive programming.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {ARTICLES.map((article, index) => (
            <article
              key={article.id}
              className="bg-neutral-10 rounded-2xl overflow-hidden border border-neutral-20 hover:border-neutral-30 group transition-all duration-300 animate-scale-in hover:shadow-lg"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{article.emoji}</span>
                  <span
                    className={`text-xs uppercase tracking-widest font-space-grotesk ${COLOR_TEXT[article.color] ?? 'text-primary-50'}`}
                  >
                    {article.category}
                  </span>
                </div>

                <h2 className="font-space-grotesk text-2xl font-bold mb-4 group-hover:text-primary-50 transition duration-300">
                  {article.title}
                </h2>

                <p className="text-neutral-70 text-sm leading-relaxed mb-6 grow">
                  {article.excerpt}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {article.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-neutral-5 text-neutral-70 px-2 py-1 rounded-full hover:scale-105 transition-transform duration-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-neutral-20">
                  <div className="text-xs text-neutral-70">
                    <span>{article.date}</span>
                    <span className="mx-2">•</span>
                    <span>{article.readTime}</span>
                  </div>
                  <Link
                    href="#"
                    className={`font-space-grotesk text-sm uppercase tracking-wider transition inline-flex items-center gap-2 group-hover:translate-x-2 duration-300 ${COLOR_LINK[article.color] ?? 'text-primary-50 hover:text-primary-60'}`}
                  >
                    Read →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-20 text-center animate-fade-in [animation-delay:600ms]">
          <p className="text-neutral-70 mb-6">
            Subscribe to get notified about new articles and insights
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-neutral-10 border border-neutral-20 rounded-lg focus:outline-none focus:border-primary-50 transition text-neutral-90"
            />
            <button className="px-6 py-3 bg-primary-50 text-black font-space-grotesk font-bold rounded-lg hover:bg-primary-60 transition duration-300 hover:scale-105">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
