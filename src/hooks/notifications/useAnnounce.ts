import { useCallback, useState } from 'react';

/**
 * useAnnounce - Hook for managing screen reader announcements.
 * Returns [message, announce] — pass message to <LiveRegion>.
 */
export function useAnnounce(): [string, (text: string) => void] {
  const [message, setMessage] = useState('');

  const announce = useCallback((text: string) => {
    // Force re-render even with same message by adding timestamp
    setMessage('');
    requestAnimationFrame(() => setMessage(text));
  }, []);

  return [message, announce];
}
