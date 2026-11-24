# public.race_unlocks

> Tabela public.race_unlocks. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, unlock_key text NOT NULL, unlocked_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.race_unlocks. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `user_id` | `uuid` | não |  |  | Coluna user_id da tabela public.race_unlocks. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `unlock_key` | `text` | não |  |  | Coluna unlock_key da tabela public.race_unlocks. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `unlocked_at` | `timestamp with time zone` | não | `now()` |  | Coluna unlocked_at da tabela public.race_unlocks. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_unlocks_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| race_unlocks_user_key_unique | UNIQUE | `UNIQUE (user_id, unlock_key)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_race_unlocks_user | btree | user_id | não | sim |  | `CREATE INDEX idx_race_unlocks_user ON public.race_unlocks USING btree (user_id)` |
| race_unlocks_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_unlocks_pkey ON public.race_unlocks USING btree (id)` |
| race_unlocks_user_key_unique | btree | user_id, unlock_key | sim | sim |  | `CREATE UNIQUE INDEX race_unlocks_user_key_unique ON public.race_unlocks USING btree (user_id, unlock_key)` |


## Policies (RLS)

### `Users insert own unlocks`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() = user_id)` |

### `Users view own unlocks`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
