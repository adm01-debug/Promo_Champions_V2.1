import { toast } from 'sonner';
import { z } from 'zod';

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fieldErrors?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400, { fieldErrors });
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Erro de conexão') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} não encontrado`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Limite de requisições excedido', 'RATE_LIMIT', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Erro interno do servidor') {
    super(message, 'SERVER_ERROR', 500);
    this.name = 'ServerError';
  }
}

// Error handler options
interface HandleErrorOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  rethrow?: boolean;
  fallbackMessage?: string;
}

// Main error handler
export function handleError(
  error: unknown,
  options: HandleErrorOptions = {}
): AppError {
  const {
    showToast = true,
    logToConsole = import.meta.env.DEV,
    rethrow = false,
    fallbackMessage = 'Ocorreu um erro inesperado',
  } = options;

  let appError: AppError;

  // Convert to AppError
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof z.ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.issues) {
      const path = issue.path.join('.');
      fieldErrors[path] = issue.message;
    }
    appError = new ValidationError('Dados inválidos', fieldErrors);
  } else if (error instanceof TypeError && error.message.includes('fetch')) {
    appError = new NetworkError();
  } else if (error instanceof Error) {
    appError = new AppError(error.message || fallbackMessage, 'UNKNOWN_ERROR');
  } else if (typeof error === 'string') {
    appError = new AppError(error, 'UNKNOWN_ERROR');
  } else {
    appError = new AppError(fallbackMessage, 'UNKNOWN_ERROR');
  }

  // Log to console
  if (logToConsole) {
    console.error('[Error]', {
      name: appError.name,
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      details: appError.details,
      originalError: error,
    });
  }

  // Show toast
  if (showToast) {
    const toastMessage = getToastMessage(appError);
    toast.error(toastMessage.title, {
      description: toastMessage.description,
    });
  }

  // Rethrow if needed
  if (rethrow) {
    throw appError;
  }

  return appError;
}

// Get user-friendly toast messages
function getToastMessage(error: AppError): { title: string; description?: string } {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return {
        title: 'Dados inválidos',
        description: error.message,
      };
    case 'NETWORK_ERROR':
      return {
        title: 'Erro de conexão',
        description: 'Verifique sua conexão e tente novamente',
      };
    case 'AUTH_ERROR':
      return {
        title: 'Sessão expirada',
        description: 'Faça login novamente para continuar',
      };
    case 'NOT_FOUND':
      return {
        title: 'Não encontrado',
        description: error.message,
      };
    case 'RATE_LIMIT':
      return {
        title: 'Muitas requisições',
        description: 'Aguarde um momento e tente novamente',
      };
    case 'SERVER_ERROR':
      return {
        title: 'Erro no servidor',
        description: 'Tente novamente em alguns instantes',
      };
    default:
      return {
        title: 'Erro',
        description: error.message,
      };
  }
}

// Parse Supabase errors
export function parseSupabaseError(error: { message?: string; code?: string; status?: number }): AppError {
  const message = error.message || 'Erro desconhecido';
  const code = error.code || 'SUPABASE_ERROR';
  const status = error.status;

  // Map common Supabase errors
  if (code === 'PGRST116' || status === 406) {
    return new NotFoundError();
  }
  if (code === '23505') {
    return new ValidationError('Registro duplicado');
  }
  if (code === '23503') {
    return new ValidationError('Referência inválida');
  }
  if (code === '42501' || status === 403) {
    return new AuthError('Sem permissão para esta operação');
  }
  if (status === 401) {
    return new AuthError();
  }
  if (status === 429) {
    return new RateLimitError();
  }
  if (status && status >= 500) {
    return new ServerError();
  }

  return new AppError(message, code, status);
}

// Try-catch wrapper
export async function tryCatch<T>(
  fn: () => Promise<T>,
  options: HandleErrorOptions = {}
): Promise<{ data: T; error: null } | { data: null; error: AppError }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const appError = handleError(error, { ...options, rethrow: false });
    return { data: null, error: appError };
  }
}

// Type guard for AppError
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
