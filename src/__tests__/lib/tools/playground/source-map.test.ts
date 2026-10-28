import { describe, it, expect } from 'vitest';
import { sourceLineMap } from '@/lib/tools/playground/source-map';

// Segments are [generated column, source index, source line, source column], each relative.
describe('sourceLineMap', () => {
  it('maps each generated line to the source line of its first segment', () => {
    expect(sourceLineMap('AAAA;AACA;AAEA', 3)).toEqual([1, 2, 4]);
  });

  it('keeps source lines relative across generated lines, including negative steps', () => {
    expect(sourceLineMap('AAEA;AADA;AADA', 3)).toEqual([3, 2, 1]);
  });

  it('decodes multi-digit VLQ values', () => {
    // `gB` is 32 with a continuation bit, then 1 << 5: +16 lines.
    expect(sourceLineMap('AAAA;AAgBA', 2)).toEqual([1, 17]);
  });

  it('uses the first segment of a line but still counts the later ones', () => {
    expect(sourceLineMap('AAAA,EACA;AAAA', 2)).toEqual([1, 2]);
  });

  it('gives lines without segments the line before them', () => {
    expect(sourceLineMap('AAAA;;AACA', 5)).toEqual([1, 1, 2, 2, 2]);
  });

  it('skips segments without a source position', () => {
    expect(sourceLineMap('AACA;A', 2)).toEqual([2, 2]);
  });

  it('starts at line 1 when the first lines have no segments', () => {
    expect(sourceLineMap(';AAEA', 2)).toEqual([1, 3]);
  });

  it('rejects characters outside base64', () => {
    expect(() => sourceLineMap('AA!A', 1)).toThrow('Invalid character "!"');
  });
});
