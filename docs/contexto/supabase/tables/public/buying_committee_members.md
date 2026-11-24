# public.buying_committee_members

> Tabela public.buying_committee_members. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NOT NULL, contact_name text NOT NULL, contact_email text NULLABLE, job_title text NULLABLE, committee_role text NOT NULL DEFAULT 'user'::text, influence_level integer NOT NULL DEFAULT 3, sentiment text NOT NULL DEFAULT 'neutral'::text, is_single_threaded boolean NULLABLE DEFAULT false, notes text NULLABLE, created_by uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: sale_id → public.sales(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.buying_committee_members. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.buying_committee_members. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 3 | `contact_name` | `text` | não |  |  | Coluna contact_name da tabela public.buying_committee_members. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `contact_email` | `text` | sim |  |  | Coluna contact_email da tabela public.buying_committee_members. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `job_title` | `text` | sim |  |  | Coluna job_title da tabela public.buying_committee_members. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `committee_role` | `text` | não | `'user'::text` |  | Coluna committee_role da tabela public.buying_committee_members. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'user'::text. |
| 7 | `influence_level` | `integer` | não | `3` |  | Coluna influence_level da tabela public.buying_committee_members. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 3. Validação CHECK: CHECK (influence_level >= 1 AND influence_level <= 5). |
| 8 | `sentiment` | `text` | não | `'neutral'::text` |  | Coluna sentiment da tabela public.buying_committee_members. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'neutral'::text. |
| 9 | `is_single_threaded` | `boolean` | sim | `false` |  | Coluna is_single_threaded da tabela public.buying_committee_members. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: false. |
| 10 | `notes` | `text` | sim |  |  | Coluna notes da tabela public.buying_committee_members. Tipo PostgreSQL: text. Aceita NULL. |
| 11 | `created_by` | `uuid` | sim |  |  | Coluna created_by da tabela public.buying_committee_members. Tipo PostgreSQL: uuid. Aceita NULL. |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.buying_committee_members. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.buying_committee_members. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| buying_committee_members_influence_level_check | CHECK | `CHECK (influence_level >= 1 AND influence_level <= 5)` |  |  | sim |
| buying_committee_members_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| buying_committee_members_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| buying_committee_members_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX buying_committee_members_pkey ON public.buying_committee_members USING btree (id)` |
| idx_bcm_sale | btree | sale_id | não | sim |  | `CREATE INDEX idx_bcm_sale ON public.buying_committee_members USING btree (sale_id)` |


## Policies (RLS)

### `bcm_delete`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = buying_committee_members.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |

### `bcm_insert`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = buying_committee_members.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |

### `bcm_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = buying_committee_members.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |

### `bcm_update`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = buying_committee_members.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_bcm_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
