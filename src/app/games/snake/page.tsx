'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generateGameSchema } from '@/lib/schema';
import { sounds } from '@/lib/sounds';

const CELL = 26;
const COLS = 25;
const ROWS = 20;

const DIFFICULTIES = {
  Rookie: { label: 'Rookie', tickMs: 200, multiplier: 1, color: '#00ff87', desc: 'Slow & steady' },
  Hacker: { label: 'Hacker', tickMs: 115, multiplier: 2, color: '#00d4ff', desc: '2× score' },
  Elite: { label: 'Elite', tickMs: 55, multiplier: 4, color: '#a476ff', desc: '4× score — fast!' },
} as const;
type DiffKey = keyof typeof DIFFICULTIES;

// Detect if mobile
function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

// Get adjusted tick speed based on device type
function getTickMs(difficulty: DiffKey): number {
  const baseTickMs = DIFFICULTIES[difficulty].tickMs;
  // On mobile, slow down by 60% (multiply by 1.6)
  return isMobile() ? Math.round(baseTickMs * 1.6) : baseTickMs;
}

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Point = { x: number; y: number };

function rndFood(snake: Point[]): Point {
  let p: Point;
  do {
    p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

function initState() {
  const snake: Point[] = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  return { snake, dir: 'RIGHT' as Dir, food: rndFood(snake), score: 0, dead: false };
}

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(initState());
  const pendingDir = useRef<Dir | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [dead, setDead] = useState(false);
  const [started, setStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<DiffKey>('Hacker');
  const difficultyRef = useRef<DiffKey>('Hacker');

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { snake, food } = stateRef.current;

    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(0,212,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, ROWS * CELL);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(COLS * CELL, y * CELL);
      ctx.stroke();
    }

    // Food — pulsing neon dot
    const gf = ctx.createRadialGradient(
      food.x * CELL + CELL / 2,
      food.y * CELL + CELL / 2,
      2,
      food.x * CELL + CELL / 2,
      food.y * CELL + CELL / 2,
      CELL / 2
    );
    gf.addColorStop(0, '#00d4ff');
    gf.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.fillStyle = gf;
    ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL);
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(food.x * CELL + 6, food.y * CELL + 6, CELL - 12, CELL - 12);

    // Snake body - simple blocks
    snake.forEach((seg, i) => {
      const alpha = 1 - (i / snake.length) * 0.4;
      const x = seg.x * CELL;
      const y = seg.y * CELL;

      if (i === 0) {
        // Head
        ctx.fillStyle = `rgba(0,255,135,${alpha})`;
        ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
      } else {
        // Body
        ctx.fillStyle = `rgba(0,200,100,${alpha * 0.8})`;
        ctx.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);
      }

      // Simple border
      ctx.strokeStyle = `rgba(0,255,135,${alpha * 0.5})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4);
    });
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (s.dead) return;

    // Apply pending direction
    if (pendingDir.current) {
      const d = pendingDir.current;
      const opposite = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' } as const;
      if (d !== opposite[s.dir]) s.dir = d;
      pendingDir.current = null;
    }

    const head = s.snake[0];
    const next: Point = {
      x: head.x + (s.dir === 'RIGHT' ? 1 : s.dir === 'LEFT' ? -1 : 0),
      y: head.y + (s.dir === 'DOWN' ? 1 : s.dir === 'UP' ? -1 : 0),
    };

    // Wall collision - game over
    if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
      s.dead = true;
      setDead(true);
      sounds.gameOver();
      return;
    }

    // Self collision
    if (s.snake.some((seg) => seg.x === next.x && seg.y === next.y)) {
      s.dead = true;
      setDead(true);
      sounds.gameOver();
      return;
    }

    const ate = next.x === s.food.x && next.y === s.food.y;
    const newSnake = [next, ...s.snake];
    if (!ate) newSnake.pop();

    s.snake = newSnake;
    if (ate) {
      sounds.eat();
      s.score += 10 * DIFFICULTIES[difficultyRef.current].multiplier;
      s.food = rndFood(newSnake);
      setScore(s.score);
      setBest((b) => Math.max(b, s.score));
    }

    draw();
  }, [draw]);

  const start = useCallback(() => {
    stateRef.current = initState();
    setScore(0);
    setDead(false);
    setStarted(true);
    sounds.start();
    draw();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, getTickMs(difficultyRef.current));
  }, [tick, draw]);

  useEffect(() => {
    draw();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [draw]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        s: 'DOWN',
        a: 'LEFT',
        d: 'RIGHT',
        W: 'UP',
        S: 'DOWN',
        A: 'LEFT',
        D: 'RIGHT',
      };
      if (map[e.key]) {
        e.preventDefault();
        pendingDir.current = map[e.key];
      }
      if (!started && (map[e.key] || e.key === ' ')) start();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, start]);

  // Touch swipe
  useEffect(() => {
    let tx = 0,
      ty = 0;
    const onStart = (e: TouchEvent) => {
      tx = e.touches[0].clientX;
      ty = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > Math.abs(dy)) pendingDir.current = dx > 0 ? 'RIGHT' : 'LEFT';
      else pendingDir.current = dy > 0 ? 'DOWN' : 'UP';
      if (!started) start();
    };
    window.addEventListener('touchstart', onStart);
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [started, start]);

  const schema = generateGameSchema({
    name: 'Snake — Neon Arcade',
    description:
      'Navigate the neon serpent, collect data packets, avoid collisions. A classic Snake game reimagined with cyberpunk aesthetics.',
    url: 'https://saniuzzaman.dev/games/snake',
    genre: 'Arcade',
  });

  return (
    <>
      <SchemaScript schema={schema} />
      <div className="bg-neutral-5 text-neutral-90 flex h-dvh flex-col overflow-hidden">
        {/* Header */}
        <div className="border-neutral-30 bg-neutral-10/50 flex items-center justify-between border-b px-4 py-3">
          <Link
            href="/games"
            className="hover:text-primary-50 font-space-grotesk flex items-center gap-2 text-xs tracking-wider text-neutral-50 uppercase transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Games
          </Link>
          <div className="flex items-center gap-4 text-center">
            <div>
              <p className="text-neutral-60 text-xs tracking-wider uppercase">Score</p>
              <p className="neon-green text-lg font-bold">{score}</p>
            </div>
            <div>
              <p className="text-neutral-60 text-xs tracking-wider uppercase">Best</p>
              <p className="neon-cyan text-lg font-bold">{best}</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-neutral-60 text-xs tracking-wider uppercase">Mode</p>
              <p className="text-lg font-bold" style={{ color: DIFFICULTIES[difficulty].color }}>
                {difficulty}
              </p>
            </div>
          </div>
          <button
            onClick={start}
            className="border-primary-50 text-primary-50 hover:bg-primary-50/10 font-space-grotesk flex items-center gap-2 rounded border px-4 py-2 text-xs tracking-wider uppercase transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            {started ? 'Restart' : 'Start'}
          </button>
        </div>

        {/* Game area */}
        <div className="cyber-grid relative flex flex-1 items-center justify-center overflow-hidden p-2 md:p-4">
          <div
            className="relative w-full shrink-0"
            style={{ aspectRatio: `${COLS}/${ROWS}`, maxWidth: '100%', maxHeight: '100%' }}
          >
            {/* Outer glow frame */}
            <div
              className="absolute -inset-1 rounded-sm opacity-50"
              style={{
                background:
                  'linear-gradient(45deg, var(--color-primary-50), var(--color-secondary-50), var(--color-tertiary-50), var(--color-primary-50))',
                filter: 'blur(6px)',
              }}
            />

            <canvas
              ref={canvasRef}
              width={COLS * CELL}
              height={ROWS * CELL}
              className="relative block h-full w-full rounded-sm"
              style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
            />

            {/* Overlay for start/game over */}
            {(!started || dead) && (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-sm"
                style={{ background: 'rgba(8,13,26,0.85)', backdropFilter: 'blur(4px)' }}
              >
                {dead ? (
                  <>
                    <p className="font-space-grotesk neon-green mb-2 text-3xl font-bold">
                      GAME OVER
                    </p>
                    <p className="text-neutral-70 mb-1 text-sm">
                      Score: <span className="neon-cyan font-bold">{score}</span>
                    </p>
                    <p className="text-neutral-70 mb-6 text-sm">
                      Best: <span className="neon-green font-bold">{best}</span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-space-grotesk neon-green mb-1 text-4xl font-bold">SNAKE</p>
                    <p className="text-neutral-70 mb-6 text-center text-xs">
                      Collect cyan packets. Avoid walls &amp; yourself.
                    </p>
                  </>
                )}

                {/* Difficulty selector */}
                <div className="mb-4 w-full max-w-xs px-2 md:px-4">
                  <p className="text-neutral-60 font-space-grotesk mb-2 text-center text-[10px] tracking-widest uppercase md:mb-3 md:text-xs">
                    Difficulty
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                    {(Object.keys(DIFFICULTIES) as DiffKey[]).map((key) => {
                      const d = DIFFICULTIES[key];
                      const active = difficulty === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setDifficulty(key);
                            difficultyRef.current = key;
                          }}
                          className="font-space-grotesk flex flex-col items-center gap-0.5 rounded-sm border px-1 py-1.5 transition-all duration-200 md:px-2 md:py-2.5"
                          style={{
                            borderColor: active ? d.color : 'rgba(255,255,255,0.1)',
                            background: active ? `${d.color}15` : 'rgba(255,255,255,0.03)',
                            boxShadow: active ? `0 0 12px ${d.color}40` : 'none',
                          }}
                        >
                          <span
                            className="text-[9px] leading-tight font-bold tracking-widest uppercase md:text-xs"
                            style={{ color: active ? d.color : '#6b8299' }}
                          >
                            {d.label}
                          </span>
                          <span className="hidden text-[10px] text-neutral-50 md:inline">
                            {d.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button onClick={start} className="btn-game font-space-grotesk px-8 py-3 text-sm">
                  {dead ? '▶ Play Again' : '▶ Start Game'}
                </button>
                <p className="text-neutral-60 font-space-grotesk mt-4 text-xs">
                  Arrow Keys / WASD / Swipe
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile d-pad */}
        <div className="flex flex-col items-center gap-1 border-t border-white/5 p-4 md:hidden">
          <button
            onClick={() => {
              pendingDir.current = 'UP';
              if (!started) start();
            }}
            className="glass text-primary-50 hover:border-primary-50/50 active:bg-primary-50/10 flex h-12 w-12 items-center justify-center rounded-sm border border-white/10"
          >
            ▲
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => {
                pendingDir.current = 'LEFT';
                if (!started) start();
              }}
              className="glass text-primary-50 hover:border-primary-50/50 active:bg-primary-50/10 flex h-12 w-12 items-center justify-center rounded-sm border border-white/10"
            >
              ◄
            </button>
            <button
              onClick={() => {
                pendingDir.current = 'DOWN';
                if (!started) start();
              }}
              className="glass text-primary-50 hover:border-primary-50/50 active:bg-primary-50/10 flex h-12 w-12 items-center justify-center rounded-sm border border-white/10"
            >
              ▼
            </button>
            <button
              onClick={() => {
                pendingDir.current = 'RIGHT';
                if (!started) start();
              }}
              className="glass text-primary-50 hover:border-primary-50/50 active:bg-primary-50/10 flex h-12 w-12 items-center justify-center rounded-sm border border-white/10"
            >
              ►
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
