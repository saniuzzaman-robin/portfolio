'use client';

import { useState, useEffect } from 'react';

const CRAFTSMAN_TRANSLATIONS = [
  { text: 'ARCHITECT', lang: 'English', script: 'latin' },
  { text: '匠', lang: 'Japanese', script: 'japanese' }, // Takumi - Master Craftsman
  { text: 'МАСТЕР', lang: 'Russian', script: 'cyrillic' }, // Master
  { text: '工匠', lang: 'Chinese', script: 'chinese' }, // Craftsman
  { text: 'بَنَّاء', lang: 'Arabic', script: 'arabic' }, // Builder
  { text: '장인', lang: 'Korean', script: 'korean' }, // Artisan
  { text: 'CREATOR', lang: 'Latin', script: 'latin' },
  { text: 'ΤΕΧΝΙΤΗΣ', lang: 'Greek', script: 'greek' }, // Craftsman
];

interface MultilingualLogoProps {
  className?: string;
  showDevSuffix?: boolean;
}

export function MultilingualLogo({ className = '', showDevSuffix = true }: MultilingualLogoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % CRAFTSMAN_TRANSLATIONS.length);
        setIsAnimating(false);
      }, 500); // Half of animation duration
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const current = CRAFTSMAN_TRANSLATIONS[currentIndex];
  const isRTL = current.script === 'arabic';

  // Split name for coloring
  const name = current.text;
  const firstPart = name.slice(0, Math.ceil(name.length / 3));
  const middlePart = name.slice(Math.ceil(name.length / 3), Math.ceil((2 * name.length) / 3));
  const lastPart = name.slice(Math.ceil((2 * name.length) / 3));

  return (
    <div className={`relative ${className}`}>
      <div
        className={`inline-flex min-w-50 items-center justify-center ${isRTL ? 'flex-row-reverse' : ''}`}
        style={{
          direction: isRTL ? 'rtl' : 'ltr',
        }}
      >
        {/* Animated Name Parts */}
        <span
          className={`inline-block transition-all duration-600 ${
            isAnimating ? '-translate-y-5 opacity-0' : 'translate-y-0 opacity-100'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <span className="neon-green group-hover:animate-glitch transition-all duration-300">
            {firstPart}
          </span>
          <span className="neon-cyan">{middlePart}</span>
          <span className="neon-purple">{lastPart}</span>
        </span>

        {/* .DEV suffix */}
        {showDevSuffix && (
          <span
            className={`neon-purple ml-0.5 inline-block transition-all duration-600 ${
              isAnimating ? '-translate-y-5 opacity-0' : 'translate-y-0 opacity-100'
            }`}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              transitionDelay: '50ms',
            }}
          >
            .DEV
          </span>
        )}
      </div>

      {/* Language indicator tooltip */}
      <span
        className={`font-poppins pointer-events-none absolute -bottom-5 left-0 text-[9px] tracking-wider text-neutral-50 opacity-0 transition-all duration-300 group-hover:opacity-60 ${
          isRTL ? 'right-0 left-auto' : ''
        }`}
      >
        {current.lang}
      </span>

      {/* Underline */}
      <span className="from-primary-50 via-secondary-50 to-tertiary-50 absolute -bottom-1 left-0 h-px w-0 bg-linear-to-r transition-all duration-500 group-hover:w-full" />
    </div>
  );
}
