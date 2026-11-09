# public.score_change_logs

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
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `changed_by` | `text` | não | `'api'::text` |  |  |
| 4 | `operation` | `text` | não |  |  |  |
| 5 | `field_name` | `text` | não | `'total'::text` |  |  |
| 6 | `old_value` | `numeric` | não | `0` |  |  |
| 7 | `new_value` | `numeric` | não | `0` |  |  |
| 8 | `change_value` | `numeric` | não | `0` |  |  |
| 9 | `api_token_id` | `uuid` | sim |  |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| score_change_logs_api_token_id_fkey | FOREIGN KEY | `FOREIGN KEY (api_token_id) REFERENCES api_tokens(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| score_change_logs_operation_check | CHECK | `CHECK (operation = ANY (ARRAY['ADD'::text, 'REM'::text, 'SET'::text]))` |  |  | sim |
| score_change_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| score_change_logs_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_score_change_logs_api_token_id | btree | api_token_id | não | sim |  | `CREATE INDEX idx_score_change_logs_api_token_id ON public.score_change_logs USING btree (api_token_id)` |
| idx_score_change_logs_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_score_change_logs_salesperson_id ON public.score_change_logs USING btree (salesperson_id)` |
| score_change_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX score_change_logs_pkey ON public.score_change_logs USING btree (id)` |


## Policies (RLS)

### `Admins and managers can view score logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated can insert score logs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
