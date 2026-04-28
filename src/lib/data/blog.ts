export interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  color: 'primary' | 'secondary' | 'tertiary';
  emoji: string;
  tags: string[];
}

export const ARTICLES: Article[] = [
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
    excerpt: 'Techniques for identifying and fixing performance bottlenecks in React applications.',
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
    excerpt: 'Getting started with Docker for development and deployment of applications.',
    category: 'DevOps',
    date: 'Feb 15, 2024',
    readTime: '11 min read',
    color: 'tertiary',
    emoji: '🐳',
    tags: ['Docker', 'DevOps', 'Containerization'],
  },
];
