import Link from 'next/link';
import { ARTICLES } from '@/lib/data/blog';
import { ACCENT_CLASSES } from '@/lib/accent';

export function BlogGrid() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="animate-slide-right mb-20">
          <h1 className="font-space-grotesk mb-6 text-5xl font-bold md:text-6xl">
            Blog & Articles
          </h1>
          <p className="text-neutral-70 max-w-2xl text-lg">
            Technical insights, tutorials, and thoughts on software engineering, system design, and
            competitive programming.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {ARTICLES.map((article, index) => {
            const c = ACCENT_CLASSES[article.color];
            return (
              <article
                key={article.id}
                className="bg-neutral-10 border-neutral-20 hover:border-neutral-30 group animate-scale-in overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className="flex h-full flex-col p-8">
                  <div className="mb-4 flex items-start justify-between">
                    <span className="text-3xl">{article.emoji}</span>
                    <span
                      className={`font-space-grotesk text-xs tracking-widest uppercase lg:text-sm ${c.text}`}
                    >
                      {article.category}
                    </span>
                  </div>

                  <h2 className="font-space-grotesk group-hover:text-primary-50 mb-4 text-2xl font-bold transition duration-300">
                    {article.title}
                  </h2>

                  <p className="text-neutral-70 mb-6 grow text-sm leading-relaxed">
                    {article.excerpt}
                  </p>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {article.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-neutral-5 text-neutral-70 rounded-full px-2 py-1 text-xs transition-transform duration-200 hover:scale-105 lg:text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="border-neutral-20 flex items-center justify-between border-t pt-6">
                    <div className="text-neutral-70 text-xs lg:text-sm">
                      <span>{article.date}</span>
                      <span className="mx-2">•</span>
                      <span>{article.readTime}</span>
                    </div>
                    <Link
                      href={`/blog/${article.slug}`}
                      className={`font-space-grotesk inline-flex items-center gap-2 text-sm tracking-wider uppercase transition duration-300 group-hover:translate-x-2 ${c.text} ${c.textHover}`}
                    >
                      Read →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="animate-fade-in mt-20 text-center [animation-delay:600ms]">
          <p className="text-neutral-70 mb-6">
            Subscribe to get notified about new articles and insights
          </p>
          <div className="mx-auto flex max-w-md gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="bg-neutral-10 border-neutral-20 focus:border-primary-50 text-neutral-90 flex-1 rounded-lg border px-4 py-3 transition focus:outline-none"
            />
            <button className="bg-primary-50 text-primary-100 dark:text-primary-0 font-space-grotesk hover:bg-primary-60 rounded-lg px-6 py-3 font-bold transition duration-300 hover:scale-105">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
