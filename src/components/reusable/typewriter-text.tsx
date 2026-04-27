'use client';

import { useEffect, useState, useRef } from 'react';

interface TypewriterTextProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pause?: number;
  className?: string;
  cursorClassName?: string;
}

export function TypewriterText({
  texts,
  speed = 80,
  deleteSpeed = 40,
  pause = 2000,
  className = '',
  cursorClassName = '',
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const currentText = texts[textIndex];

    const tick = () => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayed(currentText.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
          timeoutRef.current = setTimeout(tick, speed);
        } else {
          timeoutRef.current = setTimeout(() => setIsDeleting(true), pause);
        }
      } else {
        if (charIndex > 0) {
          setDisplayed(currentText.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
          timeoutRef.current = setTimeout(tick, deleteSpeed);
        } else {
          setIsDeleting(false);
          setTextIndex((i) => (i + 1) % texts.length);
          timeoutRef.current = setTimeout(tick, 300);
        }
      }
    };

    timeoutRef.current = setTimeout(tick, speed);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [charIndex, isDeleting, textIndex, texts, speed, deleteSpeed, pause]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((s) => !s), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={className}>
      {displayed}
      <span
        className={`${cursorClassName} inline-block w-0.5 ml-0.5 align-middle`}
        style={{ opacity: showCursor ? 1 : 0, transition: 'opacity 0.1s' }}
      >
        |
      </span>
    </span>
  );
}
