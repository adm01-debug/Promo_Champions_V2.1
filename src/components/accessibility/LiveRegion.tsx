import { FC, useEffect, useRef, useState } from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  clearAfterMs?: number;
}

/**
 * LiveRegion - Announces dynamic content changes to screen readers.
 * Uses a double-buffer technique to ensure announcements are always read.
 */
export const LiveRegion: FC<LiveRegionProps> = ({
  message,
  politeness = 'polite',
  clearAfterMs = 5000,
}) => {
  const [current, setCurrent] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!message) return;
    // Clear first, then set — forces screen reader to re-read
    setCurrent('');
    const id = requestAnimationFrame(() => setCurrent(message));

    if (clearAfterMs > 0) {
      timeoutRef.current = setTimeout(() => setCurrent(''), clearAfterMs);
    }

    return () => {
      cancelAnimationFrame(id);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [message, clearAfterMs]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {current}
    </div>
  );
};
