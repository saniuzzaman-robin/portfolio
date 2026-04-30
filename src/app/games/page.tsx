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
  canonical: 'https://saniuzzaman.dev/games',
  openGraph: {
    url: 'https://saniuzzaman.dev/games',
    title: 'Games | Saniuzzaman Robin',
    description: 'Play interactive browser games: Snake, Tetris, and Memory.',
    images: [
      {
        url: 'https://saniuzzaman.dev/logo.png',
        width: 1200,
        height: 630,
        alt: 'Saniuzzaman Robin - Games',
      },
    ],
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
    <main className="bg-neutral-5 text-neutral-90 min-h-screen">
      <SchemaScript schema={schema} />
      <Navigation />

      <section className="px-6 py-20 md:px-12 lg:px-20 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 cyber-grid pointer-events-none opacity-40" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-50/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary-50/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <GameCardGrid />
        </div>
      </section>

      <Footer />
    </main>
  );
}
