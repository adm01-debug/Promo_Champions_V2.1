export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: any): never {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 401:
        throw new APIError('Não autorizado. Faça login novamente.', 401, 'UNAUTHORIZED');
      case 403:
        throw new APIError('Acesso negado.', 403, 'FORBIDDEN');
      case 404:
        throw new APIError('Recurso não encontrado.', 404, 'NOT_FOUND');
      case 429:
        throw new APIError('Muitas requisições. Tente novamente mais tarde.', 429, 'RATE_LIMIT');
      case 500:
        throw new APIError('Erro no servidor. Tente novamente.', 500, 'SERVER_ERROR');
      default:
        throw new APIError(data?.message || 'Erro desconhecido', status);
    }
  }

  if (error.request) {
    throw new APIError('Sem conexão com o servidor', 0, 'NO_CONNECTION');
  }

  throw new APIError(error.message || 'Erro inesperado');
}
