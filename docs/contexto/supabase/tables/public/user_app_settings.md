# public.user_app_settings

> Tabela public.user_app_settings. Estrutura registrada no catálogo do PostgreSQL: user_id uuid NOT NULL, key text NOT NULL, value jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: user_id → auth.users(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `user_id` | `uuid` | não |  |  | Coluna user_id da tabela public.user_app_settings. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Referência FK: auth.users(id). |
| 2 | `key` | `text` | não |  |  | Coluna key da tabela public.user_app_settings. Tipo PostgreSQL: text. Participa da chave primária. Não aceita NULL. |
| 3 | `value` | `jsonb` | não | `'{}'::jsonb` |  | Coluna value da tabela public.user_app_settings. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 4 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.user_app_settings. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 5 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.user_app_settings. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| user_app_settings_pkey | PRIMARY KEY | `PRIMARY KEY (user_id, key)` |  |  | sim |
| user_app_settings_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_user_app_settings_user_key | btree | user_id, key | não | sim |  | `CREATE INDEX idx_user_app_settings_user_key ON public.user_app_settings USING btree (user_id, key)` |
| user_app_settings_pkey | btree | user_id, key | sim | sim |  | `CREATE UNIQUE INDEX user_app_settings_pkey ON public.user_app_settings USING btree (user_id, key)` |


## Policies (RLS)

### `users delete own app settings`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `users insert own app settings`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() = user_id)` |

### `users select own app settings`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `users update own app settings`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK | `(auth.uid() = user_id)` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| user_app_settings_touch_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
