// ============================================================================
// ANIMATIONS - Framer Motion presets
// src/lib/animations.ts
// ============================================================================

export const ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
  },
  stagger: {
    animate: {
      transition: { staggerChildren: 0.1 },
    },
  },
};

// ============================================================================
// KEYBOARD SHORTCUTS
// src/hooks/useKeyboardShortcuts.ts
// ============================================================================

import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
}

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        const match =
          e.key === shortcut.key &&
          (!shortcut.ctrl || e.ctrlKey || e.metaKey) &&
          (!shortcut.shift || e.shiftKey) &&
          (!shortcut.alt || e.altKey);

        if (match) {
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
};

// ============================================================================
// GESTURE SUPPORT
// src/hooks/useSwipe.ts
// ============================================================================

import { useState } from 'react';

export const useSwipe = (onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void) => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  return {
    onTouchStart: (e: React.TouchEvent) => {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - touchStart.x;
      const deltaY = e.changedTouches[0].clientY - touchStart.y;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        onSwipe(deltaX > 0 ? 'right' : 'left');
      } else {
        onSwipe(deltaY > 0 ? 'down' : 'up');
      }
    },
  };
};

// ============================================================================
// ACCESSIBILITY HELPERS
// src/lib/accessibility.ts
// ============================================================================

export const a11y = {
  // Screen reader only text
  srOnly: 'sr-only',
  
  // Focus visible
  focusRing: 'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  
  // Skip to content
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50',
};

export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
};

// ============================================================================
// LOADING STATES
// src/components/shared/LoadingStates.tsx
// ============================================================================

export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={`${sizes[size]} animate-spin rounded-full border-2 border-primary border-t-transparent`} />
  );
};

export const Pulse = () => (
  <div className="flex gap-2">
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className="h-2 w-2 rounded-full bg-primary animate-pulse"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);

// ============================================================================
// RESPONSIVE UTILITIES
// src/hooks/useBreakpoint.ts
// ============================================================================

import { useState, useEffect } from 'react';

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('lg');

  useEffect(() => {
    const handler = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else if (width < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint),
  };
};
