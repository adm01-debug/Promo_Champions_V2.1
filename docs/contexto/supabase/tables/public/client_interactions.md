# public.client_interactions

> Tabela public.client_interactions. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), client_id uuid NULLABLE, user_id uuid NULLABLE, type text NOT NULL, content text NULLABLE, metadata jsonb NULLABLE DEFAULT '{}'::jsonb, created_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: client_id → public.clients(id); user_id → auth.users(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.client_interactions. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `client_id` | `uuid` | sim |  |  | Coluna client_id da tabela public.client_interactions. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.clients(id). |
| 3 | `user_id` | `uuid` | sim |  |  | Coluna user_id da tabela public.client_interactions. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |
| 4 | `type` | `text` | não |  |  | Coluna type da tabela public.client_interactions. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `content` | `text` | sim |  |  | Coluna content da tabela public.client_interactions. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  | Coluna metadata da tabela public.client_interactions. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '{}'::jsonb. |
| 7 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.client_interactions. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| client_interactions_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| client_interactions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| client_interactions_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| client_interactions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX client_interactions_pkey ON public.client_interactions USING btree (id)` |
| idx_client_interactions_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_client_interactions_client_id ON public.client_interactions USING btree (client_id)` |
| idx_client_interactions_user_id | btree | user_id | não | sim |  | `CREATE INDEX idx_client_interactions_user_id ON public.client_interactions USING btree (user_id)` |


## Policies (RLS)

### `Portfolio interactions readable`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (auth.uid() = user_id) OR (client_id IN ( SELECT client_portfolio.client_id    FROM client_portfolio   WHERE (client_portfolio.salesperson_id = get_current_salesperson_id()))))` |
| WITH CHECK |  |

### `Users can insert own interactions`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(auth.uid() = user_id)` |

### `Users can view own interactions`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((auth.uid() = user_id) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
