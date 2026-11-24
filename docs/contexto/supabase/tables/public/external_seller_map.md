# public.external_seller_map

> Tabela public.external_seller_map. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), external_id text NOT NULL, external_source text NOT NULL DEFAULT 'gift_store'::text, salesperson_id uuid NOT NULL, external_name text NULLABLE, external_email text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: salesperson_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.external_seller_map. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `external_id` | `text` | não |  |  | Coluna external_id da tabela public.external_seller_map. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (char_length(external_id) >= 1 AND char_length(external_id) <= 128). |
| 3 | `external_source` | `text` | não | `'gift_store'::text` |  | Coluna external_source da tabela public.external_seller_map. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'gift_store'::text. Validação CHECK: CHECK (external_source = ANY (ARRAY['bitrix24'::text, 'gift_store'::text, 'promogifts'::text, 'n8n'::text, 'manual'::text, 'api'::text])). |
| 4 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.external_seller_map. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 5 | `external_name` | `text` | sim |  |  | Coluna external_name da tabela public.external_seller_map. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `external_email` | `text` | sim |  |  | Coluna external_email da tabela public.external_seller_map. Tipo PostgreSQL: text. Aceita NULL. Validação CHECK: CHECK (external_email IS NULL OR external_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text). |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.external_seller_map. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.external_seller_map. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| chk_external_seller_map_email_format | CHECK | `CHECK (external_email IS NULL OR external_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text)` |  |  | sim |
| chk_external_seller_map_external_id_len | CHECK | `CHECK (char_length(external_id) >= 1 AND char_length(external_id) <= 128)` |  |  | sim |
| chk_external_seller_map_source_allowed | CHECK | `CHECK (external_source = ANY (ARRAY['bitrix24'::text, 'gift_store'::text, 'promogifts'::text, 'n8n'::text, 'manual'::text, 'api'::text]))` |  |  | sim |
| external_seller_map_external_source_external_id_key | UNIQUE | `UNIQUE (external_source, external_id)` |  |  | sim |
| external_seller_map_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| external_seller_map_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| external_seller_map_external_source_external_id_key | btree | external_source, external_id | sim | sim |  | `CREATE UNIQUE INDEX external_seller_map_external_source_external_id_key ON public.external_seller_map USING btree (external_source, external_id)` |
| external_seller_map_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX external_seller_map_pkey ON public.external_seller_map USING btree (id)` |
| idx_champ_external_seller_map_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_champ_external_seller_map_salesperson_id ON public.external_seller_map USING btree (salesperson_id)` |


## Policies (RLS)

### `Admins manage seller map`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Authenticated read seller map`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


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
