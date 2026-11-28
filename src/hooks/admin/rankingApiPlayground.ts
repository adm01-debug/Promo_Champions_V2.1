/**
 * Executor das chamadas do playground da `ranking-api`.
 *
 * Roda no navegador e chama a function direto: o token do integrador vai no
 * cabeçalho `Authorization`, a function valida em `validate_api_tokens` e devolve
 * a mesma resposta que qualquer cliente externo receberia — inclusive os erros.
 * Nenhuma credencial fica salva: token, caminho e corpo vivem só no estado da página.
 */
import {
  buildRequestBody,
  buildRequestUrl,
  buildRoutePath,
  type RankingApiRoute,
} from './rankingApiCatalog';

export interface RankingApiCallResult {
  status: number;
  ok: boolean;
  durationMs: number;
  body: unknown;
}

const ERROR_LABELS: Record<number, string> = {
  400: 'Requisição inválida — confira os campos obrigatórios',
  403: 'Token ausente, inválido ou expirado',
  404: 'Rota não encontrada para este caminho',
  409: 'Conflito — já existe registro com estes dados',
  422: 'Formato de campo recusado pela API',
  429: 'Limite de 60 chamadas por minuto atingido',
  500: 'Erro interno na function',
};

export function describeStatus(status: number): string {
  return ERROR_LABELS[status] ?? `HTTP ${status}`;
}

export async function callRankingApi(options: {
  supabaseUrl: string;
  method: RankingApiRoute['method'];
  path: string;
  token: string;
  route: RankingApiRoute;
  values: Record<string, string>;
}): Promise<RankingApiCallResult> {
  const { supabaseUrl, method, path, token, route, values } = options;
  const base = supabaseUrl.replace(/\/+$/, '');
  const url = buildRequestUrl(base, path);
  const hasBody = method === 'POST' || method === 'PUT';
  const startedAt = performance.now();

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    },
    body: hasBody ? JSON.stringify(buildRequestBody(route, values)) : undefined,
  });

  const raw = await response.text();
  let body: unknown = raw;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    body = raw;
  }

  return {
    status: response.status,
    ok: response.ok,
    durationMs: Math.round(performance.now() - startedAt),
    body,
  };
}

/** Caminho completo para exibição/cópia, já com os parâmetros preenchidos. */
export function resolveRoutePath(
  route: RankingApiRoute,
  values: Record<string, string>
): string {
  return buildRoutePath(route, values);
}
