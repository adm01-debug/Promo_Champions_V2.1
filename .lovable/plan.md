
Plano: bateria exaustiva de testes do módulo **Race Arena** (frontend + edge functions + DB + automações), executada em modo default após sua aprovação.

## Escopo (apenas Race Arena)

**Rotas envolvidas**
- `/race-arena` (Hub), `/race-arena/closer`, `/race-arena/sdr`, `/race-arena/tv`, `/admin/race-arena`

**Camadas a testar**
1. **DB & RLS** — tabelas `race_seasons`, `race_cars`, `race_events`, `race_scoring_rules`, `race_audit_log`, `race_badges`, etc. (mapeio via `supabase--read_query` no `information_schema`).
2. **Edge Functions** — `start-race-season`, `process-race-event`, `race-commentary`, e demais funções `race-*` detectadas.
3. **Hooks** (`src/hooks/race/*`) — leitura, mutações, realtime, fallback.
4. **Componentes** (`src/components/race/*`) — render, presets, customizer, leaderboard, HUDs, overlays.
5. **Automações** — triggers de venda → `triggerRaceEvent`, comentários IA, rotação TV, fadiga de sessão.
6. **Admin** — temporadas, regras, garagem, badges, auditoria.

## Metodologia (milhares de asserções)

**A. Testes unitários Vitest** (`src/**/*.test.ts(x)`)
- `raceColors.ts`: validar 27 presets (id único, hex válido `#RRGGBB`, contraste mínimo, `inferPresetFromColors`, `getPresetById` fallback) → ~300 asserções.
- `raceFormatters.ts`: `fmtCurrency`/`fmtCompact` em 200 valores (negativos, zero, milhões, NaN) → ~400.
- Hooks puros (`useSessionDuration`, helpers de score/probabilidade) com fake timers → ~150.
- Componentes-chave (`RaceCar`, `MiniPodium`, `CarPresetCard`, `ScoreBreakdownCard`, `RaceCountdown`, `StartLights`, `CheckeredFlag`) com `@testing-library/react`: snapshot de SVG, props extremas, a11y `aria-label` → ~500.
- Reducers/seletores de leaderboard: ordenação, empates, ghost, overtake → ~200.
- Geradores fuzz (1000 iterações) para `inferPresetFromColors` e ordenação de leaderboard → ~2000 asserções.

**B. Testes Deno de Edge Functions** (`supabase--test_edge_functions`)
- Estender/adicionar testes para: `start-race-season` (payload válido/ inválido / sem auth / role inválido), `process-race-event` (sale_id inexistente, duplicado, idempotência), `race-commentary` (sem season, season ativa, leaderboard vazio).
- Cada função: status code, shape JSON, CORS, latência < limite.

**C. Testes de integração via DB** (`supabase--read_query`)
- Verificar RLS: `race_*` exigem `authenticated`; checar policies via `pg_policies`.
- Integridade: temporadas ativas únicas por `role_type`; `race_events.points >= 0`; FK válidas; `race_cars.car_number BETWEEN 1 AND 99`.
- Contagens sanity: nº de carros por temporada, eventos por dia, audit log preenchido.

**D. Smoke E2E (manual, sem browser tool)**
- Apenas listo checklist para o usuário rodar (rotas, customizer, start season dialog, TV rotation 30s, admin tabs).

## Entregáveis

1. Novos arquivos `*.test.ts(x)` em `src/components/race/__tests__/` e `src/hooks/race/__tests__/`.
2. Novos `*_test.ts` Deno em `supabase/functions/<race-*>/`.
3. Relatório consolidado em `/mnt/documents/race-arena-test-report.md` com:
   - Total de asserções executadas
   - Pass/fail por camada
   - Bugs encontrados + severidade + sugestão de fix
   - Cobertura estimada por arquivo
4. Para cada bug crítico encontrado: descrição + reprodução + recomendação (sem corrigir nesta rodada — listar para sua aprovação).

## Plano de execução (sequencial, autônomo)

1. Mapear superfície (`code--list_dir src/components/race`, `src/hooks/race`, `supabase/functions`, schema DB).
2. Gerar suíte Vitest (lotes de ~10 arquivos por commit lógico).
3. Rodar `vitest` headless; iterar até verde.
4. Gerar suíte Deno para edge functions race-*; rodar `supabase--test_edge_functions`.
5. Rodar consultas de integridade DB e logs (`edge_function_logs` últimos 7d para erros).
6. Compilar relatório final + lista priorizada de defeitos.

## Riscos / limites

- Não vou modificar lógica de produção nesta rodada (apenas testes + relatório). Bugs encontrados viram tarefas separadas.
- "Milhares" de testes vêm de loops fuzz + table-driven, não de milhares de arquivos (para manter manutenibilidade e a regra de ≤400 linhas).
- Sem uso de browser tool (custoso); validação visual via snapshots e checklist.

Aprovar para eu começar?
