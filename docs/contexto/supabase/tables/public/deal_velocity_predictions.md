# public.deal_velocity_predictions

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | não |  |  |  |
| 3 | `owner_id` | `uuid` | sim |  |  |  |
| 4 | `predicted_close_date` | `date` | sim |  |  |  |
| 5 | `predicted_days_remaining` | `integer` | sim |  |  |  |
| 6 | `confidence_score` | `integer` | não | `0` |  |  |
| 7 | `confidence_tier` | `text` | não | `'low'::text` |  |  |
| 8 | `velocity_status` | `text` | não | `'on_track'::text` |  |  |
| 9 | `current_stage` | `text` | sim |  |  |  |
| 10 | `days_in_stage` | `integer` | sim |  |  |  |
| 11 | `expected_days_in_stage` | `numeric` | sim |  |  |  |
| 12 | `stage_velocity_ratio` | `numeric` | sim |  |  |  |
| 13 | `factors` | `jsonb` | não | `'{"brakes": [], "drivers": []}'::jsonb` |  |  |
| 14 | `model_version` | `text` | não | `'v1'::text` |  |  |
| 15 | `calculated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 16 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 17 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| deal_velocity_predictions_confidence_score_check | CHECK | `CHECK (confidence_score >= 0 AND confidence_score <= 100)` |  |  | sim |
| deal_velocity_predictions_confidence_tier_check | CHECK | `CHECK (confidence_tier = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))` |  |  | sim |
| deal_velocity_predictions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| deal_velocity_predictions_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| deal_velocity_predictions_sale_id_key | UNIQUE | `UNIQUE (sale_id)` |  |  | sim |
| deal_velocity_predictions_velocity_status_check | CHECK | `CHECK (velocity_status = ANY (ARRAY['ahead'::text, 'on_track'::text, 'slow'::text, 'stalled'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| deal_velocity_predictions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX deal_velocity_predictions_pkey ON public.deal_velocity_predictions USING btree (id)` |
| deal_velocity_predictions_sale_id_key | btree | sale_id | sim | sim |  | `CREATE UNIQUE INDEX deal_velocity_predictions_sale_id_key ON public.deal_velocity_predictions USING btree (sale_id)` |
| idx_dvp_calculated_at | btree | calculated_at | não | sim |  | `CREATE INDEX idx_dvp_calculated_at ON public.deal_velocity_predictions USING btree (calculated_at DESC)` |
| idx_dvp_owner_status | btree | owner_id, velocity_status | não | sim |  | `CREATE INDEX idx_dvp_owner_status ON public.deal_velocity_predictions USING btree (owner_id, velocity_status)` |


## Policies (RLS)

### `dvp_admin_write`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `dvp_select_own_or_admin`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = deal_velocity_predictions.sale_id) AND (sp.auth_user_id = auth.uid())))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_dvp_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
