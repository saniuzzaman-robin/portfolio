'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generateGameSchema } from '@/lib/schema';
import { sounds } from '@/lib/sounds';

const COLS = 10;
const ROWS = 20;
const CELL = 44;

type Grid = (string | null)[][];

const PIECES = [
  { shape: [[1, 1, 1, 1]], color: '#00d4ff' }, // I
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#00ff87',
  }, // O
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: '#a476ff',
  }, // S
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: '#ff6b6b',
  }, // Z
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: '#ffd700',
  }, // J
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: '#ff9500',
  }, // L
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: '#ff6bdb',
  }, // T
];

function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function rotatePiece(shape: number[][]): number[][] {
  return shape[0].map((_, i) => shape.map((r) => r[i]).reverse());
}

function rndPiece() {
  return PIECES[Math.floor(Math.random() * PIECES.length)];
}

interface Piece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

function newPiece(): Piece {
  const p = rndPiece();
  return { ...p, x: Math.floor(COLS / 2) - Math.floor(p.shape[0].length / 2), y: 0 };
}

function fits(grid: Grid, piece: Piece, dx = 0, dy = 0, shape?: number[][]): boolean {
  const s = shape ?? piece.shape;
  for (let r = 0; r < s.length; r++) {
    for (let c = 0; c < s[r].length; c++) {
      if (!s[r][c]) continue;
      const nx = piece.x + c + dx;
      const ny = piece.y + r + dy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
      if (ny >= 0 && grid[ny][nx]) return false;
    }
  }
  return true;
}

function merge(grid: Grid, piece: Piece): Grid {
  const g = grid.map((r) => [...r]);
  piece.shape.forEach((row, r) => {
    row.forEach((v, c) => {
      if (v && piece.y + r >= 0) g[piece.y + r][piece.x + c] = piece.color;
    });
  });
  return g;
}

function clearLines(grid: Grid): { grid: Grid; lines: number } {
  const kept = grid.filter((r) => r.some((c) => !c));
  const cleared = ROWS - kept.length;
  const newRows = Array.from({ length: cleared }, () => Array(COLS).fill(null));
  return { grid: [...newRows, ...kept], lines: cleared };
}

const SCORE_TABLE = [0, 100, 300, 500, 800];

