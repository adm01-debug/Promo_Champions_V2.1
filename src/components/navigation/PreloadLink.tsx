import React, { forwardRef, memo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

export type PrefetchableRouteComponent = {
  prefetch?: () => Promise<unknown> | unknown;
};

const prefetchedTargets = new Set<string>();

interface PreloadLinkProps extends Omit<HTMLMotionProps<'a'>, 'href'> {
  to: string;
  children: React.ReactNode;
  replace?: boolean;
  component?: PrefetchableRouteComponent;
}

/**
 * PreloadLink - An optimized Link component that preloads the target route
 * on hover or touch to achieve near-instant navigation.
 */
export const PreloadLink = memo(forwardRef<HTMLAnchorElement, PreloadLinkProps>(
  ({
    to,
    children,
    className,
    replace,
    component,
    onClick,
    onMouseEnter,
    onTouchStart,
    id,
    ...props
  }, ref) => {
    const navigate = useNavigate();
    const location = useLocation();

    const preloadRoute = useCallback(() => {
      if (!to || to.startsWith('#') || prefetchedTargets.has(to)) return;
      prefetchedTargets.add(to);

      const isInternalRoute = to.startsWith('/') && !to.startsWith('//');
      if (!isInternalRoute) {
        const link = document.createElement('link');
        link.rel = to.endsWith('.js') ? 'modulepreload' : 'prefetch';
        link.href = to;
        document.head.appendChild(link);
      }

      if (component?.prefetch) {
        void component.prefetch();
      }
    }, [to, component]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;

      // If it's an external link or a hash, let the browser handle it
      if (to.startsWith('http') || to.startsWith('#')) {
        return;
      }

      if (location.pathname === to) {
        e.preventDefault();
        return;
      }
      
      e.preventDefault();
      triggerHaptic('light');
      navigate(to, { replace });
    };

    const handleMouseEnter: PreloadLinkProps['onMouseEnter'] = event => {
      onMouseEnter?.(event);
      preloadRoute();
    };

    const handleTouchStart: PreloadLinkProps['onTouchStart'] = event => {
      onTouchStart?.(event);
      preloadRoute();
    };

    return (
      <motion.a
        {...props}
        ref={ref}
        id={id}
        href={to}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
        className={className}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.a>
    );
  }
));

PreloadLink.displayName = 'PreloadLink';
