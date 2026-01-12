import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  type?: ToastType;
  title: string;
  description?: string;
  duration?: number;
  progress?: boolean;
  action?: ToastAction;
  undoAction?: () => void;
  link?: { label: string; href: string };
}

interface Toast extends ToastOptions {
  id: string;
  type: ToastType;
}

let toastId = 0;

export const useEnhancedToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = `toast-${++toastId}`;
    const toast: Toast = {
      id,
      type: options.type || 'info',
      ...options,
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateToast = useCallback((id: string, options: Partial<ToastOptions>) => {
    setToasts(prev => 
      prev.map(t => t.id === id ? { ...t, ...options } : t)
    );
  }, []);

  // Convenience methods
  const success = useCallback((title: string, options?: Omit<ToastOptions, 'title' | 'type'>) => {
    return addToast({ ...options, title, type: 'success' });
  }, [addToast]);

  const error = useCallback((title: string, options?: Omit<ToastOptions, 'title' | 'type'>) => {
    return addToast({ ...options, title, type: 'error', duration: options?.duration ?? 8000 });
  }, [addToast]);

  const warning = useCallback((title: string, options?: Omit<ToastOptions, 'title' | 'type'>) => {
    return addToast({ ...options, title, type: 'warning' });
  }, [addToast]);

  const info = useCallback((title: string, options?: Omit<ToastOptions, 'title' | 'type'>) => {
    return addToast({ ...options, title, type: 'info' });
  }, [addToast]);

  const loading = useCallback((title: string, options?: Omit<ToastOptions, 'title' | 'type'>) => {
    return addToast({ ...options, title, type: 'loading', duration: 0 });
  }, [addToast]);

  // Promise-based toast
  const promise = useCallback(async <T,>(
    promiseFn: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: Error) => string);
    }
  ): Promise<T> => {
    const id = loading(options.loading);

    try {
      const result = await promiseFn;
      updateToast(id, {
        type: 'success',
        title: typeof options.success === 'function' 
          ? options.success(result) 
          : options.success,
        duration: 5000,
      });
      return result;
    } catch (err) {
      updateToast(id, {
        type: 'error',
        title: typeof options.error === 'function' 
          ? options.error(err as Error) 
          : options.error,
        duration: 8000,
      });
      throw err;
    }
  }, [loading, updateToast]);

  return {
    toasts,
    addToast,
    removeToast,
    updateToast,
    success,
    error,
    warning,
    info,
    loading,
    promise,
  };
};
