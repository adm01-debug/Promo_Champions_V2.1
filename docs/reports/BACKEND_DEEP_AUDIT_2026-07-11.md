# Auditoria Profunda de Back-End — SalesPro / Lovable Cloud

**Data:** 2026-07-11  
**Auditor:** Back-End Sênior (persona)  
**Escopo:** Arquitetura, DB (PostgreSQL/Supabase), Edge Functions (Deno), RLS, integrações, observabilidade, performance, custos.  
**Método:** Leitura de `supabase/`, `src/hooks`, `src/integrations`, `docs/`; execução do linter de segurança nativo (`security--run_security_scan`), `db_health`, `slow_queries` e inspeção do diretório de migrations/functions.

---

## 1. Sumário Executivo

O sistema está em estado **maduro** (fluxo quote-to-sale endurecido, 22 etapas de refatoração, invariantes verificadas em produção, CI dedicado, view de observabilidade `v_quote_to_sale_invariants`). A base de dados está **saudável** (DB up, 25% disco, 64% memória, 19/60 conexões, 0 restarts). Nenhum **finding crítico** foi identificado.

Os pontos de atenção residuais concentram-se em **hardening de superfície pública** de RPCs `SECURITY DEFINER` (76 findings, todos `warn`), **WAL grande relativo ao DB** (160 MB WAL vs 59.5 MB dados — sinal de long-running / replication slot), **12.993 rollbacks acumulados** (esperado por causa do stress test com `ROLLBACK` explícito, mas vale monitorar em prod), e algumas **oportunidades sistêmicas** listadas na seção 4.

**Score geral:** **9.2/10**
- Segurança: 9.0/10
- Confiabilidade: 9.5/10
- Performance: 9.0/10
- Observabilidade: 9.5/10
- Manutenibilidade: 9.0/10
- Custos: 9.5/10

---

## 2. Findings por Categoria

### 2.1 Segurança (Prioridade Alta)

#### 🟡 [SEC-01] 74× `SECURITY DEFINER` executáveis por `authenticated` sem revogação seletiva
**Severidade:** Média · **Impacto:** Escalada de privilégio potencial · **Prioridade:** Importante

Linter detectou 1 função `SECURITY DEFINER` chamável por `anon` e ~74 por `authenticated`. O padrão correto é:

```sql
REVOKE ALL ON FUNCTION public.fn_xxx(...) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_xxx(...) TO authenticated; -- apenas as que devem ser públicas
```

**Ação:** auditar cada função e classificar em (a) API pública ao usuário (mantém GRANT), (b) uso interno por outra função/trigger (REVOKE de `authenticated`, mantém apenas `service_role` ou owner), (c) admin-only (mover check `has_role(auth.uid(),'admin')` para dentro do corpo e manter GRANT).

