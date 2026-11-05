# public.suppliers

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
| usada por views | public.v_active_suppliers |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `name` | `text` | não |  |  |  |
| 3 | `contact_name` | `text` | sim |  |  |  |
| 4 | `email` | `text` | sim |  |  |  |
| 5 | `phone` | `text` | sim |  |  |  |
| 6 | `address` | `text` | sim |  |  |  |
| 7 | `city` | `text` | sim |  |  |  |
| 8 | `state` | `text` | sim |  |  |  |
| 9 | `country` | `text` | sim | `'Brasil'::text` |  |  |
| 10 | `cnpj` | `text` | sim |  |  |  |
| 11 | `category` | `text` | sim | `'geral'::text` |  |  |
| 12 | `payment_terms` | `text` | sim | `'30 dias'::text` |  |  |
| 13 | `lead_time_days` | `integer` | sim | `7` |  |  |
| 14 | `reliability_score` | `numeric(3,2)` | sim | `0.85` |  |  |
| 15 | `is_active` | `boolean` | sim | `true` |  |  |
| 16 | `notes` | `text` | sim |  |  |  |
| 17 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 18 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 19 | `deleted_at` | `timestamp with time zone` | sim |  |  | Soft delete: preenchido marca o registro como excluído sem remoção física. |
| 20 | `deleted_by` | `uuid` | sim |  |  |  |
| 21 | `delete_reason` | `text` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| suppliers_deleted_by_fkey | FOREIGN KEY | `FOREIGN KEY (deleted_by) REFERENCES auth.users(id)` | NO ACTION | NO ACTION | sim |
| suppliers_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.price_alerts | price_alerts_supplier_id_fkey | supplier_id | CASCADE |
| public.price_history | price_history_supplier_id_fkey | supplier_id | CASCADE |
| public.supplier_orders | supplier_orders_supplier_id_fkey | supplier_id | CASCADE |
| public.supplier_products | supplier_products_supplier_id_fkey | supplier_id | CASCADE |
| public.supplier_risk_assessments | supplier_risk_assessments_supplier_id_fkey | supplier_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_suppliers_active | btree | id | não | sim | `(deleted_at IS NULL)` | `CREATE INDEX idx_suppliers_active ON public.suppliers USING btree (id) WHERE (deleted_at IS NULL)` |
| idx_suppliers_category | btree | category | não | sim |  | `CREATE INDEX idx_suppliers_category ON public.suppliers USING btree (category)` |
| idx_suppliers_deleted | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` | `CREATE INDEX idx_suppliers_deleted ON public.suppliers USING btree (deleted_at) WHERE (deleted_at IS NOT NULL)` |
| idx_suppliers_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` | `CREATE INDEX idx_suppliers_deleted_at ON public.suppliers USING btree (deleted_at) WHERE (deleted_at IS NOT NULL)` |
| idx_suppliers_deleted_by_fk | btree | deleted_by | não | sim |  | `CREATE INDEX idx_suppliers_deleted_by_fk ON public.suppliers USING btree (deleted_by)` |
| idx_suppliers_is_active | btree | is_active | não | sim |  | `CREATE INDEX idx_suppliers_is_active ON public.suppliers USING btree (is_active)` |
| suppliers_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX suppliers_pkey ON public.suppliers USING btree (id)` |


## Policies (RLS)

### `Admin and managers can read suppliers`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can insert suppliers`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can update suppliers`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `admin_delete_suppliers`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| audit_soft_delete_suppliers | AFTER | UPDATE | ROW | enabled | public.log_soft_delete |
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_suppliers_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
