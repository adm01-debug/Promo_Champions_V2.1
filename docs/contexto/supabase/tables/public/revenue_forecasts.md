# public.revenue_forecasts

> Tabela public.revenue_forecasts. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), owner_id uuid NULLABLE, period_type text NOT NULL, period_start date NOT NULL, period_end date NOT NULL, commit_amount numeric NOT NULL DEFAULT 0, best_case_amount numeric NOT NULL DEFAULT 0, upside_amount numeric NOT NULL DEFAULT 0, confidence_score integer NOT NULL DEFAULT 0, goal_amount numeric NOT NULL DEFAULT 0, gap_to_goal numeric NOT NULL DEFAULT 0, deals_count integer NOT NULL DEFAULT 0, weighted_pipeline numeric NOT NULL DEFAULT 0, factors jsonb NOT NULL DEFAULT '[]'::jsonb, ai_summary text NULLABLE, model_version text NULLABLE DEFAULT 'gemini-2.5-flash'::text, calculated_at timestamp with time zone NOT NULL DEFAULT now(), created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: owner_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.revenue_forecasts. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `owner_id` | `uuid` | sim |  |  | Coluna owner_id da tabela public.revenue_forecasts. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `period_type` | `text` | não |  |  | Coluna period_type da tabela public.revenue_forecasts. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (period_type = ANY (ARRAY['week'::text, 'month'::text, 'quarter'::text])). |
| 4 | `period_start` | `date` | não |  |  | Coluna period_start da tabela public.revenue_forecasts. Tipo PostgreSQL: date. Não aceita NULL. |
| 5 | `period_end` | `date` | não |  |  | Coluna period_end da tabela public.revenue_forecasts. Tipo PostgreSQL: date. Não aceita NULL. |
| 6 | `commit_amount` | `numeric` | não | `0` |  | Coluna commit_amount da tabela public.revenue_forecasts. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `best_case_amount` | `numeric` | não | `0` |  | Coluna best_case_amount da tabela public.revenue_forecasts. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 8 | `upside_amount` | `numeric` | não | `0` |  | Coluna upside_amount da tabela public.revenue_forecasts. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 9 | `confidence_score` | `integer` | não | `0` |  | Coluna confidence_score da tabela public.revenue_forecasts. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. Validação CHECK: CHECK (confidence_score >= 0 AND confidence_score <= 100). |
| 10 | `goal_amount` | `numeric` | não | `0` |  | Coluna goal_amount da tabela public.revenue_forecasts. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 11 | `gap_to_goal` | `numeric` | não | `0` |  | Coluna gap_to_goal da tabela public.revenue_forecasts. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 12 | `deals_count` | `integer` | não | `0` |  | Coluna deals_count da tabela public.revenue_forecasts. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 13 | `weighted_pipeline` | `numeric` | não | `0` |  | Coluna weighted_pipeline da tabela public.revenue_forecasts. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 14 | `factors` | `jsonb` | não | `'[]'::jsonb` |  | Coluna factors da tabela public.revenue_forecasts. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 15 | `ai_summary` | `text` | sim |  |  | Coluna ai_summary da tabela public.revenue_forecasts. Tipo PostgreSQL: text. Aceita NULL. |
| 16 | `model_version` | `text` | sim | `'gemini-2.5-flash'::text` |  | Coluna model_version da tabela public.revenue_forecasts. Tipo PostgreSQL: text. Aceita NULL. Valor padrão: 'gemini-2.5-flash'::text. |
| 17 | `calculated_at` | `timestamp with time zone` | não | `now()` |  | Coluna calculated_at da tabela public.revenue_forecasts. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 18 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.revenue_forecasts. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 19 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.revenue_forecasts. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
