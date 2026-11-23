import { forwardRef, useCallback, useRef, memo } from 'react';
import { NavLink as RouterNavLink, NavLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import { routePrefetchMap } from '@/routes/pagePrefetchMap';

const prefetched = new Set<string>();

interface NavLinkCompatProps extends Omit<NavLinkProps, 'className'> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = memo(
  forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
    ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
      const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

      const handleMouseEnter = useCallback(() => {
        const path = typeof to === 'string' ? to : to.pathname || '';
        if (prefetched.has(path)) return;
        timerRef.current = setTimeout(() => {
          const loader = routePrefetchMap[path];
          if (loader) {
            prefetched.add(path);
            loader().catch(() => {
              // Silently handle chunk loading errors on prefetch
              prefetched.delete(path);
            });
          }
        }, 50);
      }, [to]);

      const handleMouseLeave = useCallback(() => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }, []);

      return (
        <RouterNavLink
          ref={ref}
          to={to}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => triggerHaptic('light')}
          className={({ isActive, isPending }) =>
            cn(
              className,
              isActive && activeClassName,
              isPending && pendingClassName,
              'transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md'
            )
          }
          {...props}
        />
      );
    }
  )
);

NavLink.displayName = 'NavLink';

export { NavLink };
