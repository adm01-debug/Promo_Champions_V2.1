import { useEffect } from 'react';

export function useKeyboard(key: string, callback: () => void, deps: any[] = []) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === key) {
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [key, callback, ...deps]);
}

export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  deps: any[] = []
) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const pressedKeys = [];
      if (event.ctrlKey) pressedKeys.push('ctrl');
      if (event.shiftKey) pressedKeys.push('shift');
      if (event.altKey) pressedKeys.push('alt');
      pressedKeys.push(event.key.toLowerCase());

      if (keys.every(k => pressedKeys.includes(k.toLowerCase()))) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [keys, callback, ...deps]);
}
