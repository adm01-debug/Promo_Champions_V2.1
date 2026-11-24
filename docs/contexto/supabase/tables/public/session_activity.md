# public.session_activity

> Tabela public.session_activity. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT uuid_generate_v4(), user_id uuid NOT NULL, action text NOT NULL, ip_address inet NULLABLE, user_agent text NULLABLE, metadata jsonb NULLABLE, created_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: user_id → auth.users(id).

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
| 1 | `id` | `uuid` | não | `uuid_generate_v4()` |  | Coluna id da tabela public.session_activity. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: uuid_generate_v4(). |
| 2 | `user_id` | `uuid` | não |  |  | Coluna user_id da tabela public.session_activity. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: auth.users(id). |
| 3 | `action` | `text` | não |  |  | Coluna action da tabela public.session_activity. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `ip_address` | `inet` | sim |  |  | Coluna ip_address da tabela public.session_activity. Tipo PostgreSQL: inet. Aceita NULL. |
| 5 | `user_agent` | `text` | sim |  |  | Coluna user_agent da tabela public.session_activity. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `metadata` | `jsonb` | sim |  |  | Coluna metadata da tabela public.session_activity. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 7 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.session_activity. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| session_activity_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| session_activity_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_session_activity_user | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_session_activity_user ON public.session_activity USING btree (user_id, created_at)` |
| idx_session_activity_user_created | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_session_activity_user_created ON public.session_activity USING btree (user_id, created_at DESC)` |
| session_activity_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX session_activity_pkey ON public.session_activity USING btree (id)` |


## Policies (RLS)

### `Users can view own session activity`

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
