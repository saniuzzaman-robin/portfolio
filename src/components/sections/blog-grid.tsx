'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ARTICLES } from '@/lib/data/blog';
import { ACCENT_CLASSES } from '@/lib/accent';

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
    <section className="px-6 py-24 md:px-12 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mb-16">
          <h1 className="font-poppins mb-4 text-5xl font-bold md:text-6xl">
            Blog & Articles
          </h1>
          <p className="text-neutral-70 max-w-2xl text-lg">
            Technical insights, tutorials, and thoughts on software engineering, system design, and
            competitive programming.
          </p>
        </motion.div>

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
                className="glass card-shine group overflow-hidden rounded-xl border border-white/8 transition-all duration-300 hover:shadow-lg hover:border-white/20"
              >
                <div className="flex h-full flex-col p-8">
                  <div className="mb-4 flex items-start justify-between">
                    <span className="text-3xl">{article.emoji}</span>
                    <span className={`font-poppins text-xs tracking-widest uppercase ${c.text}`}>
                      {article.category}
                    </span>
                  </div>

                  <h2 className="font-poppins text-neutral-90 group-hover:text-primary-50 mb-4 text-2xl font-bold transition duration-300">
                    {article.title}
                  </h2>

                  <p className="text-neutral-70 mb-6 grow text-sm leading-relaxed">
                    {article.excerpt}
                  </p>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {article.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-neutral-10 text-neutral-60 rounded-full px-2.5 py-1 text-xs transition-transform duration-200 hover:scale-105"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="border-white/8 flex items-center justify-between border-t pt-5">
                    <div className="text-neutral-60 text-xs">
                      <span>{article.date}</span>
                      <span className="mx-2">•</span>
                      <span>{article.readTime}</span>
                    </div>
                    <Link
                      href={`/blog/${article.slug}`}
                      className={`font-poppins inline-flex items-center gap-2 text-sm tracking-wider uppercase transition duration-300 group-hover:translate-x-2 ${c.text} ${c.textHover}`}
                    >
                      Read →
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.div custom={100} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 text-center">
          <p className="text-neutral-70 mb-5 text-sm">
            Subscribe to get notified about new articles and insights
          </p>
          <div className="mx-auto flex max-w-md gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="bg-neutral-10 border border-white/10 focus:border-primary-50/50 text-neutral-90 flex-1 rounded-lg px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-50/20"
            />
            <button className="btn-neon font-poppins rounded-lg px-6 py-3 text-sm font-bold tracking-widest uppercase">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
