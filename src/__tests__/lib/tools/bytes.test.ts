import { describe, it, expect } from 'vitest';
import { formatBytes, utf8Length } from '@/lib/tools/bytes';

describe('formatBytes', () => {
  it('keeps whole bytes below 1 KB', () => {
    expect(formatBytes(0, 'en')).toBe('0 B');
    expect(formatBytes(1023, 'en')).toBe('1,023 B');
  });

  it('steps up in powers of 1024 with one decimal', () => {
    expect(formatBytes(1536, 'en')).toBe('1.5 KB');
    expect(formatBytes(5 * 1024 * 1024, 'en')).toBe('5 MB');
  });

  it('clamps negative input to zero', () => {
    expect(formatBytes(-10, 'en')).toBe('0 B');
  });
});

describe('utf8Length', () => {
  it('counts encoded bytes, not UTF-16 code units', () => {
    expect(utf8Length('abc')).toBe(3);
    expect(utf8Length('é')).toBe(2);
    expect(utf8Length('😀')).toBe(4);
  });
});
