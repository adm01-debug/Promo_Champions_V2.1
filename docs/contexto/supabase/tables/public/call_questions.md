# public.call_questions

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
| 3 | `turn_index` | `integer` | não | `0` |  |  |
| 4 | `text` | `text` | não |  |  |  |
| 5 | `category` | `text` | não | `'other'::text` |  |  |
| 6 | `depth` | `integer` | não | `1` |  |  |
| 7 | `start_estimate` | `numeric` | não | `0` |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_questions_category_check | CHECK | `CHECK (category = ANY (ARRAY['open'::text, 'closed'::text, 'discovery'::text, 'impact'::text, 'leading'::text, 'other'::text]))` |  |  | sim |
| call_questions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_questions_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_questions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_questions_pkey ON public.call_questions USING btree (id)` |
| idx_call_questions_category | btree | category | não | sim |  | `CREATE INDEX idx_call_questions_category ON public.call_questions USING btree (category)` |
| idx_call_questions_recording | btree | recording_id | não | sim |  | `CREATE INDEX idx_call_questions_recording ON public.call_questions USING btree (recording_id)` |


## Policies (RLS)

### `auth read questions`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `managers write questions`

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
