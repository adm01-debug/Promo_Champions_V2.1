# public.call_coaching_scorecards

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
| usada por views | public.coaching_impact_metrics |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `recording_id` | `uuid` | não |  |  |  |
| 3 | `salesperson_id` | `uuid` | sim |  |  |  |
| 4 | `overall_score` | `numeric` | não | `0` |  |  |
| 5 | `talk_score` | `numeric` | não | `0` |  |  |
| 6 | `question_score` | `numeric` | não | `0` |  |  |
| 7 | `objection_score` | `numeric` | não | `0` |  |  |
| 8 | `sentiment_score` | `numeric` | não | `0` |  |  |
| 9 | `moments_score` | `numeric` | não | `0` |  |  |
| 10 | `health` | `text` | não | `'fair'::text` |  |  |
| 11 | `top_strengths` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 12 | `top_gaps` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 13 | `recommendations` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 14 | `factors` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 15 | `calculated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_coaching_scorecards_health_check | CHECK | `CHECK (health = ANY (ARRAY['poor'::text, 'fair'::text, 'good'::text, 'excellent'::text]))` |  |  | sim |
| call_coaching_scorecards_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_coaching_scorecards_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| call_coaching_scorecards_recording_id_key | UNIQUE | `UNIQUE (recording_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_coaching_scorecards_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_coaching_scorecards_pkey ON public.call_coaching_scorecards USING btree (id)` |
| call_coaching_scorecards_recording_id_key | btree | recording_id | sim | sim |  | `CREATE UNIQUE INDEX call_coaching_scorecards_recording_id_key ON public.call_coaching_scorecards USING btree (recording_id)` |
| idx_ccs_recording | btree | recording_id | não | sim |  | `CREATE INDEX idx_ccs_recording ON public.call_coaching_scorecards USING btree (recording_id)` |
| idx_ccs_salesperson | btree | salesperson_id, calculated_at | não | sim |  | `CREATE INDEX idx_ccs_salesperson ON public.call_coaching_scorecards USING btree (salesperson_id, calculated_at DESC)` |


## Policies (RLS)

### `ccs_read_authenticated`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `ccs_write_admin_manager`

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
