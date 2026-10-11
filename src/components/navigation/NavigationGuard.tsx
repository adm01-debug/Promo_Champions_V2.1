import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  handleDocumentClick,
  handlePopState,
  setConfirmHandler,
  setCurrentHref,
  setNavigateFn,
} from '@/lib/navigationGuard';

/**
 * Ponte entre o navigationGuard (imperativo) e o React Router + AlertDialog.
 * Montar uma única vez dentro do Router (MainLayout):
 * - registra o `navigate` para a interceptação de links internos;
 * - instala o listener de clique em capture phase;
 * - hospeda o diálogo de confirmação de saída com alterações não salvas.
 */
export function NavigationGuardBridge() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState<{
    message: string;
    resolve: (confirmed: boolean) => void;
  } | null>(null);
  const resolveRef = useRef(pending?.resolve);
  resolveRef.current = pending?.resolve;

  // Mantém a URL corrente para o guard re-empurrar ao interceptar um pop.
  useEffect(() => {
    setCurrentHref(window.location.href);
  }, [location]);

  useEffect(() => {
    setNavigateFn((path, options) => navigate(path, options));
    setConfirmHandler(
      message =>
        new Promise<boolean>(resolve => {
          setPending({ message, resolve });
        })
    );
    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('popstate', handlePopState);
    return () => {
      setNavigateFn(null);
      setConfirmHandler(null);
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const close = useCallback(
    (confirmed: boolean) => {
      pending?.resolve(confirmed);
      setPending(null);
    },
    [pending]
  );

  return (
    <AlertDialog
      open={pending !== null}
      onOpenChange={open => {
        if (!open) close(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
          <AlertDialogDescription>{pending?.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(false)}>
            Continuar editando
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => close(true)}>
            Sair sem salvar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
