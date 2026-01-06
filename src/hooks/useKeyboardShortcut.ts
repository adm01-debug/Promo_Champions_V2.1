import { useEffect, useRef, useCallback } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: KeyHandler;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const metaMatch = shortcut.meta ? event.metaKey : true;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.handler(event);
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Common shortcuts
export function useEscapeKey(handler: () => void, enabled: boolean = true) {
  useKeyboardShortcut([{ key: 'Escape', handler }], enabled);
}

export function useSaveShortcut(handler: () => void, enabled: boolean = true) {
  useKeyboardShortcut([{ key: 's', ctrl: true, handler }], enabled);
}

export function useSearchShortcut(handler: () => void, enabled: boolean = true) {
  useKeyboardShortcut([{ key: 'k', ctrl: true, handler }], enabled);
}
