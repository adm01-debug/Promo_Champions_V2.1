# public.quotes

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 6 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |
| usada por views | public.v_quote_conversion_history, public.v_quote_to_sale_invariants |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | sim |  |  |  |
| 3 | `client_name` | `text` | não |  |  |  |
| 4 | `title` | `text` | não |  |  |  |
| 5 | `description` | `text` | sim |  |  |  |
| 6 | `total_value` | `numeric` | não | `0` |  |  |
| 7 | `status` | `text` | não | `'draft'::text` |  |  |
| 8 | `external_reference` | `text` | sim |  |  |  |
| 9 | `valid_until` | `date` | sim |  |  |  |
| 10 | `sent_at` | `timestamp with time zone` | sim |  |  |  |
| 11 | `approved_at` | `timestamp with time zone` | sim |  |  |  |
| 12 | `rejected_at` | `timestamp with time zone` | sim |  |  |  |
| 13 | `rejection_reason` | `text` | sim |  |  |  |
| 14 | `created_by` | `uuid` | sim |  |  |  |
| 15 | `notes` | `text` | sim |  |  |  |
| 16 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 17 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 18 | `quote_number` | `text` | sim |  |  |  |
| 19 | `subtotal` | `numeric` | sim | `0` |  |  |
| 20 | `discount_percent` | `numeric` | sim | `0` |  |  |
| 21 | `discount_amount` | `numeric` | sim | `0` |  |  |
| 22 | `client_email` | `text` | sim |  |  |  |
| 23 | `client_phone` | `text` | sim |  |  |  |
| 24 | `seller_name` | `text` | sim |  |  |  |
| 25 | `items` | `jsonb` | sim | `'[]'::jsonb` |  |  |
| 26 | `source` | `text` | sim | `'manual'::text` |  |  |
| 27 | `synced_from_external` | `boolean` | sim | `false` |  |  |
| 28 | `external_quote_id` | `text` | sim |  |  |  |
| 29 | `last_synced_at` | `timestamp with time zone` | sim |  |  | Data da última sincronização com o GIFT STORE |
| 30 | `sync_status` | `text` | sim | `'none'::text` |  | Status de sincronização: none, synced, failed |
| 31 | `pdf_url` | `text` | sim |  |  |  |
| 32 | `currency` | `text` | sim | `'BRL'::text` |  |  |
| 33 | `exchange_rate` | `numeric(15,6)` | sim | `1.0` |  |  |
| 34 | `billing_status` | `text` | sim | `'pending'::text` |  |  |
| 35 | `contract_start_date` | `date` | sim |  |  |  |
| 36 | `contract_end_date` | `date` | sim |  |  |  |
| 37 | `subscription_type` | `text` | sim |  |  |  |
| 38 | `external_seller_id` | `text` | sim |  |  |  |
| 39 | `client_id` | `uuid` | sim |  |  |  |
| 40 | `deleted_at` | `timestamp with time zone` | sim |  |  | Soft delete: preenchido marca o registro como excluído sem remoção física. |
| 41 | `deleted_by` | `uuid` | sim |  |  |  |
| 42 | `delete_reason` | `text` | sim |  |  |  |
| 43 | `version` | `integer` | não | `1` |  | Optimistic locking: incrementado a cada UPDATE; UPDATEs críticos devem filtrar pela versão lida. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| quotes_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| quotes_created_by_fkey | FOREIGN KEY | `FOREIGN KEY (created_by) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| quotes_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| quotes_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.orders | orders_quote_id_fkey | quote_id | SET NULL |
| public.prospect_cadences | prospect_cadences_quote_id_fkey | quote_id | CASCADE |
| public.quote_items | quote_items_quote_id_fkey | quote_id | CASCADE |
| public.v4_callback_dead_letters | v4_callback_dead_letters_quote_id_fkey | quote_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_quotes_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_quotes_client_id ON public.quotes USING btree (client_id)` |
| idx_quotes_created_by | btree | created_by | não | sim |  | `CREATE INDEX idx_quotes_created_by ON public.quotes USING btree (created_by)` |
| idx_quotes_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` | `CREATE INDEX idx_quotes_deleted_at ON public.quotes USING btree (deleted_at) WHERE (deleted_at IS NOT NULL)` |
| idx_quotes_external_quote_id | btree | external_quote_id | não | sim |  | `CREATE INDEX idx_quotes_external_quote_id ON public.quotes USING btree (external_quote_id)` |
| idx_quotes_external_seller_id | btree | external_seller_id | não | sim |  | `CREATE INDEX idx_quotes_external_seller_id ON public.quotes USING btree (external_seller_id)` |
| idx_quotes_quote_number | btree | quote_number | não | sim |  | `CREATE INDEX idx_quotes_quote_number ON public.quotes USING btree (quote_number)` |
| idx_quotes_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_quotes_sale_id ON public.quotes USING btree (sale_id)` |
| idx_quotes_source | btree | source | não | sim |  | `CREATE INDEX idx_quotes_source ON public.quotes USING btree (source)` |
| idx_quotes_status | btree | status | não | sim |  | `CREATE INDEX idx_quotes_status ON public.quotes USING btree (status)` |
| idx_quotes_sync_status | btree | sync_status | não | sim |  | `CREATE INDEX idx_quotes_sync_status ON public.quotes USING btree (sync_status)` |
| idx_quotes_valid_until | btree | valid_until | não | sim |  | `CREATE INDEX idx_quotes_valid_until ON public.quotes USING btree (valid_until)` |
| quotes_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX quotes_pkey ON public.quotes USING btree (id)` |
| ux_quotes_external_quote_id | btree | external_quote_id | sim | sim | `(external_quote_id IS NOT NULL)` | `CREATE UNIQUE INDEX ux_quotes_external_quote_id ON public.quotes USING btree (external_quote_id) WHERE (external_quote_id IS NOT NULL)` |


## Policies (RLS)

### `Admins and managers can view all quotes`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Closers can insert quotes`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(is_admin_or_manager(auth.uid()) OR (created_by = get_current_salesperson_id()))` |

### `Closers can read quotes`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (created_by = get_current_salesperson_id()))` |
| WITH CHECK |  |

### `Closers can update quotes`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (created_by = get_current_salesperson_id()))` |
| WITH CHECK |  |

### `Salespeople can view own quotes`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((get_current_salesperson_id() IS NOT NULL) AND (created_by IS NOT NULL) AND (created_by = get_current_salesperson_id()))` |
| WITH CHECK |  |

### `admin_delete_quotes`

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
| audit_business_changes | AFTER | DELETE OR UPDATE | ROW | enabled | public.audit_log_row_change |
| bump_version | BEFORE | UPDATE | ROW | enabled | public.bump_row_version |
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| tr_sync_quote_to_sale | AFTER | INSERT OR UPDATE | ROW | enabled | public.sync_quote_to_sale_status |
| trg_auto_enroll_quote_cadence | AFTER | INSERT OR UPDATE | ROW | enabled | private.auto_enroll_quote_cadence |
| trg_award_xp_on_quote_approved_via_cadence | AFTER | UPDATE | ROW | enabled | private.award_xp_on_quote_approved_via_cadence |
| trg_convert_quote_to_order | AFTER | INSERT OR UPDATE | ROW | enabled | public.convert_quote_to_order |
| trg_enqueue_v4_callback | AFTER | UPDATE | ROW | enabled | public.enqueue_v4_callback |
| update_quotes_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
