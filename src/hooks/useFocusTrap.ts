import { useEffect, useRef, useCallback, RefObject } from 'react';

interface FocusTrapOptions {
  enabled?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  escapeDeactivates?: boolean;
  onEscape?: () => void;
}

export function useFocusTrap<T extends HTMLElement>(
  options: FocusTrapOptions = {}
): RefObject<T> {
  const {
    enabled = true,
    autoFocus = true,
    restoreFocus = true,
    escapeDeactivates = true,
    onEscape,
  } = options;

  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<Element | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(selector));
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      if (event.key === 'Escape' && escapeDeactivates) {
        event.preventDefault();
        onEscape?.();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [enabled, escapeDeactivates, onEscape, getFocusableElements]
  );

  useEffect(() => {
    if (!enabled) return;

    previousActiveElement.current = document.activeElement;

    if (autoFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        // Focus first focusable element or the one with autofocus
        const autoFocusElement = containerRef.current?.querySelector<HTMLElement>('[autofocus]');
        (autoFocusElement || focusableElements[0]).focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      if (restoreFocus && previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [enabled, autoFocus, restoreFocus, handleKeyDown, getFocusableElements]);

  return containerRef;
}

// Hook for roving tabindex navigation (for toolbars, menus, etc.)
interface RovingTabIndexOptions {
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
}

export function useRovingTabIndex<T extends HTMLElement>(
  options: RovingTabIndexOptions = {}
): RefObject<T> {
  const { orientation = 'horizontal', loop = true } = options;
  const containerRef = useRef<T>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (!containerRef.current?.contains(target)) return;

      const items = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>('[role="menuitem"], [role="option"], button')
      ).filter((el) => !el.hasAttribute('disabled'));

      const currentIndex = items.indexOf(target);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      const isHorizontal = orientation === 'horizontal' || orientation === 'both';
      const isVertical = orientation === 'vertical' || orientation === 'both';

      switch (event.key) {
        case 'ArrowRight':
          if (isHorizontal) {
            event.preventDefault();
            nextIndex = loop
              ? (currentIndex + 1) % items.length
              : Math.min(currentIndex + 1, items.length - 1);
          }
          break;
        case 'ArrowLeft':
          if (isHorizontal) {
            event.preventDefault();
            nextIndex = loop
              ? (currentIndex - 1 + items.length) % items.length
              : Math.max(currentIndex - 1, 0);
          }
          break;
        case 'ArrowDown':
          if (isVertical) {
            event.preventDefault();
            nextIndex = loop
              ? (currentIndex + 1) % items.length
              : Math.min(currentIndex + 1, items.length - 1);
          }
          break;
        case 'ArrowUp':
          if (isVertical) {
            event.preventDefault();
            nextIndex = loop
              ? (currentIndex - 1 + items.length) % items.length
              : Math.max(currentIndex - 1, 0);
          }
          break;
        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          nextIndex = items.length - 1;
          break;
      }

      if (nextIndex !== currentIndex) {
        items[currentIndex].setAttribute('tabindex', '-1');
        items[nextIndex].setAttribute('tabindex', '0');
        items[nextIndex].focus();
      }
    },
    [orientation, loop]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return containerRef;
}
