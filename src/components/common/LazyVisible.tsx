import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyVisibleProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  minHeight?: number;
}

/**
 * Renders children only after the wrapper enters the viewport.
 * Useful for deferring heavy below-the-fold components (charts, maps).
 */
export const LazyVisible = ({
  children,
  fallback = null,
  rootMargin = '200px',
  minHeight = 250,
}: LazyVisibleProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} style={!visible ? { minHeight } : undefined}>
      {visible ? children : fallback}
    </div>
  );
};
