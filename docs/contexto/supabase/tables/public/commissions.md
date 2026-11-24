# public.commissions

> Tabela public.commissions. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NOT NULL, salesperson_id uuid NOT NULL, rule_id uuid NULLABLE, base_amount numeric(12,2) NOT NULL, percentage numeric(5,2) NOT NULL, commission_amount numeric(12,2) NOT NULL, status text NOT NULL DEFAULT 'pending'::text, approved_at timestamp with time zone NULLABLE, approved_by uuid NULLABLE, paid_at timestamp with time zone NULLABLE, paid_by uuid NULLABLE, payment_notes text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), sdr_commission_amount numeric NULLABLE DEFAULT 0, is_first_sale boolean NULLABLE DEFAULT false. Relacionamentos FK: rule_id → public.commission_rules(id); sale_id → public.sales(id); salesperson_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.commissions. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.commissions. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 3 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.commissions. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 4 | `rule_id` | `uuid` | sim |  |  | Coluna rule_id da tabela public.commissions. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.commission_rules(id). |
| 5 | `base_amount` | `numeric(12,2)` | não |  |  | Coluna base_amount da tabela public.commissions. Tipo PostgreSQL: numeric(12,2). Não aceita NULL. |
| 6 | `percentage` | `numeric(5,2)` | não |  |  | Coluna percentage da tabela public.commissions. Tipo PostgreSQL: numeric(5,2). Não aceita NULL. |
| 7 | `commission_amount` | `numeric(12,2)` | não |  |  | Coluna commission_amount da tabela public.commissions. Tipo PostgreSQL: numeric(12,2). Não aceita NULL. |
| 8 | `status` | `text` | não | `'pending'::text` |  | Coluna status da tabela public.commissions. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pending'::text. Validação CHECK: CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'paid'::text, 'cancelled'::text])). |
| 9 | `approved_at` | `timestamp with time zone` | sim |  |  | Coluna approved_at da tabela public.commissions. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 10 | `approved_by` | `uuid` | sim |  |  | Coluna approved_by da tabela public.commissions. Tipo PostgreSQL: uuid. Aceita NULL. |
| 11 | `paid_at` | `timestamp with time zone` | sim |  |  | Coluna paid_at da tabela public.commissions. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 12 | `paid_by` | `uuid` | sim |  |  | Coluna paid_by da tabela public.commissions. Tipo PostgreSQL: uuid. Aceita NULL. |
| 13 | `payment_notes` | `text` | sim |  |  | Coluna payment_notes da tabela public.commissions. Tipo PostgreSQL: text. Aceita NULL. |
| 14 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.commissions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 15 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.commissions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 16 | `sdr_commission_amount` | `numeric` | sim | `0` |  | Coluna sdr_commission_amount da tabela public.commissions. Tipo PostgreSQL: numeric. Aceita NULL. Valor padrão: 0. |
| 17 | `is_first_sale` | `boolean` | sim | `false` |  | Coluna is_first_sale da tabela public.commissions. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: false. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| commissions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| commissions_rule_id_fkey | FOREIGN KEY | `FOREIGN KEY (rule_id) REFERENCES commission_rules(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| commissions_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| commissions_sale_salesperson_key | UNIQUE | `UNIQUE (sale_id, salesperson_id)` |  |  | sim |
| commissions_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| commissions_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'paid'::text, 'cancelled'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| commissions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX commissions_pkey ON public.commissions USING btree (id)` |
| commissions_sale_salesperson_key | btree | sale_id, salesperson_id | sim | sim |  | `CREATE UNIQUE INDEX commissions_sale_salesperson_key ON public.commissions USING btree (sale_id, salesperson_id)` |
| idx_commissions_created | btree | created_at | não | sim |  | `CREATE INDEX idx_commissions_created ON public.commissions USING btree (created_at DESC)` |
| idx_commissions_rule_id | btree | rule_id | não | sim |  | `CREATE INDEX idx_commissions_rule_id ON public.commissions USING btree (rule_id)` |
| idx_commissions_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_commissions_salesperson ON public.commissions USING btree (salesperson_id)` |
| idx_commissions_status | btree | status | não | sim |  | `CREATE INDEX idx_commissions_status ON public.commissions USING btree (status)` |


## Policies (RLS)

### `Admins/Managers manage all commissions`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Salespeople view own commissions`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| audit_business_changes | AFTER | DELETE OR UPDATE | ROW | enabled | public.audit_log_row_change |
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_enforce_status_transition | BEFORE | UPDATE | ROW | enabled | public.enforce_status_transition |
| update_commissions_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
