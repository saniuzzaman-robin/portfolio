export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_PREFERENCES: readonly ThemePreference[] = ['light', 'dark', 'system'];
export const THEME_STORAGE_KEY = 'theme';
export const DEFAULT_THEME: ResolvedTheme = 'dark';
export const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

/** Browser chrome colours; must match `--bg` in globals.css. */
export const THEME_COLORS: Record<ResolvedTheme, string> = {
  dark: '#070709',
  light: '#f8fafc',
};

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value);
}

export function resolveTheme(preference: ThemePreference, systemIsDark: boolean): ResolvedTheme {
  if (preference === 'system') return systemIsDark ? 'dark' : 'light';
  return preference;
}

/**
 * Inline script executed before first paint so the correct theme is applied
 * without a flash. Kept dependency-free and in sync with `resolveTheme`.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});if(p!=='light'&&p!=='dark')p='system';var t=p==='system'?(window.matchMedia(${JSON.stringify(
  DARK_MEDIA_QUERY
)}).matches?'dark':'light'):p;var d=document.documentElement;d.setAttribute('data-theme',t);d.style.colorScheme=t;}catch(e){}})();`;
