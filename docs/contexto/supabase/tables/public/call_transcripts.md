# public.call_transcripts

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
| 2 | `recording_id` | `uuid` | não |  |  |  |
| 3 | `full_text` | `text` | não |  |  |  |
| 4 | `segments` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 5 | `language` | `text` | sim | `'pt-BR'::text` |  |  |
| 6 | `word_count` | `integer` | sim | `0` |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `ai_live_insights` | `jsonb` | sim | `'[]'::jsonb` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_transcripts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_transcripts_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_transcripts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_transcripts_pkey ON public.call_transcripts USING btree (id)` |
| idx_call_transcripts_recording | btree | recording_id | não | sim |  | `CREATE INDEX idx_call_transcripts_recording ON public.call_transcripts USING btree (recording_id)` |


## Policies (RLS)

### `System inserts transcripts`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM call_recordings r   WHERE ((r.id = call_transcripts.recording_id) AND ((r.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |

### `View transcripts via recording access`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM call_recordings r   WHERE ((r.id = call_transcripts.recording_id) AND ((r.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
