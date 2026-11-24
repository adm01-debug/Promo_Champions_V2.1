# public.buying_committee

> Tabela public.buying_committee. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NULLABLE, contact_name text NOT NULL, role text NOT NULL, sentiment text NULLABLE DEFAULT 'neutral'::text, influence_level integer NULLABLE DEFAULT 3, notes text NULLABLE, created_at timestamp with time zone NULLABLE DEFAULT now(), updated_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: sale_id → public.sales(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.buying_committee. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | sim |  |  | Coluna sale_id da tabela public.buying_committee. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sales(id). |
| 3 | `contact_name` | `text` | não |  |  | Coluna contact_name da tabela public.buying_committee. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `role` | `text` | não |  |  | Coluna role da tabela public.buying_committee. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `sentiment` | `text` | sim | `'neutral'::text` |  | Coluna sentiment da tabela public.buying_committee. Tipo PostgreSQL: text. Aceita NULL. Valor padrão: 'neutral'::text. |
| 6 | `influence_level` | `integer` | sim | `3` |  | Coluna influence_level da tabela public.buying_committee. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 3. |
| 7 | `notes` | `text` | sim |  |  | Coluna notes da tabela public.buying_committee. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.buying_committee. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 9 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Coluna updated_at da tabela public.buying_committee. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| buying_committee_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| buying_committee_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| buying_committee_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX buying_committee_pkey ON public.buying_committee USING btree (id)` |
| idx_buying_committee_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_buying_committee_sale_id ON public.buying_committee USING btree (sale_id)` |


## Policies (RLS)

### `Users can manage committee for their sales`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sales   WHERE ((sales.id = buying_committee.sale_id) AND ((sales.salesperson_id = auth.uid()) OR (auth.uid() IN ( SELECT user_roles.user_id            FROM user_roles           WHERE (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role]))))))))` |
| WITH CHECK |  |

### `Users can view committee for their sales`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sales   WHERE ((sales.id = buying_committee.sale_id) AND ((sales.salesperson_id = auth.uid()) OR (auth.uid() IN ( SELECT user_roles.user_id            FROM user_roles           WHERE (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role]))))))))` |
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
