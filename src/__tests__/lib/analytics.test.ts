import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trackToolEvent } from '@/lib/analytics';

describe('trackToolEvent', () => {
  const gtag = vi.fn();

  beforeEach(() => {
    window.gtag = gtag;
  });

  afterEach(() => {
    gtag.mockReset();
    delete window.gtag;
    window.history.replaceState(null, '', '/');
  });

  it('sends the tool slug from the URL', () => {
    window.history.replaceState(null, '', '/tools/json?mode=minify');
    trackToolEvent('run');
    expect(gtag).toHaveBeenCalledWith('event', 'tool_run', { tool: 'json' });
  });

  it('includes the preset on a preset page', () => {
    window.history.replaceState(null, '', '/tools/format/sql');
    trackToolEvent('copy');
    expect(gtag).toHaveBeenCalledWith('event', 'tool_copy', { tool: 'format', preset: 'sql' });
  });

  it('ignores pages outside a tool', () => {
    for (const path of ['/tools', '/tools/', '/projects', '/toolsx/json']) {
      window.history.replaceState(null, '', path);
      trackToolEvent('download');
    }
    expect(gtag).not.toHaveBeenCalled();
  });

  it('is a no-op when gtag is not loaded', () => {
    delete window.gtag;
    window.history.replaceState(null, '', '/tools/json');
    expect(() => trackToolEvent('run')).not.toThrow();
  });
});
