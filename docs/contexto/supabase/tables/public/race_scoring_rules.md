# public.race_scoring_rules

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `season_id` | `uuid` | não |  |  |  |
| 3 | `metric_code` | `text` | não |  |  |  |
| 4 | `weight` | `numeric` | não | `1.0` |  |  |
| 5 | `points_per_unit` | `numeric` | não | `1.0` |  |  |
| 6 | `label` | `text` | sim |  |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `month` | `date` | sim | `(date_trunc('month'::text, now()))::date` |  |  |


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
