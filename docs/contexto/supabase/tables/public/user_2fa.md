# public.user_2fa

> Tabela public.user_2fa. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NULLABLE, secret text NOT NULL, enabled boolean NULLABLE DEFAULT false, backup_codes jsonb NULLABLE DEFAULT '[]'::jsonb, created_at timestamp with time zone NULLABLE DEFAULT now(), updated_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: user_id → auth.users(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.user_2fa. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `user_id` | `uuid` | sim |  |  | Coluna user_id da tabela public.user_2fa. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |
| 3 | `secret` | `text` | não |  |  | Coluna secret da tabela public.user_2fa. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `enabled` | `boolean` | sim | `false` |  | Coluna enabled da tabela public.user_2fa. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: false. |
| 5 | `backup_codes` | `jsonb` | sim | `'[]'::jsonb` |  | Coluna backup_codes da tabela public.user_2fa. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '[]'::jsonb. |
| 6 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.user_2fa. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 7 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Coluna updated_at da tabela public.user_2fa. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| user_2fa_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| user_2fa_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| user_2fa_user_id_key | UNIQUE | `UNIQUE (user_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_user_2fa_enabled | btree | enabled | não | sim |  | `CREATE INDEX idx_user_2fa_enabled ON public.user_2fa USING btree (enabled)` |
| idx_user_2fa_user_id | btree | user_id | não | sim |  | `CREATE INDEX idx_user_2fa_user_id ON public.user_2fa USING btree (user_id)` |
| user_2fa_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX user_2fa_pkey ON public.user_2fa USING btree (id)` |
| user_2fa_user_id_key | btree | user_id | sim | sim |  | `CREATE UNIQUE INDEX user_2fa_user_id_key ON public.user_2fa USING btree (user_id)` |


## Policies (RLS)

### `Users can insert own 2FA settings`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() = user_id)` |

### `Users can update own 2FA settings`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `Users can view own 2FA settings`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| user_2fa_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_2fa_updated_at |


## Grants

| role | privilégios |
|---|---|
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
