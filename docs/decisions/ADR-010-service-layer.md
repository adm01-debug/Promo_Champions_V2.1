# ADR-010: Camada de dados — hooks, services e lib

**Data:** 2026-10-01
**Status:** Aceito
**Origem:** Pacote de auditoria [DATALAYER] — fechamento da camada de dados

## Contexto

Antes desta decisão, componentes e páginas chamavam `supabase.from()` /
`supabase.rpc()` diretamente — medição inicial: **152 arquivos** com acesso
direto ao client fora de `src/hooks`, `src/services` e `src/lib`. Isso
espalhava três problemas:

- **Duplicação de queries**: o mesmo `select`/`rpc` reimplementado em várias
  páginas (ex.: `client_portfolio` lido em kanban, dashboard e relatórios).
- **Sem invalidação consistente**: mutações diretas não invalidavam as query
  keys do TanStack Query — a UI ficava com dados obsoletos.
- **Sem enforcement**: nada impedia o padrão de crescer de volta depois de
  uma limpeza pontual.

O codebase já tinha a convenção nascente (hooks por domínio em
`src/hooks/<dominio>/`, services em `src/services/`), mas sem regra
documentada nem guarda.

## Decisão

Regra única: **`supabase.from()` / `supabase.rpc()` só pode ser chamado em
`src/hooks/`, `src/services/`, `src/lib/` e `src/integrations/`**.
Componentes (`src/components/`) e páginas (`src/pages/`) nunca tocam o
client diretamente.

### O que vai onde

| Camada | Responsabilidade | Exemplo real |
| ------ | ---------------- | ------------ |
| `src/hooks/<dominio>/` | Query/mutation TanStack Query consumida por React: queryKey, staleTime, invalidações, `enabled`, estado de loading | `hooks/crm/useClientKanban.ts`, `hooks/admin/useConnectionMetrics.ts`, `hooks/reports/useMonthlySalesBenchmark.ts` |
| `src/services/` | Operações não-React ou multi-etapa: importação em lote, merge, export, side-effects sem queryKey | `services/clientService.ts` (`importClients`, `mergeClients`), `services/callFeedbackService.ts`, `services/knownDeviceService.ts` |
| `src/lib/` | Utilitários puros e o próprio client wrapper: sem estado, sem efeito colateral, testável isolado | `lib/money.ts` (`formatBRL`), `lib/usageAnalytics.ts`, `lib/markupHelpers.ts` |
| `src/integrations/supabase/` | Client singleton + tipos gerados — único lugar que instancia `createClient` | `integrations/supabase/client.ts` |

Regra prática para escolher entre hook e service: se o resultado alimenta a
UI e precisa de cache/refetch, é **hook** (TanStack Query). Se é uma ação
disparada por evento (submit, import, merge) sem leitura reativa, é
**service**. Se não toca Supabase, é **lib**.

### Convenções dos hooks

- Query key sempre array com prefixo de domínio: `['client-kanban']`,
  `['admin', 'cron-alert-metrics']`.
- Mutações invalidam as keys relacionadas (ex.: `useUpdateKanbanStatus`
  invalida `['client-kanban']` e `['client_portfolio']`).
- RPCs não tipados ficam com `as never` e comentário explícito, nunca cast
  silencioso.

### Enforcement — `scripts/check-data-layer.mjs`

Script ratchet (`npm run check:data-layer`) que:

- Varre `src/**/*.{ts,tsx}` e reprova qualquer `supabase.from(`/`supabase.rpc(`
  fora de `src/hooks|src/services|src/lib|src/integrations` e de testes.
- Mantém baseline em `scripts/baselines/data-layer.txt` (132 arquivos
  legados — **novos arquivos nunca entram**; a lista só diminui).
- Exceção por linha: comentário `// data-layer-ok <motivo>` para casos
  genuinamente inevitáveis.
- `--update-baseline` regenera a lista quando legados são migrados.

Estado atual: **18 arquivos migrados** para hooks/services neste pacote;
**132 permanecem em baseline** (queries complexas — joins embutidos, lógica
condicional, multi-query — migrá-las exige refatoração comportamental que
fica para trabalho futuro dedicado).

## Consequências

**Positivas:**

- Todo `supabase.from` novo em componente quebra o ratchet no CI/local —
  a convenção não depende mais de revisão humana.
- Invalidação de cache centralizada: mutações via hooks invalidam as keys
  certas automaticamente.
- Services reutilizáveis de qualquer camada (hooks, scripts, functions
  wrapper) sem acoplar a React.

**Custo / pendências:**

- 132 arquivos na baseline ainda contêm lógica de dados em componente;
  a dívida é explícita (lista) mas não resolvida. Migração incremental:
  ao tocar um arquivo da baseline para qualquer outro motivo, migrar a
  query junto e remover da baseline.
- RPCs não tipados (`as never`) permanecem — melhorar os tipos gerados do
  `supabase gen types` cobriria isso.
- `data-layer-ok` é uma válvula de escape que pode ser abusada — revisar
  em code review quando aparecer.
