# public.call_objection_analysis

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
| 2 | `recording_id` | `uuid` | não |  |  |  |
| 3 | `total_objections` | `integer` | não | `0` |  |  |
| 4 | `resolved_count` | `integer` | não | `0` |  |  |
| 5 | `partially_resolved_count` | `integer` | não | `0` |  |  |
| 6 | `unresolved_count` | `integer` | não | `0` |  |  |
| 7 | `avg_response_time_seconds` | `numeric` | não | `0` |  |  |
| 8 | `handling_score` | `numeric` | não | `0` |  |  |
| 9 | `health` | `text` | não | `'fair'::text` |  |  |
| 10 | `factors` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 11 | `calculated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_objection_analysis_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_objection_analysis_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| call_objection_analysis_recording_id_key | UNIQUE | `UNIQUE (recording_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_objection_analysis_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_objection_analysis_pkey ON public.call_objection_analysis USING btree (id)` |
| call_objection_analysis_recording_id_key | btree | recording_id | sim | sim |  | `CREATE UNIQUE INDEX call_objection_analysis_recording_id_key ON public.call_objection_analysis USING btree (recording_id)` |


## Policies (RLS)

### `Admin/manager write objection analysis`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated read objection analysis`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
