import { useEffect, useCallback, useRef, FC, ReactNode } from 'react';

interface KeyboardNavigationProps {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical' | 'both';
  wrap?: boolean;
  className?: string;
  onNavigate?: (direction: 'next' | 'prev' | 'first' | 'last', index: number) => void;
}

/**
 * KeyboardNavigation - Enables arrow key navigation for lists and grids
 * Follows WAI-ARIA patterns for keyboard interaction
 */
export const KeyboardNavigation: FC<KeyboardNavigationProps> = ({
  children,
  orientation = 'vertical',
  wrap = true,
  className,
  onNavigate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndex = useRef(0);

  const getFocusableItems = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        '[role="menuitem"], [role="option"], [role="tab"], [role="listitem"], button, a'
      )
    ).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
  }, []);

  const focusItem = useCallback((index: number) => {
    const items = getFocusableItems();
    if (items.length === 0) return;

    let targetIndex = index;
    if (wrap) {
      targetIndex = ((index % items.length) + items.length) % items.length;
    } else {
      targetIndex = Math.max(0, Math.min(index, items.length - 1));
    }

    items[targetIndex]?.focus();
    currentIndex.current = targetIndex;
  }, [getFocusableItems, wrap]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const items = getFocusableItems();
    if (items.length === 0) return;

    // Find current focused item index
    const focusedIndex = items.findIndex(item => item === document.activeElement);
    if (focusedIndex === -1) return;

    let handled = false;
    let direction: 'next' | 'prev' | 'first' | 'last' | null = null;

    switch (e.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          focusItem(focusedIndex + 1);
          direction = 'next';
          handled = true;
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          focusItem(focusedIndex - 1);
          direction = 'prev';
          handled = true;
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          focusItem(focusedIndex + 1);
          direction = 'next';
          handled = true;
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          focusItem(focusedIndex - 1);
          direction = 'prev';
          handled = true;
        }
        break;
      case 'Home':
        focusItem(0);
        direction = 'first';
        handled = true;
        break;
      case 'End':
        focusItem(items.length - 1);
        direction = 'last';
        handled = true;
        break;
    }

    if (handled) {
      e.preventDefault();
      if (direction && onNavigate) {
        onNavigate(direction, currentIndex.current);
      }
    }
  }, [getFocusableItems, focusItem, orientation, onNavigate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

/**
 * Hook for custom keyboard navigation
 */
export const useKeyboardNavigation = (options: {
  onEnter?: () => void;
  onEscape?: () => void;
  onSpace?: () => void;
  onTab?: (shift: boolean) => void;
  onArrow?: (direction: 'up' | 'down' | 'left' | 'right') => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          options.onEnter?.();
          break;
        case 'Escape':
          options.onEscape?.();
          break;
        case ' ':
          options.onSpace?.();
          break;
        case 'Tab':
          options.onTab?.(e.shiftKey);
          break;
        case 'ArrowUp':
          options.onArrow?.('up');
          break;
        case 'ArrowDown':
          options.onArrow?.('down');
          break;
        case 'ArrowLeft':
          options.onArrow?.('left');
          break;
        case 'ArrowRight':
          options.onArrow?.('right');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [options]);
};
