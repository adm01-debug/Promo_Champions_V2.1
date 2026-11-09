# public.objection_library

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
| 2 | `objection_type` | `text` | não |  |  |  |
| 3 | `pattern_text` | `text` | não |  |  |  |
| 4 | `frequency_count` | `integer` | não | `1` |  |  |
| 5 | `best_response_text` | `text` | sim |  |  |  |
| 6 | `best_response_recording_id` | `uuid` | sim |  |  |  |
| 7 | `last_seen_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| objection_library_best_response_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (best_response_recording_id) REFERENCES call_recordings(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| objection_library_objection_type_pattern_text_key | UNIQUE | `UNIQUE (objection_type, pattern_text)` |  |  | sim |
| objection_library_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_objection_library_best_response_recording_id | btree | best_response_recording_id | não | sim |  | `CREATE INDEX idx_objection_library_best_response_recording_id ON public.objection_library USING btree (best_response_recording_id)` |
| idx_objection_library_type_seen | btree | objection_type, last_seen_at | não | sim |  | `CREATE INDEX idx_objection_library_type_seen ON public.objection_library USING btree (objection_type, last_seen_at DESC)` |
| objection_library_objection_type_pattern_text_key | btree | objection_type, pattern_text | sim | sim |  | `CREATE UNIQUE INDEX objection_library_objection_type_pattern_text_key ON public.objection_library USING btree (objection_type, pattern_text)` |
| objection_library_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX objection_library_pkey ON public.objection_library USING btree (id)` |


## Policies (RLS)

### `Admin/manager write objection library`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated read objection library`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
