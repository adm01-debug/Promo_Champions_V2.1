# public.user_2fa_backup_codes

> Tabela public.user_2fa_backup_codes. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT uuid_generate_v4(), user_id uuid NOT NULL, code text NOT NULL, used boolean NULLABLE DEFAULT false, used_at timestamp with time zone NULLABLE, created_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: user_id → auth.users(id).

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
| 1 | `id` | `uuid` | não | `uuid_generate_v4()` |  | Coluna id da tabela public.user_2fa_backup_codes. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: uuid_generate_v4(). |
| 2 | `user_id` | `uuid` | não |  |  | Coluna user_id da tabela public.user_2fa_backup_codes. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: auth.users(id). |
| 3 | `code` | `text` | não |  |  | Coluna code da tabela public.user_2fa_backup_codes. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `used` | `boolean` | sim | `false` |  | Coluna used da tabela public.user_2fa_backup_codes. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: false. |
| 5 | `used_at` | `timestamp with time zone` | sim |  |  | Coluna used_at da tabela public.user_2fa_backup_codes. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 6 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.user_2fa_backup_codes. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| user_2fa_backup_codes_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| user_2fa_backup_codes_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_backup_codes_used | btree | used, user_id | não | sim |  | `CREATE INDEX idx_backup_codes_used ON public.user_2fa_backup_codes USING btree (used, user_id)` |
| idx_backup_codes_user | btree | user_id | não | sim |  | `CREATE INDEX idx_backup_codes_user ON public.user_2fa_backup_codes USING btree (user_id)` |
| user_2fa_backup_codes_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX user_2fa_backup_codes_pkey ON public.user_2fa_backup_codes USING btree (id)` |


## Policies (RLS)

### `Users can update own backup codes`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `Users can view own backup codes`

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
