import { FC, ReactNode, useEffect, useState } from 'react';

interface LiveRegionProps {
  children?: ReactNode;
  message?: string;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  clearAfter?: number; // ms
  className?: string;
}

/**
 * LiveRegion - Announces dynamic content changes to screen readers
 * Use for notifications, status updates, form errors, etc.
 */
export const LiveRegion: FC<LiveRegionProps> = ({
  children,
  message,
  politeness = 'polite',
  atomic = true,
  relevant = 'additions',
  clearAfter,
  className,
}) => {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setCurrentMessage(message);

    if (clearAfter && message) {
      const timer = setTimeout(() => {
        setCurrentMessage('');
      }, clearAfter);
      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={className || "sr-only"}
    >
      {currentMessage || children}
    </div>
  );
};

/**
 * Hook to manage live region announcements
 */
export const useLiveAnnouncer = () => {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message: string, clearAfter = 5000) => {
    // Clear previous announcement first to ensure re-announcement
    setAnnouncement('');
    requestAnimationFrame(() => {
      setAnnouncement(message);
    });

    if (clearAfter > 0) {
      setTimeout(() => setAnnouncement(''), clearAfter);
    }
  };

  return { announcement, announce };
};
