# public.data_access_log

> Tabela public.data_access_log. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT uuid_generate_v4(), user_id uuid NULLABLE, table_name text NOT NULL, record_id uuid NULLABLE, action text NOT NULL, created_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: user_id → auth.users(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `uuid_generate_v4()` |  | Coluna id da tabela public.data_access_log. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: uuid_generate_v4(). |
| 2 | `user_id` | `uuid` | sim |  |  | Coluna user_id da tabela public.data_access_log. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |
| 3 | `table_name` | `text` | não |  |  | Coluna table_name da tabela public.data_access_log. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `record_id` | `uuid` | sim |  |  | Coluna record_id da tabela public.data_access_log. Tipo PostgreSQL: uuid. Aceita NULL. |
| 5 | `action` | `text` | não |  |  | Coluna action da tabela public.data_access_log. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (action = ANY (ARRAY['SELECT'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])). |
| 6 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.data_access_log. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| data_access_log_action_check | CHECK | `CHECK (action = ANY (ARRAY['SELECT'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text]))` |  |  | sim |
| data_access_log_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| data_access_log_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| data_access_log_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX data_access_log_pkey ON public.data_access_log USING btree (id)` |
| idx_data_access_log_created | btree | created_at | não | sim |  | `CREATE INDEX idx_data_access_log_created ON public.data_access_log USING btree (created_at DESC)` |
| idx_data_access_table | btree | table_name, created_at | não | sim |  | `CREATE INDEX idx_data_access_table ON public.data_access_log USING btree (table_name, created_at)` |
| idx_data_access_user | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_data_access_user ON public.data_access_log USING btree (user_id, created_at)` |


## Policies (RLS)

### `Users can view own data access`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
