/**
 * Catálogo de rotas da `ranking-api` — espelho de `supabase/functions/ranking-api/index.ts`.
 *
 * A function não publica OpenAPI nem lista de rotas: um integrador só descobre o
 * contrato lendo o código Deno. Este catálogo é a fonte da UI de teste e do
 * exemplo de `curl`; `src/hooks/admin/rankingApiCatalog.test.ts` falha se ele
 * divergir das rotas de fato registradas no handler.
 */

export type RankingApiMethod = 'GET' | 'POST' | 'PUT';

export interface RankingApiField {
  name: string;
  label: string;
  kind: 'text' | 'email' | 'number' | 'select';
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: readonly string[];
  defaultValue?: string;
}

export interface RankingApiRoute {
  /** Caminho relativo à function, sem a barra inicial. `{param}` vira campo do formulário. */
  path: string;
  method: RankingApiMethod;
  title: string;
  description: string;
  /** O handler exige `tokenData.team_id` e devolve 400 para token de empresa. */
  requiresTeam: boolean;
  /** Preenchido pelas opções do token, não pelo usuário. */
  pathFields?: readonly RankingApiField[];
  bodyFields?: readonly RankingApiField[];
}

const USER_ID_FIELD: RankingApiField = {
  name: 'userId',
  label: 'ID do vendedor',
  kind: 'text',
  required: true,
  placeholder: 'uuid do salespeople',
  help: 'Use "Listar usuários" para descobrir o id.',
};

export const RANKING_API_ROUTES: readonly RankingApiRoute[] = [
  {
    path: 'users',
    method: 'GET',
    title: 'Listar usuários ativos',
    description: 'Todos os vendedores com is_active = true (máximo 500).',
    requiresTeam: false,
  },
  {
    path: 'user/{userId}',
    method: 'GET',
    title: 'Consultar usuário',
    description:
      'Ficha de um vendedor. Token de time só enxerga membros do próprio time.',
    requiresTeam: false,
    pathFields: [USER_ID_FIELD],
  },
  {
    path: 'user/create',
    method: 'POST',
    title: 'Criar usuário',
    description: 'Cria um vendedor ativo. Email duplicado devolve 409.',
    requiresTeam: false,
    bodyFields: [
      {
        name: 'name',
        label: 'Nome',
        kind: 'text',
        required: true,
        placeholder: 'Maria Silva',
      },
      {
        name: 'email',
        label: 'Email',
        kind: 'email',
        required: true,
        placeholder: 'maria@empresa.com',
      },
      {
        name: 'role',
        label: 'Papel',
        kind: 'select',
        options: ['hybrid', 'sdr', 'closer'],
        defaultValue: 'hybrid',
        help: 'Opcional — padrão hybrid.',
      },
    ],
  },
  {
    path: 'team',
    method: 'GET',
    title: 'Dados do time',
    description: 'Time vinculado ao token.',
    requiresTeam: true,
  },
  {
    path: 'team/users',
    method: 'GET',
    title: 'Membros do time',
    description: 'Membros do time com papel e pontuação.',
    requiresTeam: true,
  },
  {
    path: 'team/logs',
    method: 'GET',
    title: 'Histórico de pontuação',
    description: 'Últimas 100 alterações de pontuação dos membros do time.',
    requiresTeam: true,
  },
  {
    path: 'team/addfields',
    method: 'GET',
    title: 'Campos personalizados',
    description: 'Campos personalizados ativos do time.',
    requiresTeam: true,
  },
  {
    path: 'team/user/edit/total',
    method: 'PUT',
    title: 'Alterar pontuação total',
    description: 'Soma, subtrai ou define a pontuação total e registra no histórico.',
    requiresTeam: false,
    bodyFields: [
      {
        name: 'email',
        label: 'Email do vendedor',
        kind: 'email',
        required: true,
        placeholder: 'maria@empresa.com',
      },
      {
        name: 'type',
        label: 'Operação',
        kind: 'select',
        required: true,
        options: ['ADD', 'REM', 'SET'],
        defaultValue: 'ADD',
      },
      {
        name: 'value',
        label: 'Valor',
        kind: 'number',
        required: true,
        placeholder: '10',
      },
      {
        name: 'set_value',
        label: 'Sobrescrever o total',
        kind: 'select',
        options: ['false', 'true'],
        defaultValue: 'false',
        help: 'Aceito no body; "true" força gravar o valor como total.',
      },
    ],
  },
  {
    path: 'team/user/edit/addfield/{userId}',
    method: 'PUT',
    title: 'Alterar campo personalizado',
    description: 'Soma ou define o valor numérico de um campo do vendedor.',
    requiresTeam: false,
    pathFields: [USER_ID_FIELD],
    bodyFields: [
      {
        name: 'fieldid',
        label: 'ID do campo',
        kind: 'text',
        required: true,
        placeholder: 'uuid do team_custom_fields',
      },
      { name: 'value', label: 'Valor', kind: 'number', required: true, placeholder: '5' },
      {
        name: 'set_points',
        label: 'Definir o valor',
        kind: 'select',
        options: ['false', 'true'],
        defaultValue: 'false',
        help: '"false" soma ao valor atual; "true" substitui.',
      },
    ],
  },
  {
    path: 'company',
    method: 'GET',
    title: 'Dados da empresa',
    description: 'Resumo da empresa vinculada ao token.',
    requiresTeam: false,
  },
  {
    path: 'company/users',
    method: 'GET',
    title: 'Usuários da empresa',
    description:
      'Token de time lista só os membros; token de empresa lista todos os ativos.',
    requiresTeam: false,
  },
];

