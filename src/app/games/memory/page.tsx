'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Timer, Star } from 'lucide-react';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generateGameSchema } from '@/lib/schema';
import { sounds } from '@/lib/sounds';

const ICONS = [
  '⚡',
  '🔮',
  '🎯',
  '🚀',
  '🌊',
  '🔥',
  '💎',
  '🌌',
  '🎮',
  '🤖',
  '🎲',
  '🌀',
  '🎪',
  '🌸',
  '🍕',
  '🎸',
  '🏆',
  '🌙',
  '👻',
  '🎨',
  '🔔',
  '💫',
  '🍦',
  '🎭',
];

interface Card {
  id: number;
  icon: string;
  matched: boolean;
  flipped: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initCards(pairCount = 8): Card[] {
  const icons = ICONS.slice(0, pairCount);
  const pairs = [...icons, ...icons];
  return shuffle(pairs).map((icon, i) => ({ id: i, icon, matched: false, flipped: false }));
}

function createUnshuffledCards(pairCount = 8): Card[] {
  const icons = ICONS.slice(0, pairCount);
  const pairs = [...icons, ...icons];
  return pairs.map((icon, i) => ({ id: i, icon, matched: false, flipped: false }));
}

function useTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return seconds;
}

export default function MemoryPage() {
  const [cards, setCards] = useState<Card[]>(createUnshuffledCards(8));
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [locked, setLocked] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [bestMoves, setBestMoves] = useState<number | null>(null);
  const seconds = useTimer(started && !won);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isMountedRef = useRef(false);

  // Initialize shuffled cards on client mount
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      setCards(initCards(8));
    }
  }, []);

  // Cleanup all pending timeouts on unmount
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const startGame = useCallback(() => {
    setCards(initCards(8));
    setSelected([]);
    setMoves(0);
    setMatched(0);
    setStarted(false);
    setWon(false);
    setLocked(false);
    sounds.start();
    // brief delay then flip all back
  }, []);

  const flip = useCallback(
    (id: number) => {
      if (locked || won) return;
      const card = cards[id];
      if (card.flipped || card.matched) return;

      if (!started) setStarted(true);

      sounds.flip();

      const newSelected = [...selected, id];
      const newCards = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
      setCards(newCards);

      if (newSelected.length === 1) {
        setSelected(newSelected);
      } else if (newSelected.length === 2) {
        setMoves((m) => m + 1);
        setSelected([]);

        const [a, b] = newSelected;
        if (newCards[a].icon === newCards[b].icon) {
          // Match!
          sounds.match();
          timeoutsRef.current.push(
            setTimeout(() => {
              setCards((prev) =>
                prev.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c))
              );
              const newMatched = matched + 1;
              setMatched(newMatched);
              if (newMatched === 8) {
                sounds.victory();
                setWon(true);
                setStarted(false);
                setBestTime((bt) => (bt === null ? seconds : Math.min(bt, seconds)));
                setBestMoves((bm) => (bm === null ? moves + 1 : Math.min(bm, moves + 1)));
              }
            }, 400)
          );
        } else {
          // No match — flip back
          sounds.mismatch();
          setLocked(true);
          timeoutsRef.current.push(
            setTimeout(() => {
              setCards((prev) =>
                prev.map((c) => (c.id === a || c.id === b ? { ...c, flipped: false } : c))
              );
              setLocked(false);
            }, 900)
          );
        }
      }
    },
    [cards, selected, locked, won, started, matched, seconds, moves]
  );

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const totalPairs = 8;
  const progress = (matched / totalPairs) * 100;

  const schema = generateGameSchema({
    name: 'Memory Match — Card Flip',
    description:
      'Flip holographic cards, find matching pairs, beat the clock. Tests your pattern recognition and memory.',
    url: 'https://saniuzzaman.dev/games/memory',
    genre: 'Puzzle',
  });

  return (
    <>
      <SchemaScript schema={schema} />
      <div className="h-dvh bg-neutral-5 text-neutral-90 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 glass-strong flex-wrap gap-4">
          <Link
            href="/games"
            className="flex items-center gap-2 text-neutral-50 hover:text-tertiary-50 transition-colors text-sm font-space-grotesk uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Games
          </Link>
          <div className="flex items-center gap-5 text-center">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-tertiary-50" />
              <div>
                <p className="text-xs text-neutral-60 uppercase tracking-widest">Time</p>
                <p className="font-space-grotesk font-bold text-xl neon-purple tabular-nums">
                  {formatTime(seconds)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-60 uppercase tracking-widest">Moves</p>
              <p className="font-space-grotesk font-bold text-xl neon-cyan tabular-nums">{moves}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-60 uppercase tracking-widest">Matched</p>
              <p className="font-space-grotesk font-bold text-xl neon-green tabular-nums">
                {matched}/{totalPairs}
              </p>
            </div>
            {bestMoves !== null && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400" />
                <div>
                  <p className="text-xs text-neutral-60 uppercase tracking-widest">Best</p>
                  <p className="font-space-grotesk font-bold text-sm text-yellow-400 tabular-nums">
                    {bestMoves} moves
                  </p>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={startGame}
            className="flex items-center gap-2 btn-neon-purple px-4 py-2 rounded-sm text-xs font-space-grotesk font-bold uppercase tracking-widest"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New Game
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-neutral-10">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(to right, #a476ff, #00d4ff, #00ff87)',
            }}
          />
        </div>

        {/* Game grid */}
        <div className="flex-1 flex items-center justify-center p-4 cyber-grid relative overflow-hidden min-h-0">
          {/* Win screen */}
          {won && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center z-20"
              style={{ background: 'rgba(8,13,26,0.9)', backdropFilter: 'blur(8px)' }}
            >
              <p className="font-space-grotesk font-bold text-4xl neon-purple mb-2 animate-slide-up">
                YOU WIN!
              </p>
              <p className="text-neutral-70 text-sm mb-1 animate-fade-in [animation-delay:200ms]">
                Time: <span className="neon-cyan font-bold">{formatTime(seconds)}</span>
              </p>
              <p className="text-neutral-70 text-sm mb-6 animate-fade-in [animation-delay:300ms]">
                Moves: <span className="neon-green font-bold">{moves}</span>
              </p>
              {bestTime !== null && (
                <p className="text-yellow-400 text-xs mb-6 font-space-grotesk animate-fade-in [animation-delay:400ms]">
                  ⭐ Best: {formatTime(bestTime)} in {bestMoves} moves
                </p>
              )}
              <button
                onClick={startGame}
                className="btn-neon-purple px-8 py-3 rounded-sm font-space-grotesk font-bold text-sm uppercase tracking-widest animate-scale-in [animation-delay:500ms]"
              >
                &gt; Play Again
              </button>
            </div>
          )}

          <div
            className="grid grid-cols-4 grid-rows-4"
            style={{
              height: 'min(100%, 42rem)',
              aspectRatio: '1 / 1',
              maxWidth: '100%',
              padding: '0.375rem',
              gap: 'clamp(0.375rem, 1.5vw, 0.75rem)',
            }}
          >
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => flip(card.id)}
                className="relative aspect-square cursor-pointer focus:outline-none group"
                disabled={card.flipped || card.matched || locked}
                style={{ perspective: '600px' }}
                aria-label={card.flipped || card.matched ? `Card: ${card.icon}` : 'Hidden card'}
              >
                <div
                  className="relative w-full h-full transition-all duration-500"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: card.flipped || card.matched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Back face */}
                  <div
                    className="absolute inset-0 rounded-sm glass border flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      borderColor: 'rgba(164,118,255,0.4)',
                      background:
                        'linear-gradient(135deg, rgba(164,118,255,0.12) 0%, rgba(0,212,255,0.08) 100%)',
                      boxShadow:
                        '0 0 20px rgba(164,118,255,0.2), inset 0 0 20px rgba(164,118,255,0.05)',
                    }}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-tertiary-50/60 text-xl md:text-2xl font-bold mb-0.5">
                        ?
                      </span>
                      <div className="w-6 h-0.5 bg-linear-to-r from-transparent via-tertiary-50/30 to-transparent" />
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm holographic" />
                  </div>

                  {/* Front face */}
                  <div
                    className="absolute inset-0 rounded-sm flex items-center justify-center text-3xl md:text-4xl transition-all duration-300 group-hover:scale-110"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: card.matched
                        ? 'linear-gradient(135deg, rgba(0,255,135,0.2) 0%, rgba(0,212,255,0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(164,118,255,0.18) 0%, rgba(0,212,255,0.12) 100%)',
                      border: `2px solid ${card.matched ? 'rgba(0,255,135,0.6)' : 'rgba(164,118,255,0.5)'}`,
                      boxShadow: card.matched
                        ? '0 0 30px rgba(0,255,135,0.4), inset 0 0 15px rgba(0,255,135,0.1)'
                        : '0 0 15px rgba(164,118,255,0.3), inset 0 0 15px rgba(164,118,255,0.05)',
                    }}
                  >
                    {card.icon}
                    {card.matched && (
                      <div
                        className="absolute inset-0 rounded-sm animate-pulse"
                        style={{ background: 'rgba(0,255,135,0.08)' }}
                      />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
