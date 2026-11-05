import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { trackCvDownload, trackToolEvent } from '@/lib/analytics';

describe('trackToolEvent', () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  afterEach(() => {
    delete window.dataLayer;
    window.history.replaceState(null, '', '/');
  });

  it('sends the tool slug from the URL', () => {
    window.history.replaceState(null, '', '/tools/json?mode=minify');
    trackToolEvent('run');
    expect(window.dataLayer).toStrictEqual([
      { event: 'tool_run', tool: 'json', preset: undefined },
    ]);
  });

  it('includes the preset on a preset page', () => {
    window.history.replaceState(null, '', '/tools/format/sql');
    trackToolEvent('copy');
    expect(window.dataLayer).toStrictEqual([{ event: 'tool_copy', tool: 'format', preset: 'sql' }]);
  });

  it('ignores pages outside a tool', () => {
    for (const path of ['/tools', '/tools/', '/projects', '/toolsx/json']) {
      window.history.replaceState(null, '', path);
      trackToolEvent('download');
    }
    expect(window.dataLayer).toStrictEqual([]);
  });

  it('is a no-op when GTM is not loaded', () => {
    delete window.dataLayer;
    window.history.replaceState(null, '', '/tools/json');
    expect(() => trackToolEvent('run')).not.toThrow();
  });
});

describe('trackCvDownload', () => {
  afterEach(() => {
    delete window.dataLayer;
  });

  it('sends the download location', () => {
    window.dataLayer = [];
    trackCvDownload('navbar');
    expect(window.dataLayer).toStrictEqual([{ event: 'cv_download', location: 'navbar' }]);
  });
});
