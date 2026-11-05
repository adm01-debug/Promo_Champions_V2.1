# public.revenue_forecasts

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `owner_id` | `uuid` | sim |  |  |  |
| 3 | `period_type` | `text` | não |  |  |  |
| 4 | `period_start` | `date` | não |  |  |  |
| 5 | `period_end` | `date` | não |  |  |  |
| 6 | `commit_amount` | `numeric` | não | `0` |  |  |
| 7 | `best_case_amount` | `numeric` | não | `0` |  |  |
| 8 | `upside_amount` | `numeric` | não | `0` |  |  |
| 9 | `confidence_score` | `integer` | não | `0` |  |  |
| 10 | `goal_amount` | `numeric` | não | `0` |  |  |
| 11 | `gap_to_goal` | `numeric` | não | `0` |  |  |
| 12 | `deals_count` | `integer` | não | `0` |  |  |
| 13 | `weighted_pipeline` | `numeric` | não | `0` |  |  |
| 14 | `factors` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 15 | `ai_summary` | `text` | sim |  |  |  |
| 16 | `model_version` | `text` | sim | `'gemini-2.5-flash'::text` |  |  |
| 17 | `calculated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 18 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 19 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| revenue_forecasts_confidence_score_check | CHECK | `CHECK (confidence_score >= 0 AND confidence_score <= 100)` |  |  | sim |
| revenue_forecasts_owner_id_fkey | FOREIGN KEY | `FOREIGN KEY (owner_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| revenue_forecasts_period_type_check | CHECK | `CHECK (period_type = ANY (ARRAY['week'::text, 'month'::text, 'quarter'::text]))` |  |  | sim |
| revenue_forecasts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.forecast_deal_contributions | forecast_deal_contributions_forecast_id_fkey | forecast_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_revenue_forecasts_owner | btree | owner_id | não | sim |  | `CREATE INDEX idx_revenue_forecasts_owner ON public.revenue_forecasts USING btree (owner_id)` |
| idx_revenue_forecasts_period | btree | period_type, period_start | não | sim |  | `CREATE INDEX idx_revenue_forecasts_period ON public.revenue_forecasts USING btree (period_type, period_start DESC)` |
| revenue_forecasts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX revenue_forecasts_pkey ON public.revenue_forecasts USING btree (id)` |
| revenue_forecasts_unique | btree | period_type, period_start | sim | sim |  | `CREATE UNIQUE INDEX revenue_forecasts_unique ON public.revenue_forecasts USING btree (COALESCE(owner_id, '00000000-0000-0000-0000-000000000000'::uuid), period_type, period_start)` |


## Policies (RLS)

### `Managers and admins view all forecasts`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (owner_id = get_current_salesperson_id()))` |
| WITH CHECK |  |

### `System can manage forecasts`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_forecast_cache_invalidate | AFTER | UPDATE | ROW | enabled | public.trg_invalidate_forecast_narrative_cache |
| update_revenue_forecasts_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
