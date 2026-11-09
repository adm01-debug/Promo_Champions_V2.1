# public.v4_callback_dead_letters

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `external_quote_id` | `text` | não |  |  |  |
| 3 | `quote_id` | `uuid` | sim |  |  |  |
| 4 | `event_type` | `text` | não |  |  |  |
| 5 | `payload` | `jsonb` | não |  |  |  |
| 6 | `last_error` | `text` | sim |  |  |  |
| 7 | `attempts` | `integer` | não | `0` |  |  |
| 8 | `next_retry_at` | `timestamp with time zone` | sim |  |  |  |
| 9 | `resolved_at` | `timestamp with time zone` | sim |  |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| v4_callback_dead_letters_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| v4_callback_dead_letters_quote_id_fkey | FOREIGN KEY | `FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_champ_v4_callback_dead_letters_quote_id | btree | quote_id | não | sim |  | `CREATE INDEX idx_champ_v4_callback_dead_letters_quote_id ON public.v4_callback_dead_letters USING btree (quote_id)` |
| idx_v4_dlq_external_quote | btree | external_quote_id | não | sim |  | `CREATE INDEX idx_v4_dlq_external_quote ON public.v4_callback_dead_letters USING btree (external_quote_id)` |
| idx_v4_dlq_pending | btree | next_retry_at | não | sim | `(resolved_at IS NULL)` | `CREATE INDEX idx_v4_dlq_pending ON public.v4_callback_dead_letters USING btree (next_retry_at) WHERE (resolved_at IS NULL)` |
| v4_callback_dead_letters_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX v4_callback_dead_letters_pkey ON public.v4_callback_dead_letters USING btree (id)` |


## Policies (RLS)

### `Admins manage v4 dlq`

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


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
