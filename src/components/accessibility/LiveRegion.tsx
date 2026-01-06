import { FC, useEffect, useState } from 'react';
import { VisuallyHidden } from './VisuallyHidden';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
}

/**
 * Announces messages to screen readers
 */
export const LiveRegion: FC<LiveRegionProps> = ({ 
  message, 
  politeness = 'polite',
  clearAfter = 5000
}) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (message) {
      // Clear and re-set to ensure the message is announced
      setAnnouncement('');
      const timer = setTimeout(() => setAnnouncement(message), 100);
      
      // Clear after specified time
      const clearTimer = setTimeout(() => setAnnouncement(''), clearAfter);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [message, clearAfter]);

  return (
    <VisuallyHidden>
      <div 
        role="status" 
        aria-live={politeness}
        aria-atomic="true"
      >
        {announcement}
      </div>
    </VisuallyHidden>
  );
};

// Hook for managing announcements
export const useAnnounce = () => {
  const [message, setMessage] = useState('');

  const announce = (text: string) => {
    setMessage('');
    setTimeout(() => setMessage(text), 100);
  };

  return { message, announce };
};
