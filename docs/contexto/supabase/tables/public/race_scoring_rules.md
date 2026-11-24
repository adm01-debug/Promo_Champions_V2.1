# public.race_scoring_rules

> Tabela public.race_scoring_rules. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), season_id uuid NOT NULL, metric_code text NOT NULL, weight numeric NOT NULL DEFAULT 1.0, points_per_unit numeric NOT NULL DEFAULT 1.0, label text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), month date NULLABLE DEFAULT (date_trunc('month'::text, (now() AT TIME ZONE 'America/Sao_Paulo'::text)))::date. Relacionamentos FK: season_id → public.race_seasons(id).

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
| usada por views | public.race_leaderboard_view |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.race_scoring_rules. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `season_id` | `uuid` | não |  |  | Coluna season_id da tabela public.race_scoring_rules. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.race_seasons(id). |
| 3 | `metric_code` | `text` | não |  |  | Coluna metric_code da tabela public.race_scoring_rules. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (metric_code = ANY (ARRAY['sales_value'::text, 'markup_pct'::text, 'new_clients_activated'::text, 'routine_compliance'::text, 'stakeholders_captured'::text, 'conversations_initiated'::text, 'sales_value_originated'::text])). |
| 4 | `weight` | `numeric` | não | `1.0` |  | Coluna weight da tabela public.race_scoring_rules. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 1.0. Validação CHECK: CHECK (weight >= 0::numeric). |
| 5 | `points_per_unit` | `numeric` | não | `1.0` |  | Coluna points_per_unit da tabela public.race_scoring_rules. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 1.0. |
| 6 | `label` | `text` | sim |  |  | Coluna label da tabela public.race_scoring_rules. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.race_scoring_rules. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 8 | `month` | `date` | sim | `(date_trunc('month'::text, (now() AT TIME ZONE 'America/Sao_Paulo'::text)))::date` |  | Coluna month da tabela public.race_scoring_rules. Tipo PostgreSQL: date. Aceita NULL. Valor padrão: (date_trunc('month'::text, (now() AT TIME ZONE 'America/Sao_Paulo'::text)))::date. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_scoring_rules_metric_code_check | CHECK | `CHECK (metric_code = ANY (ARRAY['sales_value'::text, 'markup_pct'::text, 'new_clients_activated'::text, 'routine_compliance'::text, 'stakeholders_captured'::text, 'conversations_initiated'::text, 'sales_value_originated'::text]))` |  |  | sim |
| race_scoring_rules_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| race_scoring_rules_season_id_fkey | FOREIGN KEY | `FOREIGN KEY (season_id) REFERENCES race_seasons(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| race_scoring_rules_season_id_metric_code_key | UNIQUE | `UNIQUE (season_id, metric_code)` |  |  | sim |
| race_scoring_rules_weight_check | CHECK | `CHECK (weight >= 0::numeric)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_race_scoring_rules_season | btree | season_id | não | sim |  | `CREATE INDEX idx_race_scoring_rules_season ON public.race_scoring_rules USING btree (season_id)` |
| race_scoring_rules_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_scoring_rules_pkey ON public.race_scoring_rules USING btree (id)` |
| race_scoring_rules_season_id_metric_code_key | btree | season_id, metric_code | sim | sim |  | `CREATE UNIQUE INDEX race_scoring_rules_season_id_metric_code_key ON public.race_scoring_rules USING btree (season_id, metric_code)` |


## Policies (RLS)

### `admin_manage_scoring_rules`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `read_scoring_rules_authenticated`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
