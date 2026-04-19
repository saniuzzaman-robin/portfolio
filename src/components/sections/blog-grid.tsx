'use client';

import Link from 'next/link';

export function BlogGrid() {
  const articles = [
    {
      id: 1,
      title: 'Building Scalable Next.js Applications',
      excerpt:
        'Deep dive into architectural patterns and best practices for creating production-grade Next.js applications.',
      category: 'Backend',
      date: 'Mar 15, 2024',
      readTime: '8 min read',
      color: 'primary',
      emoji: '📚',
      tags: ['Next.js', 'Architecture', 'Performance'],
    },
    {
      id: 2,
      title: 'Competitive Programming Insights',
      excerpt:
        'Techniques and strategies from competitive programming that translate to real-world software engineering.',
      category: 'Algorithms',
      date: 'Mar 10, 2024',
      readTime: '10 min read',
      color: 'secondary',
      emoji: '🎯',
      tags: ['Algorithms', 'Problem Solving', 'Optimization'],
    },
    {
      id: 3,
      title: 'TypeScript Best Practices',
      excerpt:
        'Advanced TypeScript patterns for building type-safe, maintainable applications at scale.',
      category: 'Frontend',
      date: 'Mar 5, 2024',
      readTime: '12 min read',
      color: 'tertiary',
      emoji: '✨',
      tags: ['TypeScript', 'Best Practices', 'Code Quality'],
    },
    {
      id: 4,
      title: 'System Design for Beginners',
      excerpt:
        'A comprehensive guide to system design concepts, from database selection to caching strategies.',
      category: 'System Design',
      date: 'Feb 28, 2024',
      readTime: '15 min read',
      color: 'primary',
      emoji: '🏗️',
      tags: ['System Design', 'Architecture', 'Scalability'],
    },
    {
      id: 5,
      title: 'React Performance Optimization',
      excerpt:
        'Techniques for identifying and fixing performance bottlenecks in React applications.',
      category: 'Frontend',
      date: 'Feb 20, 2024',
      readTime: '9 min read',
      color: 'secondary',
      emoji: '⚡',
      tags: ['React', 'Performance', 'Optimization'],
    },
    {
      id: 6,
      title: 'Docker and Containerization',
      excerpt:
        'Getting started with Docker for development and deployment of applications.',
      category: 'DevOps',
      date: 'Feb 15, 2024',
      readTime: '11 min read',
      color: 'tertiary',
      emoji: '🐳',
      tags: ['Docker', 'DevOps', 'Containerization'],
    },
  ];

  return (
    <section className="px-6 py-24 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20 animate-slide-right">
          <h1 className="font-space-grotesk text-5xl md:text-6xl font-bold mb-6">
            Blog & Articles
          </h1>
          <p className="text-neutral-70 text-lg max-w-2xl">
            Technical insights, tutorials, and thoughts on software engineering,
            system design, and competitive programming.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {articles.map((article, index) => (
            <article
              key={article.id}
              className="bg-neutral-10 rounded-2xl overflow-hidden border border-neutral-20 hover:border-neutral-30 group transition-all duration-300 animate-scale-in hover:shadow-lg"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{article.emoji}</span>
                  <span
                    className={`text-xs uppercase tracking-widest font-space-grotesk text-${article.color}-50`}
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
                  <div className="text-xs text-neutral-60">
                    <span>{article.date}</span>
                    <span className="mx-2">•</span>
                    <span>{article.readTime}</span>
                  </div>
                  <Link
                    href="#"
                    className={`text-${article.color}-50 font-space-grotesk text-sm uppercase tracking-wider hover:text-${article.color}-60 transition inline-flex items-center gap-2 group-hover:translate-x-2 duration-300`}
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
            <button className="px-6 py-3 bg-primary-50 text-white font-space-grotesk font-bold rounded-lg hover:bg-primary-60 transition duration-300 hover:scale-105">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
