# public.user_2fa_log

> Tabela public.user_2fa_log. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT uuid_generate_v4(), user_id uuid NOT NULL, success boolean NOT NULL, ip_address inet NULLABLE, user_agent text NULLABLE, created_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: user_id → auth.users(id).

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
| 1 | `id` | `uuid` | não | `uuid_generate_v4()` |  | Coluna id da tabela public.user_2fa_log. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: uuid_generate_v4(). |
| 2 | `user_id` | `uuid` | não |  |  | Coluna user_id da tabela public.user_2fa_log. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: auth.users(id). |
| 3 | `success` | `boolean` | não |  |  | Coluna success da tabela public.user_2fa_log. Tipo PostgreSQL: boolean. Não aceita NULL. |
| 4 | `ip_address` | `inet` | sim |  |  | Coluna ip_address da tabela public.user_2fa_log. Tipo PostgreSQL: inet. Aceita NULL. |
| 5 | `user_agent` | `text` | sim |  |  | Coluna user_agent da tabela public.user_2fa_log. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.user_2fa_log. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| user_2fa_log_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| user_2fa_log_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_2fa_log_created | btree | created_at | não | sim |  | `CREATE INDEX idx_2fa_log_created ON public.user_2fa_log USING btree (created_at DESC)` |
| idx_2fa_log_user | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_2fa_log_user ON public.user_2fa_log USING btree (user_id, created_at DESC)` |
| user_2fa_log_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX user_2fa_log_pkey ON public.user_2fa_log USING btree (id)` |


## Policies (RLS)

### `Users can read their own 2FA log`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((auth.uid() = user_id) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
