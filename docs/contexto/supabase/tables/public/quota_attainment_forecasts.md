# public.quota_attainment_forecasts

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
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `period_start` | `date` | não |  |  |  |
| 4 | `period_end` | `date` | não |  |  |  |
| 5 | `quota` | `numeric` | não | `0` |  |  |
| 6 | `closed` | `numeric` | não | `0` |  |  |
| 7 | `weighted_open` | `numeric` | não | `0` |  |  |
| 8 | `pace_per_day` | `numeric` | não | `0` |  |  |
| 9 | `days_remaining` | `integer` | não | `0` |  |  |
| 10 | `p10` | `numeric` | não | `0` |  |  |
| 11 | `p50` | `numeric` | não | `0` |  |  |
| 12 | `p90` | `numeric` | não | `0` |  |  |
| 13 | `attainment_probability` | `numeric` | não | `0` |  |  |
| 14 | `risk_level` | `text` | não | `'on_track'::text` |  |  |
| 15 | `simulations` | `integer` | não | `1000` |  |  |
| 16 | `computed_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| quota_attainment_forecasts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| quota_attainment_forecasts_risk_level_check | CHECK | `CHECK (risk_level = ANY (ARRAY['safe'::text, 'on_track'::text, 'at_risk'::text, 'critical'::text]))` |  |  | sim |
| quota_attainment_forecasts_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| quota_forecasts_unique_period | UNIQUE | `UNIQUE (salesperson_id, period_start)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.quota_attainment_actions | quota_attainment_actions_forecast_id_fkey | forecast_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_quota_forecasts_computed | btree | computed_at | não | sim |  | `CREATE INDEX idx_quota_forecasts_computed ON public.quota_attainment_forecasts USING btree (computed_at DESC)` |
| idx_quota_forecasts_risk | btree | risk_level | não | sim |  | `CREATE INDEX idx_quota_forecasts_risk ON public.quota_attainment_forecasts USING btree (risk_level)` |
| idx_quota_forecasts_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_quota_forecasts_salesperson ON public.quota_attainment_forecasts USING btree (salesperson_id)` |
| quota_attainment_forecasts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX quota_attainment_forecasts_pkey ON public.quota_attainment_forecasts USING btree (id)` |
| quota_forecasts_unique_period | btree | salesperson_id, period_start | sim | sim |  | `CREATE UNIQUE INDEX quota_forecasts_unique_period ON public.quota_attainment_forecasts USING btree (salesperson_id, period_start)` |


## Policies (RLS)

### `Admins/managers manage quota forecasts`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated can view quota forecasts`

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
