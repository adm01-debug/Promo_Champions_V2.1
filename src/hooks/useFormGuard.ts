import { useEffect, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';
import { toast } from 'sonner';
import { triggerHaptic } from '@/lib/haptics';

/**
 * useFormGuard - Prevents navigation away from a page if a form is dirty.
 * @param isDirty - Whether the form has unsaved changes.
 * @param message - Custom message to show in the browser dialog (note: most modern browsers show a generic message).
 */
export function useFormGuard(isDirty: boolean, message: string = 'Você tem alterações não salvas. Deseja realmente sair?') {
  
  // Handle browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);

  // Handle SPA navigation (React Router)
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        isDirty && currentLocation.pathname !== nextLocation.pathname,
      [isDirty]
    )
  );

  // If navigation is blocked, show a notification/dialog
  useEffect(() => {
    if (blocker.state === 'blocked') {
      triggerHaptic('medium');
      const confirmLeave = window.confirm(message);
      if (confirmLeave) {
        triggerHaptic('success');
        blocker.proceed();
      } else {
        triggerHaptic('light');
        blocker.reset();
        toast.info('Navegação cancelada para proteger seus dados.', {
          icon: '🛡️',
        });
      }
    }
  }, [blocker, message]);

  return blocker;
}
