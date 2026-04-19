
Todos os 4 bugs do relatório (B1, B2, B3, B5) já foram resolvidos na rodada anterior. O relatório atual em `docs/reports/race-arena-test-report.md` já marca o módulo Race Arena como **10/10 — production-ready, zero defeitos abertos**.

Para continuar a busca por perfeição, proponho uma **segunda rodada de hardening** focada em pontos que não estavam no escopo original mas elevam o módulo acima do 10/10 atual.

## Plano: Race Arena Hardening Round 2

**Melhoria 1 — Garantir temporada SDR ativa**
- Hoje só existe temporada Closer ativa; SDRs veem empty state.
- Criar temporada SDR default ("Temporada de Estreia SDR 🎯") via insert, com regras de scoring (`leads_qualified`, `meetings_booked`, `connect_rate`, `routine_compliance`).

**Melhoria 2 — Índice único parcial em `race_seasons`**
- Migration adicionando `UNIQUE (role_type) WHERE is_active = true` para impedir, no nível do banco, duas temporadas ativas do mesmo role (hoje só validado em código).

**Melhoria 3 — Rate limiting na `race-commentary`**
- Adicionar cache em memória (Map com TTL 60s por `seasonId+context`) para evitar chamadas redundantes ao gateway de IA quando múltiplos clientes (TV + closer + admin) pedem narração simultaneamente.

**Melhoria 4 — Telemetria de eventos órfãos**
- Query de auditoria semanal: `race_events` sem `race_car` correspondente ou com `season_id` de temporada já encerrada → registrar em `race_audit_log` para o admin revisar.

**Melhoria 5 — Acessibilidade do CarPresetCard**
- Adicionar `role="radio"` + `aria-checked` ao grid de presets (hoje usa `aria-pressed` que é semanticamente para toggle, não para seleção exclusiva). Wrapper recebe `role="radiogroup"`.

**Melhoria 6 — Atualizar relatório**
- Marcar as 5 melhorias como aplicadas e registrar status final **"10/10 + Hardening Round 2"**.

## Entregáveis
- 1 insert (temporada SDR + regras)
- 1 migration (índice único parcial)
- 2 arquivos editados (`race-commentary/index.ts`, `CarPresetCard.tsx` + container)
- 1 query de auditoria documentada
- Relatório atualizado

Execução sequencial, autônoma, sem pausas, após aprovação.
