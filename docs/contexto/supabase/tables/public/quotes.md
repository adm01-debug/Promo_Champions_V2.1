# public.quotes

> Orçamentos comerciais, com valores, cliente, ciclo de aprovação, itens e sincronização externa.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do orçamento. |
| 2 | `sale_id` | `uuid` | sim |  |  | Negócio associado ao orçamento, quando houver. |
| 3 | `client_name` | `text` | não |  |  | Nome do cliente registrado no orçamento. |
| 4 | `title` | `text` | não |  |  | Título do orçamento. |
| 5 | `description` | `text` | sim |  |  | Descrição do orçamento. |
| 6 | `total_value` | `numeric` | não | `0` |  | Valor total do orçamento, em BRL. |
| 7 | `status` | `text` | não | `'draft'::text` |  | Estado atual do orçamento, conforme utilizado pela aplicação. |
| 8 | `external_reference` | `text` | sim |  |  | Referência do orçamento em sistema externo, quando disponível. |
| 9 | `valid_until` | `date` | sim |  |  | Data até a qual o orçamento é válido. |
| 10 | `sent_at` | `timestamp with time zone` | sim |  |  | Data e hora em que o orçamento foi enviado. |
| 11 | `approved_at` | `timestamp with time zone` | sim |  |  | Data e hora em que o orçamento foi aprovado. |
| 12 | `rejected_at` | `timestamp with time zone` | sim |  |  | Data e hora em que o orçamento foi rejeitado. |
| 13 | `rejection_reason` | `text` | sim |  |  | Motivo informado para a rejeição do orçamento. |
| 14 | `created_by` | `uuid` | sim |  |  | Vendedor que criou o orçamento, quando informado. |
| 15 | `notes` | `text` | sim |  |  | Observações adicionais sobre o orçamento. |
| 16 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação do orçamento. |
| 17 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Data e hora da última atualização do orçamento. |
| 18 | `quote_number` | `text` | sim |  |  | Número ou código legível do orçamento, quando atribuído. |
| 19 | `subtotal` | `numeric` | sim | `0` |  | Subtotal dos itens antes dos ajustes finais, em BRL. |
| 20 | `discount_percent` | `numeric` | sim | `0` |  | Percentual de desconto informado no orçamento; a escala não é fixada por constraint. |
| 21 | `discount_amount` | `numeric` | sim | `0` |  | Valor monetário do desconto, em BRL. |
| 22 | `client_email` | `text` | sim |  |  | E-mail do cliente registrado no orçamento. |
| 23 | `client_phone` | `text` | sim |  |  | Telefone do cliente registrado no orçamento. |
| 24 | `seller_name` | `text` | sim |  |  | Nome do vendedor exibido no orçamento. |
| 25 | `items` | `jsonb` | sim | `'[]'::jsonb` |  | Itens do orçamento em formato JSON; a estrutura é definida pela aplicação. |
| 26 | `source` | `text` | sim | `'manual'::text` |  | Origem do orçamento, conforme utilizada pela aplicação. |
| 27 | `synced_from_external` | `boolean` | sim | `false` |  | Indica se o orçamento foi sincronizado de uma fonte externa. |
| 28 | `external_quote_id` | `text` | sim |  |  | Identificador do orçamento no sistema externo, quando disponível. |
| 29 | `last_synced_at` | `timestamp with time zone` | sim |  |  | Data e hora da última sincronização com o sistema externo. |
| 30 | `sync_status` | `text` | sim | `'none'::text` |  | Status de sincronização: none, synced, failed. |
| 31 | `pdf_url` | `text` | sim |  |  | URL do arquivo PDF do orçamento, quando disponível. |
| 32 | `currency` | `text` | sim | `'BRL'::text` |  | Código da moeda do orçamento; o padrão informado no projeto é BRL. |
| 33 | `exchange_rate` | `numeric(15,6)` | sim | `1.0` |  | Taxa de câmbio associada ao orçamento, conforme definida pela integração ou aplicação. |
| 34 | `billing_status` | `text` | sim | `'pending'::text` |  | Estado de cobrança associado ao orçamento, conforme utilizado pela aplicação. |
| 35 | `contract_start_date` | `date` | sim |  |  | Data de início do contrato associado ao orçamento, quando aplicável. |
| 36 | `contract_end_date` | `date` | sim |  |  | Data de término do contrato associado ao orçamento, quando aplicável. |
| 37 | `subscription_type` | `text` | sim |  |  | Tipo de assinatura ou recorrência associado ao orçamento, quando aplicável. |
| 38 | `external_seller_id` | `text` | sim |  |  | Identificador do vendedor no sistema externo, quando disponível. |
| 39 | `client_id` | `uuid` | sim |  |  | Cliente cadastrado associado ao orçamento, quando houver. |
| 40 | `deleted_at` | `timestamp with time zone` | sim |  |  | Soft delete: preenchido marca o registro como excluído sem remoção física. |
| 41 | `deleted_by` | `uuid` | sim |  |  |  |
| 42 | `delete_reason` | `text` | sim |  |  | Motivo informado para marcar o orçamento como excluído. |
| 43 | `version` | `integer` | não | `1` |  | Número da versão do registro usado para controle de concorrência otimista. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| quotes_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| quotes_created_by_fkey | FOREIGN KEY | `FOREIGN KEY (created_by) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| quotes_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| quotes_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| quotes_subtotal_non_negative | CHECK | `CHECK (subtotal IS NULL OR subtotal >= 0::numeric)` |  |  | sim |
| quotes_total_value_non_negative | CHECK | `CHECK (total_value IS NULL OR total_value >= 0::numeric) NOT VALID` |  |  | não |


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
| ux_quotes_quote_number_ativo | btree | quote_number | sim | sim | `((quote_number IS NOT NULL) AND (deleted_at IS NULL))` | `CREATE UNIQUE INDEX ux_quotes_quote_number_ativo ON public.quotes USING btree (quote_number) WHERE ((quote_number IS NOT NULL) AND (deleted_at IS NULL))` |


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
