import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description });
  },
  
  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description });
  },
  
  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description });
  },
  
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description });
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  }
};

// Usage
// toast.success('Sucesso!', 'Cliente criado com sucesso');
// toast.error('Erro!', 'Não foi possível salvar');
