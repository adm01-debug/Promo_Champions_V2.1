# public.call_question_analysis

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
| 3 | `total_questions` | `integer` | não | `0` |  |  |
| 4 | `open_questions` | `integer` | não | `0` |  |  |
| 5 | `closed_questions` | `integer` | não | `0` |  |  |
| 6 | `discovery_questions` | `integer` | não | `0` |  |  |
| 7 | `impact_questions` | `integer` | não | `0` |  |  |
| 8 | `leading_questions` | `integer` | não | `0` |  |  |
| 9 | `avg_depth` | `numeric` | não | `0` |  |  |
| 10 | `question_density` | `numeric` | não | `0` |  |  |
| 11 | `quality_score` | `numeric` | não | `0` |  |  |
| 12 | `health` | `text` | não | `'fair'::text` |  |  |
| 13 | `factors` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 14 | `calculated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_question_analysis_health_check | CHECK | `CHECK (health = ANY (ARRAY['poor'::text, 'fair'::text, 'good'::text, 'excellent'::text]))` |  |  | sim |
| call_question_analysis_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_question_analysis_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| call_question_analysis_recording_id_key | UNIQUE | `UNIQUE (recording_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_question_analysis_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_question_analysis_pkey ON public.call_question_analysis USING btree (id)` |
| call_question_analysis_recording_id_key | btree | recording_id | sim | sim |  | `CREATE UNIQUE INDEX call_question_analysis_recording_id_key ON public.call_question_analysis USING btree (recording_id)` |
| idx_call_question_analysis_health | btree | health, calculated_at | não | sim |  | `CREATE INDEX idx_call_question_analysis_health ON public.call_question_analysis USING btree (health, calculated_at DESC)` |
| idx_call_question_analysis_recording | btree | recording_id | não | sim |  | `CREATE INDEX idx_call_question_analysis_recording ON public.call_question_analysis USING btree (recording_id)` |


## Policies (RLS)

### `auth read question analysis`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `managers write question analysis`

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
