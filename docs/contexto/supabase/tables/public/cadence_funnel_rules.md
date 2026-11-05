# public.cadence_funnel_rules

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `cadence_id` | `uuid` | sim |  |  |  |
| 3 | `from_stage` | `text` | não |  |  |  |
| 4 | `to_stage` | `text` | não |  |  |  |
| 5 | `condition_type` | `text` | não |  |  |  |
| 6 | `condition_value` | `integer` | sim | `1` |  |  |
| 7 | `is_active` | `boolean` | sim | `true` |  |  |
| 8 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 9 | `updated_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 10 | `time_window_hours` | `integer` | sim | `24` |  |  |
| 11 | `notify_push` | `boolean` | sim | `false` |  |  |
| 12 | `notify_email` | `boolean` | sim | `false` |  |  |
| 13 | `alert_priority` | `text` | sim | `'normal'::text` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cadence_funnel_rules_cadence_id_fkey | FOREIGN KEY | `FOREIGN KEY (cadence_id) REFERENCES cadences(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| cadence_funnel_rules_condition_type_check | CHECK | `CHECK (condition_type = ANY (ARRAY['email_open'::text, 'quote_open'::text, 'price_click'::text, 'reply'::text, 'manual'::text]))` |  |  | sim |
| cadence_funnel_rules_from_stage_check | CHECK | `CHECK (from_stage = ANY (ARRAY['new'::text, 'high_interest'::text, 'waiting_approval'::text, 'scheduled'::text]))` |  |  | sim |
| cadence_funnel_rules_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| cadence_funnel_rules_to_stage_check | CHECK | `CHECK (to_stage = ANY (ARRAY['new'::text, 'high_interest'::text, 'waiting_approval'::text, 'scheduled'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cadence_funnel_rules_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cadence_funnel_rules_pkey ON public.cadence_funnel_rules USING btree (id)` |
| idx_cadence_funnel_rules_cadence_id | btree | cadence_id | não | sim |  | `CREATE INDEX idx_cadence_funnel_rules_cadence_id ON public.cadence_funnel_rules USING btree (cadence_id)` |


## Policies (RLS)

### `Authenticated users can view funnel rules`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Only admins can manage funnel rules`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_cadence_funnel_rules_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
