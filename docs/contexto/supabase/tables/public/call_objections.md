# public.call_objections

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
| 3 | `client_turn_index` | `integer` | não | `0` |  |  |
| 4 | `objection_text` | `text` | não |  |  |  |
| 5 | `objection_type` | `text` | não | `'other'::text` |  |  |
| 6 | `seller_response_text` | `text` | sim |  |  |  |
| 7 | `response_quality` | `text` | não | `'ignored'::text` |  |  |
| 8 | `resolution_status` | `text` | não | `'unresolved'::text` |  |  |
| 9 | `start_estimate` | `numeric` | não | `0` |  |  |
| 10 | `factors` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_objections_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_objections_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_objections_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_objections_pkey ON public.call_objections USING btree (id)` |
| idx_call_objections_recording | btree | recording_id | não | sim |  | `CREATE INDEX idx_call_objections_recording ON public.call_objections USING btree (recording_id)` |
| idx_call_objections_type | btree | objection_type | não | sim |  | `CREATE INDEX idx_call_objections_type ON public.call_objections USING btree (objection_type)` |


## Policies (RLS)

### `Admin/manager write call objections`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated read call objections`

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

_nenhum_
