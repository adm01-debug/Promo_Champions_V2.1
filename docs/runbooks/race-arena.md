# Race Arena — Runbook Operacional

> **Versão**: Hardening Round 3 · **Última revisão**: 2026-04-19
> **Status do módulo**: 10/10 (production-ready)

Este runbook cobre as operações mais comuns sobre o módulo **Race Arena**
(rotas `/race-arena`, `/race-arena/closer`, `/race-arena/sdr`,
`/race-arena/tv`, `/admin/race-arena`).

---

## 1. Criar uma nova temporada

### 1a. Via Admin UI (recomendado)

1. Acesse `/admin/race-arena` (requer role `admin`).
2. Aba **🏁 Temporadas** → botão **Nova temporada**.
3. Preencha:
   - Nome (ex.: `Temporada de Maio 🏁`)
   - Role (`closer` ou `sdr`)
   - Datas de início/fim
   - Meta (em pontos)
   - Track type (`oval`, `circuit`, `street`)
4. O sistema marca automaticamente a temporada anterior do mesmo role
   como `finished` antes de ativar a nova (validado também no DB pelo
   índice único parcial `race_seasons_one_active_per_role`).

### 1b. Fallback via SQL (uso emergencial)

```sql
-- 1. Encerre a temporada ativa atual do role
UPDATE public.race_seasons
   SET status = 'finished', updated_at = now()
 WHERE role_type = 'closer' AND status = 'active';

-- 2. Insira a nova temporada
INSERT INTO public.race_seasons
  (name, role_type, start_date, end_date, goal_amount, track_type, status)
VALUES
  ('Temporada de Maio 🏁', 'closer', '2026-05-01', '2026-05-31', 100000, 'oval', 'active');
```

> ⚠️ O índice `race_seasons_one_active_per_role` impede duas temporadas
> ativas para o mesmo role — encerre a anterior antes de ativar.

---

## 2. Reprocessar eventos órfãos

A partir do Round 3, o trigger `validate_race_event_trigger` bloqueia a
inserção de eventos órfãos em tempo real. Para auditar inserções
históricas (anteriores ao trigger):

```sql
-- Eventos sem race_car correspondente
SELECT e.id, e.salesperson_id, e.created_at
  FROM public.race_events e
  LEFT JOIN public.race_cars c ON c.salesperson_id = e.salesperson_id
 WHERE c.id IS NULL
 ORDER BY e.created_at DESC
 LIMIT 100;

-- Eventos em temporadas já encerradas
SELECT e.id, e.season_id, s.name, s.status
  FROM public.race_events e
  JOIN public.race_seasons s ON s.id = e.season_id
 WHERE s.status <> 'active'
 ORDER BY e.created_at DESC
 LIMIT 100;
```

Para limpeza:
```sql
DELETE FROM public.race_events e
USING public.race_seasons s
WHERE e.season_id = s.id AND s.status = 'finished'
  AND e.created_at < s.end_date::timestamp - interval '7 days';
```

---

## 3. Invalidar cache da edge function `race-commentary`

A função usa um cache em memória (TTL 60s) por chave `seasonId+context`.
O cache é **per-instance** — invalida automaticamente em:

- Redeploy da função (`supabase functions deploy race-commentary`)
- Cold start (Supabase pode reciclar instâncias após ~15min ociosas)
- TTL natural (60s)

Se precisar **forçar** invalidação imediata:
1. Redeploy via UI: `Connectors → Lovable Cloud → Edge Functions → race-commentary → Redeploy`
2. Ou via CLI: `supabase functions deploy race-commentary --project-ref saejqkojleeaxzrslzfg`

---

## 4. Troubleshooting

### Realtime não atualiza o leaderboard
- Verifique se `sales` e `race_cars` estão na publicação `supabase_realtime`:
  ```sql
  SELECT schemaname, tablename FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime' AND tablename IN ('sales','race_cars','race_events');
  ```
- Confirme RLS: `view_race_events` usa `USING (true)` (público para autenticados).
- Round 3: hooks `useRaceLeaderboard` / `useRaceEvents` deduplicam canais
  por `seasonId` — múltiplas instâncias do hook compartilham 1 canal.

### "Carro não encontrado" ao tentar coletar power-up
- O usuário precisa ter um registro em `race_cars` (uma única linha,
  unique em `salesperson_id`). Crie via `/race-arena/<role>` → "Meu Carro".

### Trigger rejeita inserção de evento
Mensagens possíveis:
- `season % is not active` → o front tentou registrar evento em temporada
  encerrada. Verifique se o `seasonId` em uso vem do hook
  `useRaceSeasonByRole` (que filtra `status = 'active'`).
- `no race_car found for salesperson` → o vendedor não criou seu carro
  ainda. Force o onboarding via `RaceOnboardingChecklist`.

### Performance do leaderboard degradada
- Round 3 adicionou índice composto `race_events_season_salesperson_idx`.
- Confirme uso: `EXPLAIN ANALYZE SELECT ... FROM race_events WHERE season_id = $1`.

---

## 5. Telemetria de TTI

Round 3 instrumenta `useRaceViewTelemetry()` nas 4 rotas principais.
Cada carregamento bem-sucedido gera 1 linha em `page_analytics` com
`page_title = 'race_view_loaded:<route>'`. Query útil:

```sql
SELECT route,
       avg(duration_seconds) AS avg_seconds,
       percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_seconds) AS p95_seconds,
       count(*) AS samples
  FROM public.page_analytics
 WHERE page_title LIKE 'race_view_loaded:%'
   AND entered_at >= now() - interval '7 days'
 GROUP BY route
 ORDER BY samples DESC;
```

---

## Referências cruzadas
- Migration Round 3: `supabase/migrations/20260419145449_*.sql`
- Relatório de testes: `docs/reports/race-arena-test-report.md`
- ADR: `docs/decisions/` (Race Arena gamification)
