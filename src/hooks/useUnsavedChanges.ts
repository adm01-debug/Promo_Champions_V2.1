import { useEffect, useCallback } from 'react';

/**
 * Hook to warn users about unsaved changes when navigating away.
 * Uses the browser's native beforeunload event.
 * 
 * @param hasUnsavedChanges - Whether there are unsaved changes
 * @param message - Custom warning message (used by beforeunload)
 */
export const useUnsavedChanges = (
  hasUnsavedChanges: boolean,
  message = 'Você tem alterações não salvas. Deseja sair?'
) => {
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = message;
      return message;
    },
    [hasUnsavedChanges, message]
  );

  useEffect(() => {
    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, handleBeforeUnload]);
};
