import { toast as sonnerToast } from 'sonner';
import { CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <AlertCircle className="h-5 w-5 text-destructive" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
  loading: <Loader2 className="h-5 w-5 text-primary animate-spin" />,
};

function createToast(type: ToastType, options: ToastOptions) {
  const { title, description, duration = 4000, action, onDismiss, onAutoClose } = options;

  return sonnerToast(title, {
    description,
    duration: type === 'loading' ? Infinity : duration,
    icon: icons[type],
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
    onDismiss,
    onAutoClose,
    className: 'group',
  });
}

export const contextualToast = {
  success: (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    return createToast('success', opts);
  },

  error: (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    return createToast('error', { ...opts, duration: opts.duration || 6000 });
  },

  warning: (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    return createToast('warning', opts);
  },

  info: (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    return createToast('info', opts);
  },

  loading: (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    return createToast('loading', opts);
  },

  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
    });
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  // Convenience methods for common actions
  saved: () => createToast('success', { title: 'Salvo com sucesso!' }),
  deleted: () => createToast('success', { title: 'Excluído com sucesso!' }),
  copied: () => createToast('success', { title: 'Copiado para a área de transferência!' }),
  sent: () => createToast('success', { title: 'Enviado com sucesso!' }),
  updated: () => createToast('success', { title: 'Atualizado com sucesso!' }),
  created: () => createToast('success', { title: 'Criado com sucesso!' }),
  
  networkError: () =>
    createToast('error', {
      title: 'Erro de conexão',
      description: 'Verifique sua internet e tente novamente.',
      action: {
        label: 'Tentar novamente',
        onClick: () => window.location.reload(),
      },
    }),

  sessionExpired: () =>
    createToast('warning', {
      title: 'Sessão expirada',
      description: 'Faça login novamente para continuar.',
      action: {
        label: 'Fazer login',
        onClick: () => (window.location.href = '/login'),
      },
    }),

  permissionDenied: () =>
    createToast('error', {
      title: 'Acesso negado',
      description: 'Você não tem permissão para realizar esta ação.',
    }),
};

export { contextualToast as toast };