export default function TetrisPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<Grid>(emptyGrid());
  const pieceRef = useRef<Piece>(newPiece());
  const nextRef = useRef<Piece>(newPiece());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [best, setBest] = useState(0);
  const [startLevel, setStartLevel] = useState(1);
  const startLevelRef = useRef(1);
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);
  const dropRef = useRef<ReturnType<typeof setInterval>>(null);

  function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    const g = ctx.createLinearGradient(x, y, x + CELL, y + CELL);
    g.addColorStop(0, color);
    g.addColorStop(1, color + '80');
    ctx.fillStyle = g;
    ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x + 2, y + 2, CELL - 4, 4);
    ctx.fillRect(x + 2, y + 2, 4, CELL - 4);
    // Glow shadow
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = color + '20';
    ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
    ctx.shadowBlur = 0;
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const grid = gridRef.current;
    const piece = pieceRef.current;

    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
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

    // Ghost piece
    let ghostDy = 0;
    while (fits(grid, piece, 0, ghostDy + 1)) ghostDy++;
    if (ghostDy > 0) {
      piece.shape.forEach((row, r) => {
        row.forEach((v, c) => {
          if (!v) return;
          ctx.fillStyle = `${piece.color}30`;
          ctx.strokeStyle = `${piece.color}50`;
          ctx.lineWidth = 1;
          ctx.fillRect(
            (piece.x + c) * CELL + 1,
            (piece.y + r + ghostDy) * CELL + 1,
            CELL - 2,
            CELL - 2
          );
          ctx.strokeRect(
            (piece.x + c) * CELL + 1,
            (piece.y + r + ghostDy) * CELL + 1,
            CELL - 2,
            CELL - 2
          );
        });
      });
    }

    // Placed blocks
    grid.forEach((row, r) => {
      row.forEach((color, c) => {
        if (!color) return;
        drawBlock(ctx, c * CELL, r * CELL, color);
      });
    });

    // Active piece
    piece.shape.forEach((row, r) => {
      row.forEach((v, c) => {
        if (!v) return;
        drawBlock(ctx, (piece.x + c) * CELL, (piece.y + r) * CELL, piece.color);
      });
    });
  }, []);

  const lock = useCallback(() => {
    const g = merge(gridRef.current, pieceRef.current);
    const { grid: newG, lines: cleared } = clearLines(g);
    gridRef.current = newG;

    if (cleared > 0) {
      sounds.lineClear();
      const add = SCORE_TABLE[cleared] * levelRef.current;
      scoreRef.current += add;
      linesRef.current += cleared;
      levelRef.current = Math.floor(linesRef.current / 10) + 1;
      setScore(scoreRef.current);
      setLines(linesRef.current);
      setLevel(levelRef.current);
      setBest((b) => Math.max(b, scoreRef.current));
    } else {
      sounds.blockPlace();
    }

    pieceRef.current = { ...nextRef.current };
    nextRef.current = newPiece();

    if (!fits(gridRef.current, pieceRef.current)) {
      sounds.gameOver();
      setGameOver(true);
      if (dropRef.current) clearInterval(dropRef.current);
    }
    draw();
  }, [draw]);

  const drop = useCallback(() => {
    if (!fits(gridRef.current, pieceRef.current, 0, 1)) {
      lock();
    } else {
      pieceRef.current.y += 1;
      draw();
    }
  }, [lock, draw]);

  const startDrop = useCallback(
    (lvl: number) => {
      if (dropRef.current) clearInterval(dropRef.current);
      const speed = Math.max(80, 500 - (lvl - 1) * 40);
      dropRef.current = setInterval(drop, speed);
    },
    [drop]
  );

  const startGame = useCallback(() => {
    gridRef.current = emptyGrid();
    pieceRef.current = newPiece();
    nextRef.current = newPiece();
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = startLevelRef.current;
    setScore(0);
    setLines(0);
    setLevel(startLevelRef.current);
    setGameOver(false);
    setStarted(true);
    sounds.start();
    draw();
    startDrop(startLevelRef.current);
  }, [draw, startDrop]);

  useEffect(() => {
    draw();
    return () => {
      if (dropRef.current) clearInterval(dropRef.current);
    };
  }, [draw]);

  useEffect(() => {
    if (started && !gameOver) startDrop(level);
  }, [level, started, gameOver, startDrop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started || gameOver) {
        if (e.key === ' ' || e.key === 'Enter') startGame();
        return;
      }
      const p = pieceRef.current;
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (fits(gridRef.current, p, -1, 0)) {
            p.x -= 1;
            draw();
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (fits(gridRef.current, p, 1, 0)) {
            p.x += 1;
            draw();
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          drop();
          break;
        case 'ArrowUp':
        case 'z':
        case 'Z':
        case 'w':
        case 'W': {
          const rotated = rotatePiece(p.shape);
          if (fits(gridRef.current, p, 0, 0, rotated)) {
            p.shape = rotated;
            draw();
          }
          break;
        }
        case ' ': {
          e.preventDefault();
          let dy = 0;
          while (fits(gridRef.current, p, 0, dy + 1)) dy++;
          p.y += dy;
          draw();
          lock();
          break;
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, gameOver, drop, lock, draw, startGame]);

  const schema = generateGameSchema({
    name: 'Tetris — Block Stacker',
    description:
      'Drop tetrominos, clear lines, survive the cascade. A classic Tetris game reimagined with neon cyberpunk aesthetics.',
    url: 'https://saniuzzaman.dev/games/tetris',
    genre: 'Puzzle',
  });

  return (
    <>
      <SchemaScript schema={schema} />
      <div className="h-screen bg-neutral-5 text-neutral-90 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 glass-strong">
          <Link
            href="/games"
            className="flex items-center gap-2 text-neutral-50 hover:text-secondary-50 transition-colors text-sm font-space-grotesk uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Games
          </Link>
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-xs text-neutral-60 uppercase tracking-widest">Score</p>
              <p className="font-space-grotesk font-bold text-xl neon-cyan tabular-nums">{score}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-60 uppercase tracking-widest">Lines</p>
              <p className="font-space-grotesk font-bold text-xl neon-green tabular-nums">
                {lines}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-60 uppercase tracking-widest">Level</p>
              <p className="font-space-grotesk font-bold text-xl neon-purple tabular-nums">
                {level}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-60 uppercase tracking-widest">Best</p>
              <p className="font-space-grotesk font-bold text-xl text-neutral-70 tabular-nums">
                {best}
              </p>
            </div>
          </div>
          <button
            onClick={startGame}
            className="flex items-center gap-2 btn-neon-cyan px-4 py-2 rounded-sm text-xs font-space-grotesk font-bold uppercase tracking-widest"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {started ? 'Restart' : 'Start'}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-2 md:p-4 cyber-grid relative gap-6 overflow-hidden min-h-0">
          {/* Canvas */}
          <div className="relative h-full flex items-center justify-center min-h-0">
            <div
              className="relative"
              style={{
                aspectRatio: `${COLS}/${ROWS}`,
                height: '100%',
                maxWidth: '100%',
              }}
            >
              <div
                className="absolute -inset-1 rounded-sm opacity-40"
                style={{
                  background: 'linear-gradient(45deg, #00d4ff, #a476ff, #00ff87, #00d4ff)',
                  filter: 'blur(4px)',
                }}
              />
              <canvas
                ref={canvasRef}
                width={COLS * CELL}
                height={ROWS * CELL}
                className="relative block rounded-sm w-full h-full"
              />

              {/* Overlay */}
              {(!started || gameOver) && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-sm"
                  style={{ background: 'rgba(8,13,26,0.88)', backdropFilter: 'blur(4px)' }}
                >
                  <p className="font-space-grotesk font-bold text-3xl neon-cyan mb-2">
                    {gameOver ? 'GAME OVER' : 'TETRIS'}
                  </p>
                  {gameOver && (
                    <p className="text-neutral-70 text-sm mb-2">
                      Score: <span className="neon-cyan font-bold">{score}</span>
                    </p>
                  )}
                  <p className="text-neutral-60 text-xs mb-5 text-center px-4">
                    ↑ Rotate ←→ Move ↓ Soft drop Space = Hard drop
                  </p>

                  {/* Starting level picker */}
                  {!gameOver && (
                    <div className="mb-6 w-full px-4">
                      <p className="text-neutral-60 text-xs uppercase tracking-widest text-center mb-3 font-space-grotesk">
                        Starting Level
                      </p>
                      <div className="flex gap-2 justify-center">
                        {[1, 3, 5, 8, 10].map((lvl) => {
                          const active = startLevel === lvl;
                          return (
                            <button
                              key={lvl}
                              onClick={() => {
                                setStartLevel(lvl);
                                startLevelRef.current = lvl;
                              }}
                              className="w-10 h-10 rounded-sm border font-space-grotesk font-bold text-sm transition-all duration-200"
                              style={{
                                borderColor: active ? '#00d4ff' : 'rgba(255,255,255,0.1)',
                                background: active
                                  ? 'rgba(0,212,255,0.15)'
                                  : 'rgba(255,255,255,0.03)',
                                color: active ? '#00d4ff' : '#6b8299',
                                boxShadow: active ? '0 0 12px rgba(0,212,255,0.4)' : 'none',
                              }}
                            >
                              {lvl}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-neutral-50 text-[10px] text-center mt-2 font-space-grotesk">
                        Higher level = faster drops &amp; more score
                      </p>
                    </div>
                  )}

                  <button
                    onClick={startGame}
                    className="btn-neon-cyan px-8 py-3 rounded-sm font-space-grotesk font-bold text-sm uppercase tracking-widest"
                  >
                    {gameOver ? '> Play Again' : '> Start Game'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Side panel */}
          <div
            className="hidden lg:flex flex-col gap-4 w-32 h-full max-h-96"
            style={{ minWidth: '8rem' }}
          >
            <div className="glass border border-secondary-50/20 rounded-sm p-3">
              <p className="text-xs text-neutral-60 uppercase tracking-widest mb-2">Next</p>
              <canvas
                id="next-canvas"
                width={4 * CELL}
                height={4 * CELL}
                className="rounded-sm"
                ref={(c) => {
                  if (!c) return;
                  const ctx = c.getContext('2d');
                  if (!ctx) return;
                  const p = nextRef.current;
                  ctx.fillStyle = '#080d1a';
                  ctx.fillRect(0, 0, 4 * CELL, 4 * CELL);
                  const ox = Math.floor((4 - p.shape[0].length) / 2);
                  const oy = Math.floor((4 - p.shape.length) / 2);
                  p.shape.forEach((row, r) =>
                    row.forEach((v, c2) => {
                      if (!v) return;
                      ctx.fillStyle = p.color;
                      ctx.fillRect((ox + c2) * CELL + 2, (oy + r) * CELL + 2, CELL - 4, CELL - 4);
                    })
                  );
                }}
              />
            </div>
            <div className="glass border border-white/10 rounded-sm p-3 space-y-2 text-xs text-neutral-50 font-space-grotesk">
              <p>
                <span className="text-secondary-50">↑</span> Rotate
              </p>
              <p>
                <span className="text-secondary-50">←→</span> Move
              </p>
              <p>
                <span className="text-secondary-50">↓</span> Soft drop
              </p>
              <p>
                <span className="text-secondary-50">SPC</span> Hard drop
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
