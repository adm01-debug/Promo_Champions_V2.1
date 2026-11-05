# public.commissions

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | não |  |  |  |
| 3 | `salesperson_id` | `uuid` | não |  |  |  |
| 4 | `rule_id` | `uuid` | sim |  |  |  |
| 5 | `base_amount` | `numeric(12,2)` | não |  |  |  |
| 6 | `percentage` | `numeric(5,2)` | não |  |  |  |
| 7 | `commission_amount` | `numeric(12,2)` | não |  |  |  |
| 8 | `status` | `text` | não | `'pending'::text` |  |  |
| 9 | `approved_at` | `timestamp with time zone` | sim |  |  |  |
| 10 | `approved_by` | `uuid` | sim |  |  |  |
| 11 | `paid_at` | `timestamp with time zone` | sim |  |  |  |
| 12 | `paid_by` | `uuid` | sim |  |  |  |
| 13 | `payment_notes` | `text` | sim |  |  |  |
| 14 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 15 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 16 | `sdr_commission_amount` | `numeric` | sim | `0` |  |  |
| 17 | `is_first_sale` | `boolean` | sim | `false` |  |  |


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

_nenhum_
