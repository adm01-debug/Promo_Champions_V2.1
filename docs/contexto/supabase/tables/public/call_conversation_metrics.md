# public.call_conversation_metrics

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
| 2 | `recording_id` | `uuid` | não |  |  |  |
| 3 | `seller_talk_ratio` | `numeric` | não | `0` |  |  |
| 4 | `client_talk_ratio` | `numeric` | não | `0` |  |  |
| 5 | `silence_ratio` | `numeric` | não | `0` |  |  |
| 6 | `longest_monologue_seconds` | `integer` | não | `0` |  |  |
| 7 | `interruptions_count` | `integer` | não | `0` |  |  |
| 8 | `seller_words_per_minute` | `integer` | não | `0` |  |  |
| 9 | `client_words_per_minute` | `integer` | não | `0` |  |  |
| 10 | `pace_score` | `numeric` | não | `0` |  |  |
| 11 | `engagement_score` | `numeric` | não | `0` |  |  |
| 12 | `health` | `text` | não | `'fair'::text` |  |  |
| 13 | `factors` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 14 | `calculated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_conversation_metrics_health_check | CHECK | `CHECK (health = ANY (ARRAY['poor'::text, 'fair'::text, 'good'::text, 'excellent'::text]))` |  |  | sim |
| call_conversation_metrics_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_conversation_metrics_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| call_conversation_metrics_recording_id_key | UNIQUE | `UNIQUE (recording_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_conversation_metrics_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_conversation_metrics_pkey ON public.call_conversation_metrics USING btree (id)` |
| call_conversation_metrics_recording_id_key | btree | recording_id | sim | sim |  | `CREATE UNIQUE INDEX call_conversation_metrics_recording_id_key ON public.call_conversation_metrics USING btree (recording_id)` |
| idx_ccm_health_calc | btree | health, calculated_at | não | sim |  | `CREATE INDEX idx_ccm_health_calc ON public.call_conversation_metrics USING btree (health, calculated_at DESC)` |


## Policies (RLS)

### `ccm_select_authenticated`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `ccm_write_admin_manager`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |


## Triggers

_nenhum_


## Grants

_nenhum_
