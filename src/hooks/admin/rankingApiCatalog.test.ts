/**
 * CONTRATO-RANKING-API — o playground só serve se listar as rotas que existem.
 *
 * O catálogo de `rankingApiCatalog.ts` é escrito à mão; este teste lê o handler
 * Deno e compara rota + método dos dois lados, para que nenhuma rota nova fique
 * de fora da UI e nenhuma rota removida continue aparecendo como disponível.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RANKING_API_ROUTES,
  buildRequestBody,
  buildRoutePath,
  buildRequestUrl,
  missingPathParams,
} from './rankingApiCatalog';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');
const HANDLER = path.join(REPO_ROOT, 'supabase/functions/ranking-api/index.ts');

/** Extrai `{ method, path }` de cada `req.method === "X" && route === "y"` do handler. */
function handlerRoutes(): string[] {
  const source = fs.readFileSync(HANDLER, 'utf8');
  const found: string[] = [];
  const exact = /req\.method === "(GET|POST|PUT|PATCH|DELETE)" && route === "([^"]+)"/g;
  for (const match of source.matchAll(exact)) found.push(`${match[1]} ${match[2]}`);
  const prefix =
    /req\.method === "(GET|POST|PUT|PATCH|DELETE)" && route\.startsWith\("([^"]+)"\)/g;
  for (const match of source.matchAll(prefix)) found.push(`${match[1]} ${match[2]}*`);
  return found.sort();
}

const catalogRoutes = () =>
  RANKING_API_ROUTES.map(route => `${route.method} ${route.path}`).sort();

describe('catálogo da ranking-api', () => {
  it('cobre exatamente as rotas registradas no handler', () => {
    // `route.startsWith("user/")` cobre a rota parametrizada: no handler o
    // sufixo é lido do path, no catálogo vira `{userId}`.
    // A rota parametrizada da lista de usuários aparece como `GET user/*` no
    // handler e como `GET user/{userId}` no catálogo; o resto tem de bater literal.
    const fromHandler = handlerRoutes().map(key =>
      key.endsWith('/*') ? key.slice(0, -1) + '{userId}' : key
    );
    const fromCatalog = catalogRoutes();
    expect(fromCatalog).toEqual(fromHandler);
  });

  it('marca como exclusiva de time toda rota que devolve 400 sem team_id', () => {
    const guarded = RANKING_API_ROUTES.filter(route =>
      ['team', 'team/users', 'team/logs', 'team/addfields'].includes(route.path)
    );
    expect(guarded.map(route => route.path).sort()).toEqual([
      'team',
      'team/addfields',
      'team/logs',
      'team/users',
    ]);
    guarded.forEach(route => expect(route.requiresTeam).toBe(true));
  });
});

describe('montagem da requisição', () => {
  const routeWithParam = RANKING_API_ROUTES.find(route =>
    route.path.includes('{userId}')
  )!;

  it('preenche {param} e acusa o que ficou vazio', () => {
    expect(buildRoutePath(routeWithParam, { userId: 'abc' })).toBe(
      routeWithParam.path.replace('{userId}', 'abc')
    );
    expect(missingPathParams(routeWithParam, { userId: '  ' })).toEqual([
      'ID do vendedor',
    ]);
    expect(missingPathParams(routeWithParam, { userId: 'abc' })).toEqual([]);
  });

  it('converte números e booleanos do formulário para o JSON da API', () => {
    const edit = RANKING_API_ROUTES.find(r => r.path === 'team/user/edit/total')!;
    const body = buildRequestBody(edit, {
      email: 'a@b.com',
      type: 'ADD',
      value: '10',
      set_value: 'false',
    });
    expect(body).toEqual({ email: 'a@b.com', type: 'ADD', value: 10, set_value: false });
    expect(buildRequestBody(edit, { email: 'a@b.com', value: '7' })).toEqual({
      email: 'a@b.com',
      value: 7,
    });
  });

  it('monta a URL da function a partir da origem do projeto', () => {
    expect(buildRequestUrl('https://x.supabase.co/', 'GET', 'users')).toBe(
      'https://x.supabase.co/functions/v1/ranking-api/v2/users'
    );
  });
});
