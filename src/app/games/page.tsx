import type { Metadata } from 'next';
import { Navigation } from '@/components/sections/navigation';
import { Footer } from '@/components/sections/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generateCollectionSchema } from '@/lib/schema';
import { GameCardGrid } from '@/components/sections/game-card-grid';

export const metadata: Metadata = {
  title: 'Games | Saniuzzaman Robin',
  description:
    'Interactive browser games built with HTML5 Canvas and React — Snake, Tetris, Memory. Showcasing creative web development skills.',
  alternates: {
    canonical: 'https://saniuzzaman.dev/games',
  },
  openGraph: {
    type: 'website',
    url: 'https://saniuzzaman.dev/games',
    title: 'Games | Saniuzzaman Robin',
    description: 'Play interactive browser games: Snake, Tetris, and Memory.',
    siteName: 'Saniuzzaman Robin Portfolio',
    images: [
      {
        url: 'https://saniuzzaman.dev/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Saniuzzaman Robin - Games',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Games | Saniuzzaman Robin',
    description: 'Interactive browser games built with React and Canvas',
    creator: '@saniuzzaman_robin',
    images: ['https://saniuzzaman.dev/og_image.png'],
  },
};

const schemaItems = [
  {
    name: 'Snake',
    description: 'Navigate the neon serpent, collect data packets, avoid collisions.',
    url: 'https://saniuzzaman.dev/games/snake',
  },
  {
    name: 'Tetris',
    description: 'Drop tetrominos, clear lines, survive the cascade.',
    url: 'https://saniuzzaman.dev/games/tetris',
  },
  {
    name: 'Memory Match',
    description: 'Flip holographic cards, find matching pairs, beat the clock.',
    url: 'https://saniuzzaman.dev/games/memory',
  },
];

export default function GamesPage() {
  const schema = generateCollectionSchema({
    name: 'Browser Games by Saniuzzaman Robin',
    description: 'Interactive HTML5 Canvas games showcasing creative web development skills.',
    url: 'https://saniuzzaman.dev/games',
    items: schemaItems,
  });

  return (
    <main className="bg-neutral-5 text-neutral-90 min-h-dvh">
      <SchemaScript schema={schema} />
      <Navigation />

      <section className="relative overflow-hidden px-6 py-20 md:px-12 lg:px-20">
        {/* Background */}
        <div className="cyber-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="bg-primary-50/5 pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-secondary-50/5 pointer-events-none absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <GameCardGrid />
        </div>
      </section>

      <Footer />
    </main>
  );
}
