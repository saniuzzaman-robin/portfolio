'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

/** Read the three accent colors from CSS variables (theme-aware). Falls back to dark-mode defaults. */
function getAccentColors(): string[] {
  if (typeof window === 'undefined') return ['#00ff87', '#00d4ff', '#a476ff'];
  const style = getComputedStyle(document.documentElement);
  return [
    style.getPropertyValue('--color-primary-50').trim() || '#00ff87',
    style.getPropertyValue('--color-secondary-50').trim() || '#00d4ff',
    style.getPropertyValue('--color-tertiary-50').trim() || '#a476ff',
  ];
}

/** One particle per N pixels of canvas area */
const PARTICLE_AREA_DIVISOR = 12000;
/** Hard cap on particle count to protect low-end devices */
const PARTICLE_MAX = 120;
/** Connection draw distance in px */
const CONNECTION_DISTANCE = 120;
/** Mouse repulsion radius in px */
const MOUSE_REPULSION_RADIUS = 100;
/** Resize debounce delay in ms */
const RESIZE_DEBOUNCE_MS = 150;

export function ParticleCanvas({ className = '' }: { className?: string }) {
  // A container div is rendered instead of a canvas so that the effect can
  // create a fresh <canvas> element on every invocation. This is necessary
  // because transferControlToOffscreen() is a one-way operation: once called,
  // the canvas element can never be used from the main thread again. React
  // StrictMode double-invokes effects on the same DOM node, so if we used a
  // ref'd <canvas>, the second invocation would find a "already transferred"
  // canvas and both the worker path and getContext('2d') would throw
  // InvalidStateError. By creating the canvas inside the effect and removing
  // it on cleanup, each invocation gets a fresh, untransferred element.
  const containerRef = useRef<HTMLDivElement>(null);
  // Refs used only in the inline fallback path
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create a fresh canvas element for this effect invocation.
    const canvas = document.createElement('canvas');
    canvas.className = 'w-full h-full';
    container.appendChild(canvas);

    // ── Worker path (OffscreenCanvas) ────────────────────────────────────────
    const supportsOffscreen =
      typeof OffscreenCanvas !== 'undefined' &&
      typeof canvas.transferControlToOffscreen === 'function';

    if (supportsOffscreen) {
      const offscreen = canvas.transferControlToOffscreen();
      const worker = new Worker('/particle.worker.js');

      worker.postMessage(
        {
          type: 'init',
          canvas: offscreen,
          width: container.offsetWidth,
          height: container.offsetHeight,
          colors: getAccentColors(),
        },
        [offscreen]
      );

      let resizeTimer: ReturnType<typeof setTimeout>;
      const resize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          worker.postMessage({
            type: 'resize',
            width: container.offsetWidth,
            height: container.offsetHeight,
            colors: getAccentColors(),
          });
        }, RESIZE_DEBOUNCE_MS);
      };

      const onMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        worker.postMessage({ type: 'mouse', x: e.clientX - rect.left, y: e.clientY - rect.top });
      };

      const onMouseLeave = () => {
        worker.postMessage({ type: 'mouse', x: -9999, y: -9999 });
      };

      window.addEventListener('resize', resize);
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mouseleave', onMouseLeave);

      return () => {
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('mouseleave', onMouseLeave);
        worker.postMessage({ type: 'stop' });
        worker.terminate();
        canvas.remove();
      };
    }

    // ── Inline fallback (browsers without OffscreenCanvas) ──────────────────
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let resizeTimer: ReturnType<typeof setTimeout>;
    const resize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        initParticles();
      }, RESIZE_DEBOUNCE_MS);
    };

    const initParticles = () => {
      const colors = getAccentColors();
      const count = Math.floor((canvas.width * canvas.height) / PARTICLE_AREA_DIVISOR);
      particlesRef.current = Array.from({ length: Math.min(count, PARTICLE_MAX) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      particles.forEach((p) => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < MOUSE_REPULSION_RADIUS) {
          const force = (MOUSE_REPULSION_RADIUS - dist) / MOUSE_REPULSION_RADIUS;
          p.vx += (dx / dist) * force * 0.3;
          p.vy += (dy / dist) * force * 0.3;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle =
          p.color +
          Math.floor(p.opacity * 255)
            .toString(16)
            .padStart(2, '0');
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const alpha = ((CONNECTION_DISTANCE - dist) / CONNECTION_DISTANCE) * 0.25;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initParticles();
    draw();

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animRef.current);
      canvas.remove();
    };
  }, []);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
}
