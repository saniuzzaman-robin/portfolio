'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  DARK_MEDIA_QUERY,
  DEFAULT_THEME,
  THEME_COLORS,
  THEME_STORAGE_KEY,
  isThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme';

type ThemeContextValue = {
  /** What the user picked (may be `system`). */
  preference: ThemePreference;
  /** What is actually rendered. */
  theme: ResolvedTheme;
  isDark: boolean;
  setPreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* ---------- preference store (localStorage, synced across tabs) ---------- */

const preferenceListeners = new Set<() => void>();
let memoryPreference: ThemePreference | null = null;

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : 'system';
  } catch {
    // Storage can be unavailable (privacy mode, disabled cookies): follow the OS.
    return 'system';
  }
}

function writePreference(preference: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Not persisted, but still applied for this session via the listeners below.
  }
  memoryPreference = preference;
  preferenceListeners.forEach((listener) => listener());
}

function getPreferenceSnapshot(): ThemePreference {
  return memoryPreference ?? readPreference();
}

function subscribePreference(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    memoryPreference = null;
    listener();
  };
  preferenceListeners.add(listener);
  window.addEventListener('storage', onStorage);
  return () => {
    preferenceListeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/* ---------- system colour-scheme store ---------- */

function getSystemSnapshot(): boolean {
  return window.matchMedia(DARK_MEDIA_QUERY).matches;
}

function subscribeSystem(listener: () => void) {
  const media = window.matchMedia(DARK_MEDIA_QUERY);
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}

/* ---------- hydration flag ---------- */

const noopSubscribe = () => () => {};

/* ---------- DOM application ---------- */

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  if (root.getAttribute('data-theme') === theme) return;

  // Suppress transitions for one frame so every surface swaps colour together.
  root.classList.add('theme-switching');
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute('content', THEME_COLORS[theme]));
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.classList.remove('theme-switching'))
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useSyncExternalStore(
    subscribePreference,
    getPreferenceSnapshot,
    () => 'system' as const
  );
  const systemIsDark = useSyncExternalStore(
    subscribeSystem,
    getSystemSnapshot,
    () => DEFAULT_THEME === 'dark'
  );
  // False while hydrating: the stores above report server snapshots then, and the
  // pre-paint script has already applied the real theme, so the DOM must not be touched.
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const theme = resolveTheme(preference, systemIsDark);

  useEffect(() => {
    if (hydrated) applyTheme(theme);
  }, [hydrated, theme]);

  const toggleTheme = useCallback(() => {
    writePreference(theme === 'dark' ? 'light' : 'dark');
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      theme,
      isDark: theme === 'dark',
      setPreference: writePreference,
      toggleTheme,
    }),
    [preference, theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within <ThemeProvider>.');
  return context;
}
