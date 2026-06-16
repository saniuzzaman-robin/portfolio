import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlOrCmdMatch = shortcut.ctrlOrCmd
          ? e.ctrlKey || e.metaKey
          : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlOrCmdMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export function getShortcutLabel(shortcut: Omit<KeyboardShortcut, 'callback'>): string {
  const parts: string[] = [];
  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

  if (shortcut.ctrlOrCmd) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push('Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}
