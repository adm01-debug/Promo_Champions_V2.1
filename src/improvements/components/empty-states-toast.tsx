// ============================================================================
// EMPTY STATES - 7 PÁGINAS
// src/components/shared/EmptyState.tsx
// ============================================================================

import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="rounded-full bg-muted p-6 mb-6">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-8">{description}</p>
      
      {action && (
        <Button onClick={action.onClick} size="lg">
          {action.icon && <action.icon className="mr-2 h-5 w-5" />}
          {action.label}
        </Button>
      )}
    </div>
  );
};

// ============================================================================
// EMPTY STATES PRÉ-CONFIGURADOS
// ============================================================================

import { Users, Package, Activity, CheckSquare, Bell, Briefcase, FileText } from 'lucide-react';

export const EMPTY_STATES = {
  clients: {
    icon: Users,
    title: 'Nenhum cliente cadastrado',
    description: 'Comece adicionando seu primeiro cliente para gerenciar suas vendas e relacionamentos.',
  },
  
  pipeline: {
    icon: Briefcase,
    title: 'Pipeline vazio',
    description: 'Adicione deals ao pipeline para começar a acompanhar suas oportunidades de vendas.',
  },
  
  products: {
    icon: Package,
    title: 'Nenhum produto cadastrado',
    description: 'Cadastre produtos para facilitar a criação de propostas e orçamentos.',
  },
  
  activities: {
    icon: Activity,
    title: 'Nenhuma atividade registrada',
    description: 'Crie atividades para organizar seu trabalho e acompanhar tarefas importantes.',
  },
  
  tasks: {
    icon: CheckSquare,
    title: 'Todas as tarefas concluídas!',
    description: 'Parabéns! Você está em dia com suas tarefas. Continue assim!',
  },
  
  notifications: {
    icon: Bell,
    title: 'Nenhuma notificação',
    description: 'Você está em dia! Não há notificações pendentes no momento.',
  },
  
  teams: {
    icon: Users,
    title: 'Nenhuma equipe criada',
    description: 'Organize seus vendedores em equipes para melhor gestão e acompanhamento.',
  },
};

// ============================================================================
// TOAST NOTIFICATIONS - SISTEMA COMPLETO
// src/lib/toast-helpers.ts
// ============================================================================

import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Info, Loader2, AlertTriangle } from 'lucide-react';

export class ToastHelper {
  /**
   * Toast de sucesso
   */
  static success(message: string, options?: {
    description?: string;
    action?: { label: string; onClick: () => void };
    duration?: number;
  }) {
    toast.success(message, {
      description: options?.description,
      icon: <CheckCircle className="h-4 w-4" />,
      duration: options?.duration || 3000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  }

  /**
   * Toast de erro
   */
  static error(message: string, options?: {
    description?: string;
    retry?: () => void;
    duration?: number;
  }) {
    toast.error(message, {
      description: options?.description,
      icon: <AlertCircle className="h-4 w-4" />,
      duration: options?.duration || 5000,
      action: options?.retry ? {
        label: 'Tentar novamente',
        onClick: options.retry,
      } : undefined,
    });
  }

  /**
   * Toast de informação
   */
  static info(message: string, options?: {
    description?: string;
    duration?: number;
  }) {
    toast.info(message, {
      description: options?.description,
      icon: <Info className="h-4 w-4" />,
      duration: options?.duration || 3000,
    });
  }

  /**
   * Toast de aviso
   */
  static warning(message: string, options?: {
    description?: string;
    duration?: number;
  }) {
    toast.warning(message, {
      description: options?.description,
      icon: <AlertTriangle className="h-4 w-4" />,
      duration: options?.duration || 4000,
    });
  }

  /**
   * Toast de loading
   */
  static loading(message: string) {
    return toast.loading(message, {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
    });
  }

  /**
   * Toast com promise
   */
  static async promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ): Promise<T> {
    return toast.promise(promise, {
      loading: messages.loading,
      success: (data) => ({
        icon: <CheckCircle className="h-4 w-4" />,
        text: typeof messages.success === 'function' 
          ? messages.success(data) 
          : messages.success,
      }),
      error: (error) => ({
        icon: <AlertCircle className="h-4 w-4" />,
        text: typeof messages.error === 'function' 
          ? messages.error(error) 
          : messages.error,
      }),
    });
  }

  /**
   * Toast customizado
   */
  static custom(component: React.ReactNode, options?: {
    duration?: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  }) {
    toast.custom(component, {
      duration: options?.duration || 3000,
      position: options?.position || 'bottom-right',
    });
  }

  /**
   * Dismissar toast
   */
  static dismiss(toastId?: string | number) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }

  /**
   * Dismissar todos
   */
  static dismissAll() {
    toast.dismiss();
  }
}

// ============================================================================
// TOAST PATTERNS - CASOS DE USO COMUNS
// ============================================================================

export class ToastPatterns {
  /**
   * Salvar com sucesso + ação de desfazer
   */
  static saved(itemName: string, onUndo?: () => void) {
    ToastHelper.success(`${itemName} salvo com sucesso`, {
      action: onUndo ? {
        label: 'Desfazer',
        onClick: onUndo,
      } : undefined,
    });
  }

  /**
   * Deletar com sucesso + ação de desfazer
   */
  static deleted(itemName: string, onUndo?: () => void) {
    ToastHelper.success(`${itemName} excluído`, {
      description: 'O item foi movido para a lixeira',
      action: onUndo ? {
        label: 'Desfazer',
        onClick: onUndo,
      } : undefined,
      duration: 5000,
    });
  }

  /**
   * Erro de validação
   */
  static validationError(fields: string[]) {
    ToastHelper.error('Erro de validação', {
      description: `Campos obrigatórios: ${fields.join(', ')}`,
    });
  }

  /**
   * Erro de rede
   */
  static networkError(retry?: () => void) {
    ToastHelper.error('Erro de conexão', {
      description: 'Não foi possível conectar ao servidor',
      retry,
    });
  }

  /**
   * Operação em lote
   */
  static async batch<T>(
    items: T[],
    operation: (item: T) => Promise<void>,
    itemName: string
  ) {
    const toastId = ToastHelper.loading(`Processando ${items.length} ${itemName}...`);
    
    let success = 0;
    let failed = 0;

    for (const item of items) {
      try {
        await operation(item);
        success++;
      } catch {
        failed++;
      }
    }

    ToastHelper.dismiss(toastId);

    if (failed === 0) {
      ToastHelper.success(`${success} ${itemName} processados com sucesso`);
    } else {
      ToastHelper.warning(`${success} processados, ${failed} falharam`);
    }
  }

  /**
   * Upload de arquivo
   */
  static uploadProgress(filename: string, progress: number) {
    ToastHelper.custom(
      <div className="flex items-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin" />
        <div className="flex-1">
          <p className="font-medium">{filename}</p>
          <div className="w-full bg-muted rounded-full h-2 mt-1">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  /**
   * Copiado para clipboard
   */
  static copied(text?: string) {
    ToastHelper.success('Copiado!', {
      description: text ? `"${text}" copiado para área de transferência` : undefined,
      duration: 2000,
    });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ToastHelper as toast };
export default ToastHelper;
