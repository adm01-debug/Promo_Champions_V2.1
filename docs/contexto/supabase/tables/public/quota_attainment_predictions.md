# public.quota_attainment_predictions

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
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
| 5 | `quota_amount` | `numeric` | não | `0` |  |  |
| 6 | `closed_amount` | `numeric` | não | `0` |  |  |
| 7 | `weighted_pipeline` | `numeric` | não | `0` |  |  |
| 8 | `predicted_amount` | `numeric` | não | `0` |  |  |
| 9 | `attainment_probability` | `numeric` | não | `0` |  |  |
| 10 | `scenario_pessimistic` | `numeric` | não | `0` |  |  |
| 11 | `scenario_realistic` | `numeric` | não | `0` |  |  |
| 12 | `scenario_optimistic` | `numeric` | não | `0` |  |  |
| 13 | `pace_required_per_day` | `numeric` | não | `0` |  |  |
| 14 | `current_pace_per_day` | `numeric` | não | `0` |  |  |
| 15 | `risk_level` | `text` | não | `'on_track'::text` |  |  |
| 16 | `factors` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 17 | `calculated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| quota_attainment_predictions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| quota_attainment_predictions_risk_level_check | CHECK | `CHECK (risk_level = ANY (ARRAY['safe'::text, 'on_track'::text, 'at_risk'::text, 'critical'::text]))` |  |  | sim |
| quota_attainment_predictions_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.quota_attainment_alerts | quota_attainment_alerts_prediction_id_fkey | prediction_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_qap_calculated | btree | calculated_at | não | sim |  | `CREATE INDEX idx_qap_calculated ON public.quota_attainment_predictions USING btree (calculated_at DESC)` |
| idx_qap_salesperson_period | btree | salesperson_id, period_start | não | sim |  | `CREATE INDEX idx_qap_salesperson_period ON public.quota_attainment_predictions USING btree (salesperson_id, period_start DESC)` |
| quota_attainment_predictions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX quota_attainment_predictions_pkey ON public.quota_attainment_predictions USING btree (id)` |


## Policies (RLS)

### `Admin/manager write predictions`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Allow read for all authenticated users`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'authenticated'::text)` |
| WITH CHECK |  |

### `Authenticated read predictions`

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
