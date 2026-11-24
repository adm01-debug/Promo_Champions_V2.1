# public.commission_rules

> Tabela public.commission_rules. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, description text NULLABLE, salesperson_id uuid NULLABLE, category text NULLABLE, percentage numeric(5,2) NOT NULL DEFAULT 5.00, min_amount numeric(12,2) NULLABLE DEFAULT 0, max_amount numeric(12,2) NULLABLE, priority integer NOT NULL DEFAULT 0, is_active boolean NOT NULL DEFAULT true, created_by uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: salesperson_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.commission_rules. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `name` | `text` | não |  |  | Coluna name da tabela public.commission_rules. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `description` | `text` | sim |  |  | Coluna description da tabela public.commission_rules. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `salesperson_id` | `uuid` | sim |  |  | Coluna salesperson_id da tabela public.commission_rules. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |
| 5 | `category` | `text` | sim |  |  | Coluna category da tabela public.commission_rules. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `percentage` | `numeric(5,2)` | não | `5.00` |  | Coluna percentage da tabela public.commission_rules. Tipo PostgreSQL: numeric(5,2). Não aceita NULL. Valor padrão: 5.00. Validação CHECK: CHECK (percentage >= 0::numeric AND percentage <= 100::numeric). |
| 7 | `min_amount` | `numeric(12,2)` | sim | `0` |  | Coluna min_amount da tabela public.commission_rules. Tipo PostgreSQL: numeric(12,2). Aceita NULL. Valor padrão: 0. |
| 8 | `max_amount` | `numeric(12,2)` | sim |  |  | Coluna max_amount da tabela public.commission_rules. Tipo PostgreSQL: numeric(12,2). Aceita NULL. |
| 9 | `priority` | `integer` | não | `0` |  | Coluna priority da tabela public.commission_rules. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 10 | `is_active` | `boolean` | não | `true` |  | Coluna is_active da tabela public.commission_rules. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 11 | `created_by` | `uuid` | sim |  |  | Coluna created_by da tabela public.commission_rules. Tipo PostgreSQL: uuid. Aceita NULL. |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.commission_rules. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.commission_rules. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| commission_rules_percentage_check | CHECK | `CHECK (percentage >= 0::numeric AND percentage <= 100::numeric)` |  |  | sim |
| commission_rules_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| commission_rules_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.commissions | commissions_rule_id_fkey | rule_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| commission_rules_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX commission_rules_pkey ON public.commission_rules USING btree (id)` |
| idx_commission_rules_category | btree | category | não | sim | `(is_active = true)` | `CREATE INDEX idx_commission_rules_category ON public.commission_rules USING btree (category) WHERE (is_active = true)` |
| idx_commission_rules_priority | btree | priority | não | sim | `(is_active = true)` | `CREATE INDEX idx_commission_rules_priority ON public.commission_rules USING btree (priority DESC) WHERE (is_active = true)` |
| idx_commission_rules_salesperson | btree | salesperson_id | não | sim | `(is_active = true)` | `CREATE INDEX idx_commission_rules_salesperson ON public.commission_rules USING btree (salesperson_id) WHERE (is_active = true)` |


## Policies (RLS)

### `Admins/Managers manage commission rules`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Salespeople view own rules`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((is_active = true) AND ((salesperson_id = get_current_salesperson_id()) OR (salesperson_id IS NULL)))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_commission_rules_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