/** Monta o caminho final preenchendo `{param}` com os valores informados. */
export function buildRoutePath(
  route: RankingApiRoute,
  values: Record<string, string>
): string {
  return route.path
    .split('/')
    .map(segment => {
      const match = /^\{(.+)\}$/.exec(segment);
      if (!match) return segment;
      const value = (values[match[1] ?? ''] ?? '').trim();
      return value;
    })
    .join('/');
}

/** Campos `{param}` do caminho que ainda estão vazios. */
export function missingPathParams(
  route: RankingApiRoute,
  values: Record<string, string>
): string[] {
  return (route.pathFields ?? [])
    .filter(field => route.path.includes(`{${field.name}}`))
    .filter(field => !(values[field.name] ?? '').trim())
    .map(field => field.label);
}

/** Corpo JSON da requisição, sem campos opcionais vazios e com númericos convertidos. */
export function buildRequestBody(
  route: RankingApiRoute,
  values: Record<string, string>
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const field of route.bodyFields ?? []) {
    const raw = values[field.name];
    if (raw === undefined) continue;
    const trimmed = raw.trim();
    if (trimmed === '') {
      if (field.required) body[field.name] = '';
      continue;
    }
    if (field.kind === 'number') {
      body[field.name] = Number(trimmed);
    } else if (field.name === 'set_value' || field.name === 'set_points') {
      body[field.name] = trimmed === 'true';
    } else {
      body[field.name] = trimmed;
    }
  }
  return body;
}

/** URL absoluta da function a partir da origem do projeto Supabase. */
export function buildRequestUrl(supabaseUrl: string, route: string): string {
  return `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/ranking-api/v2/${route}`;
}

/** Exemplo pronto para colar em um terminal — mesmo token e mesmo caminho da UI. */
export function buildCurlSnippet(
  url: string,
  method: RankingApiMethod,
  token: string,
  body: Record<string, unknown> | null
): string {
  const parts = [
    `curl -X ${method} '${url}'`,
    `  -H 'Authorization: Bearer ${token || '<token>'}'`,
  ];
  if (body) {
    parts.push(`  -H 'Content-Type: application/json'`);
    parts.push(`  -d '${JSON.stringify(body)}'`);
  }
  return parts.join(' \\\n');
}
