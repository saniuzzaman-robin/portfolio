'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ARTICLES } from '@/lib/data/blog';
import { ACCENT_CLASSES } from '@/lib/accent';
import { SectionHeader } from '@/components/ui/section-header';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function BlogGrid() {
  return (
    <section className="relative px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          title={<>Blog & Articles</>}
          description="Technical insights, tutorials, and thoughts on software engineering, system design, and competitive programming."
        />

        <div className="grid gap-8 lg:grid-cols-2">
          {ARTICLES.map((article, index) => {
            const c = ACCENT_CLASSES[article.color];
            return (
              <motion.article
                key={article.id}
                custom={index + 1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="glass group overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex h-full flex-col p-8">
                  <div className="mb-4 flex items-start justify-between">
                    <span className="text-3xl">{article.emoji}</span>
                    <span className={`text-xs tracking-widest uppercase ${c.text}`}>
                      {article.category}
                    </span>
                  </div>

                  <h2 className="text-midnight-950 group-hover:text-aurora-green mb-4 text-2xl font-bold transition-colors duration-300">
                    {article.title}
                  </h2>

                  <p className="text-midnight-500 mb-6 grow text-sm leading-relaxed">
                    {article.excerpt}
                  </p>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {article.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-midnight-100 text-midnight-500 rounded-full px-2.5 py-1 text-xs transition-transform duration-200 hover:scale-105"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="border-midnight-200 flex items-center justify-between border-t pt-5">
                    <div className="text-midnight-500 text-xs">
                      <span>{article.date}</span>
                      <span className="mx-2">•</span>
                      <span>{article.readTime}</span>
                    </div>
                    <Link
                      href={`/blog/${article.slug}`}
                      className={`inline-flex items-center gap-2 text-sm font-bold tracking-wider uppercase transition duration-300 group-hover:translate-x-2 ${c.text} ${c.textHover}`}
                    >
                      Read →
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          custom={100}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-midnight-500 mb-5 text-sm">
            Subscribe to get notified about new articles and insights
          </p>
          <div className="mx-auto flex max-w-md gap-2">
            <input type="email" placeholder="your@email.com" className="input flex-1" />
            <button className="btn-primary rounded-full px-6 py-3 text-sm font-bold tracking-widest uppercase">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