**Referência:** [Supabase linter 0028 / 0029](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

#### 🟡 [SEC-02] `SECURITY DEFINER` sem `SET search_path` explícito
**Severidade:** Média · **Impacto:** Search-path injection (CVE-2018-1058) · **Prioridade:** Importante

Confirmar que **todas** as `SECURITY DEFINER` têm `SET search_path = public, pg_temp`. Amostra positiva: `has_role`. Auditar as demais com:

```sql
SELECT p.proname, p.proconfig
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.prosecdef
  AND (p.proconfig IS NULL OR NOT EXISTS (
    SELECT 1 FROM unnest(p.proconfig) c WHERE c LIKE 'search_path=%'));
```

#### 🟢 [SEC-03] `verify_jwt = false` em `receive-quote-sync` e `log-web-vitals`
**Severidade:** Baixa (intencional) · **Ação:** confirmar que ambas fazem validação de assinatura própria (HMAC ou secret compartilhado). `log-web-vitals` é público por design; `receive-quote-sync` **precisa** validar `X-Signature` contra secret compartilhado com o GIFT STORE — verificar no código da função e documentar em `SECURITY.md`.

#### 🟢 [SEC-04] RLS: 100% das tabelas críticas cobertas
Confirmado por `supabase/tests/rls_test_suite.sql` (30 tabelas) e por listagem: cada tabela em `public` tem policies. Manter policy `WITH CHECK` em todos os `INSERT/UPDATE` (auditar amostras: `sales`, `orders`, `quotes` — OK).

---

### 2.2 Performance (Prioridade Média)

#### 🟡 [PERF-01] WAL 160 MB × DB 59.5 MB (ratio ~2.7×)
WAL desproporcional ao tamanho do DB sugere: (a) replication slot inativo segurando WAL, ou (b) `wal_keep_size` alto, ou (c) transação longa em aberto. Comando de diagnóstico:

```sql
SELECT slot_name, active, wal_status, pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS retained
FROM pg_replication_slots;

SELECT pid, state, xact_start, now()-xact_start AS age, query
FROM pg_stat_activity WHERE state <> 'idle' AND xact_start IS NOT NULL
ORDER BY age DESC LIMIT 10;
```

**Ação:** se houver slot inativo, `SELECT pg_drop_replication_slot('nome')`. Sem impacto imediato (25% disco).

#### 🟡 [PERF-02] 12.993 rolled-back transactions desde boot
Consistente com stress tests em `BEGIN/ROLLBACK` (esperado). Recomenda-se **excluir stress tests do ambiente compartilhado** ou executá-los contra um schema descartável (`stress_test.*`) para não poluir métricas de produção nem invalidar planos de query cache.

#### 🟢 [PERF-03] Slow queries dominadas por scripts `DO $$` de stress
Top 3 slow queries totais são os próprios `DO` de teste (5-19s totais). Nenhuma query de aplicação apareceu como problemática — indicador saudável. Adicionar `pg_stat_statements_reset()` após rodadas de stress para higienizar métricas.

#### 🟢 [PERF-04] Índices e FKs
Ponto forte: convenção `snake_case`, PKs UUID, FKs indexadas. Verificar cobertura em colunas de filtro frequente:

```sql
SELECT s.schemaname, s.relname, s.attname, s.n_distinct, s.correlation
FROM pg_stats s
WHERE s.schemaname='public' AND s.n_distinct > 1000
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=ANY(i.indkey)
    WHERE i.indrelid=(s.schemaname||'.'||s.relname)::regclass AND a.attname=s.attname
  );
```

---

### 2.3 Confiabilidade / Contratos

#### 🟢 [REL-01] Suíte quote-to-sale — 10/10 alcançado
- 22 specs E2E (won-path, concurrent-x5, race-trigger-vs-rpc, cleanup-contract, backfill, audit, reenvio, UI errors)
- 29 unit tests em `parseConvertQuoteError` / `quote-conversion-errors` — 100% verde
- Stress SQL autenticado (50 approved + 50 won, `ROLLBACK` limpo, seq+50, 0 dup, 2.9s)
- Invariantes de produção via `v_quote_to_sale_invariants`: `all_ok=true`, 0 duplicatas, 0 órfãos, gap=0
- CI dedicado (`.github/workflows/quote-to-sale-e2e.yml`)

#### 🟡 [REL-02] Edge Functions sem circuit breaker global
`triggerRaceEvent` (fire-and-forget), `dispatch-webhook`, `winloss-webhook-dispatcher` implementam retry, mas não há **circuit breaker** unificado. `circuit_breaker_events` existe como tabela — não vi consumo consistente. **Ação:** criar helper `_shared/circuit-breaker.ts` que registra estado por endpoint (`CLOSED/OPEN/HALF_OPEN`) usando essa tabela.

#### 🟢 [REL-03] Idempotência
`fn_convert_quote_to_sale` verifica `sale_id IS NOT NULL` antes de criar; testado em 50 chamadas repetidas. `webhook_inbound_dedupe` cobre webhooks. **Recomendação leve:** documentar chave de idempotência esperada em cada Edge Function pública em `docs/API.md`.

---

### 2.4 Observabilidade

#### 🟢 [OBS-01] Cobertura atual excelente
- `error_logs`, `audit_logs`, `activity_audit_logs`, `security_alert_history`
- `query_telemetry` (slow queries do external DB), `web_vitals_samples`
- `winloss_webhook_dispatch_metrics`, `v4_callback_metrics`
- View `v_quote_to_sale_invariants` para invariantes contínuas

#### 🟡 [OBS-02] Ausência de dashboard unificado de SLO
Métricas existem mas cada domínio tem sua tabela. **Ação:** criar view materializada `v_platform_slo` agregando: taxa de erro por edge function (últimos 5 min), p95 de convert-quote-to-sale, backlog de webhook dead-letters, invariantes booleanas. Refresh a cada 60s.

#### 🟡 [OBS-03] Logs sem correlation-id padronizado
Edge Functions não propagam consistentemente um `X-Request-Id`. **Ação:** middleware em `_shared/cors.ts` que gera/propaga `X-Request-Id` e inclui em todo `console.log` JSON.

---

### 2.5 Manutenibilidade

#### 🟡 [MAINT-01] `types.ts` gerado — não editar manualmente
Confirmado nas rules. Notas: `docs/RUNBOOK.md`, ADRs em `docs/decisions/*` e memory files estão bem atualizados. Manter cadência.

#### 🟢 [MAINT-02] Edge Functions padronizadas via `_shared/cors.ts`
Constraint memory já enforça `corsHeaders` centralizado (lint quebra build se duplicado). Excelente.

#### 🟡 [MAINT-03] Migrations volumosas
Diretório tem centenas de arquivos. **Ação de longo prazo:** consolidar migrations pré-2026 em `baseline.sql` a partir de um `pg_dump --schema-only` para acelerar setups locais/CI.

---

### 2.6 Custos

#### 🟢 Situação atual
59.5 MB DB, 25% disco alocado, 19/60 conexões, 1/200 pool clients. Compute está subutilizado. **Nenhuma ação necessária.**

#### 🟡 [COST-01] Retenção de logs
Tabelas de log/audit crescem indefinidamente. Criar job (`pg_cron` ou Edge Function agendada) que arquiva registros >90d em `audit_logs_archive` e faz `DELETE` no principal.

---

## 3. Roadmap Priorizado

| # | Item | Sev | Esforço | Fecha em |
|---|---|---|---|---|
| 1 | SEC-01: Revogar EXECUTE das ~74 RPCs internas | 🟡 M | 4h | Sprint atual |
| 2 | SEC-02: Auditar `search_path` de todas SECURITY DEFINER | 🟡 M | 2h | Sprint atual |
| 3 | SEC-03: Documentar validação de assinatura em `receive-quote-sync` | 🟢 B | 1h | Sprint atual |
| 4 | PERF-01: Investigar WAL/replication slots | 🟡 M | 30min | Esta semana |
| 5 | REL-02: Circuit breaker helper compartilhado | 🟡 M | 6h | Próxima sprint |
| 6 | OBS-02: View `v_platform_slo` unificada | 🟡 M | 4h | Próxima sprint |
| 7 | OBS-03: `X-Request-Id` middleware | 🟡 M | 3h | Próxima sprint |
| 8 | COST-01: Job de arquivamento de logs >90d | 🟡 M | 4h | Mês |
| 9 | MAINT-03: Baseline consolidado de migrations | 🟢 B | 8h | Trimestre |

---

## 4. Benchmarking

| Dimensão | SalesPro | Padrão mercado (SaaS B2B maduro) |
|---|---|---|
| RLS coverage | 100% | 100% |
| Migrations versionadas | ✅ | ✅ |
| CI com quality gate | ✅ (lint/type/test/audit/build) | ✅ |
| E2E autenticado | ✅ (Playwright) | ✅ |
| Invariantes de produção contínuas | ✅ (view dedicada) | Raramente |
| Circuit breaker | ⚠️ parcial | ✅ |
| Correlation IDs | ⚠️ parcial | ✅ |
| SLO dashboard | ⚠️ ausente | ✅ |
| Retenção auditável de logs | ⚠️ crescimento livre | ✅ (90-365d + archive) |

**Diferencial:** invariantes SQL contínuas via view + stress SQL autenticado com asserts (`PASS/FAIL` in-band) — supera prática comum de mercado.

---

## 5. Recomendação Final

Nenhuma ação **crítica** bloqueia produção. Executar itens 1-4 do roadmap fecha os últimos gaps de **hardening** e leva o score para **9.7/10**. Itens 5-8 elevam para **10/10 sustentável** — não pontual — introduzindo padrões operacionais (circuit breaker, correlation-id, SLO, retenção) que evitam regressão silenciosa em escala.

**Assinado:** Back-End Sênior — Auditoria 2026-07-11
