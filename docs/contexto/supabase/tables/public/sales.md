# public.sales

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 13 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |
| usada por views | public.client_purchase_seasonality, public.coaching_impact_metrics, public.engagement_score_leaderboard, public.follow_up_audit_view, public.mv_competitive_ranking, public.race_leaderboard_view, public.revenue_forecast_view, public.sales_with_markup, public.v_quote_to_sale_invariants |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `client_name` | `text` | não |  |  |  |
| 3 | `product_name` | `text` | não |  |  |  |
| 4 | `amount` | `numeric(12,2)` | não |  |  |  |
| 5 | `status` | `text` | não | `'pending'::text` |  |  |
| 6 | `category` | `text` | não | `'subscription'::text` |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `salesperson_id` | `uuid` | sim |  |  |  |
| 10 | `source` | `text` | sim | `'other'::text` |  | Lead source: linkedin, referral, inbound, outbound, event, website, paid_ads, other |
| 11 | `pipeline_id` | `uuid` | sim |  |  |  |
| 12 | `forecast_category` | `forecast_category` | sim |  |  |  |
| 13 | `account_id` | `uuid` | sim |  |  |  |
| 14 | `broadcast_sent_at` | `timestamp with time zone` | sim |  |  |  |
| 15 | `script_variant` | `text` | sim |  |  |  |
| 17 | `client_id` | `uuid` | sim |  |  |  |
| 18 | `product_id` | `uuid` | sim |  |  |  |
| 19 | `sku` | `text` | sim |  |  |  |
| 20 | `stock_reduced` | `boolean` | sim | `false` |  |  |
| 21 | `enrichment_data` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 22 | `enrichment_status` | `text` | sim | `'pending'::text` |  |  |
| 23 | `lost_to_competitor_id` | `uuid` | sim |  |  |  |
| 24 | `competitor_price_at_deal` | `numeric(12,2)` | sim |  |  |  |
| 25 | `territory_id` | `uuid` | sim |  |  |  |
| 26 | `ai_prediction_score` | `double precision` | sim | `0` |  |  |
| 27 | `ai_prediction_reasoning` | `text` | sim |  |  |  |
| 28 | `whatsapp_last_interaction` | `timestamp with time zone` | sim |  |  |  |
| 29 | `whatsapp_status` | `text` | sim | `'not_connected'::text` |  |  |
| 30 | `sdr_id` | `uuid` | sim |  |  | ID do SDR que realizou a ativação/prospecção |
| 31 | `closer_id` | `uuid` | sim |  |  | ID do Closer responsável pelo fechamento e gestão |
| 32 | `is_first_sale` | `boolean` | sim | `false` |  | Indicates if this was the first successful sale for this client name, used for SDR/Closer commission splitting. |
| 33 | `unit_cost` | `numeric(12,2)` | sim |  |  | Custo unitário snapshot no momento da venda (fonte: Promo Gifts ou manual). |
| 34 | `total_cost` | `numeric(14,2)` | sim |  |  | Custo total da venda (unit_cost * quantidade quando aplicável). |
| 35 | `cost_source` | `text` | sim |  |  |  |
| 36 | `cost_synced_at` | `timestamp with time zone` | sim |  |  |  |
| 37 | `margin_amount` | `numeric(14,2)` | sim | ` CASE     WHEN ((total_cost IS NULL) OR (amount IS NULL)) THEN NULL::numeric     ELSE round((amount - total_cost), 2) END` | s | Coluna calculada: amount - total_cost. |
| 38 | `markup_pct` | `numeric(8,2)` | sim | ` CASE     WHEN ((total_cost IS NULL) OR (total_cost = (0)::numeric) OR (amount IS NULL)) THEN NULL::numeric     ELSE round((((amount - total_cost) / total_cost) * (100)::numeric), 2) END` | s | Coluna calculada: ((amount - total_cost) / total_cost) * 100. |
| 39 | `stage` | `text` | sim |  |  |  |
| 40 | `segment` | `text` | sim |  |  |  |
| 41 | `notes` | `text` | sim |  |  |  |
| 42 | `loss_reason` | `text` | sim |  |  |  |
| 43 | `competitor_name` | `text` | sim |  |  |  |
| 44 | `closed_at` | `timestamp with time zone` | sim |  |  |  |
| 45 | `external_deal_id` | `text` | sim |  |  | ID do negócio na origem externa (ex.: Bitrix24 deal.ID) p/ dedupe idempotente de sync. |
| 46 | `deleted_at` | `timestamp with time zone` | sim |  |  | Soft delete: preenchido marca o registro como excluído sem remoção física. |
| 47 | `deleted_by` | `uuid` | sim |  |  |  |
| 48 | `delete_reason` | `text` | sim |  |  |  |
| 49 | `version` | `integer` | não | `1` |  | Optimistic locking: incrementado a cada UPDATE; UPDATEs críticos devem filtrar pela versão lida. |
| 50 | `deal_status` | `deal_status` | sim | ` CASE     WHEN (status = ANY (ARRAY['completed'::text, 'won'::text, 'closed'::text])) THEN 'completed'::deal_status     WHEN (status = ANY (ARRAY['lost'::text, 'cancelled'::text])) THEN 'lost'::deal_status     WHEN (status = 'qualified'::text) THEN 'qualified'::deal_status     WHEN (status = 'proposal'::text) THEN 'proposal'::deal_status     WHEN (status = 'negotiation'::text) THEN 'negotiation'::deal_status     WHEN (status = ANY (ARRAY['pending'::text, 'lead'::text, 'prospecting'::text, 'open'::text, 'in_progress'::text])) THEN 'pending'::deal_status     ELSE NULL::deal_status END` | s |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sales_account_id_fkey | FOREIGN KEY | `FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| sales_amount_positive | CHECK | `CHECK (amount >= 0::numeric)` |  |  | sim |
| sales_category_check | CHECK | `CHECK (category = ANY (ARRAY['subscription'::text, 'service'::text, 'project'::text, 'other'::text, 'brindes'::text]))` |  |  | sim |
| sales_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| sales_closer_id_fkey | FOREIGN KEY | `FOREIGN KEY (closer_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| sales_cost_source_check | CHECK | `CHECK (cost_source IS NULL OR (cost_source = ANY (ARRAY['promo_gifts'::text, 'manual'::text, 'product_default'::text])))` |  |  | sim |
| sales_lost_to_competitor_id_fkey | FOREIGN KEY | `FOREIGN KEY (lost_to_competitor_id) REFERENCES competitors_registry(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| sales_pipeline_id_fkey | FOREIGN KEY | `FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| sales_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sales_product_id_fkey | FOREIGN KEY | `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| sales_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| sales_sdr_id_fkey | FOREIGN KEY | `FOREIGN KEY (sdr_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| sales_status_check | CHECK | `CHECK (status = ANY (ARRAY['completed'::text, 'pending'::text, 'cancelled'::text, 'lead'::text, 'qualified'::text, 'proposal'::text, 'negotiation'::text, 'closed'::text, 'prospecting'::text, 'won'::text, 'lost'::text]))` |  |  | sim |
| sales_territory_id_fkey | FOREIGN KEY | `FOREIGN KEY (territory_id) REFERENCES territories(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.account_contacts | account_contacts_sale_id_fkey | sale_id | SET NULL |
| public.activities | activities_sale_id_fkey | sale_id | SET NULL |
| public.agenda_events | agenda_events_sale_id_fkey | sale_id | SET NULL |
| public.ai_sales_insights | ai_sales_insights_sale_id_fkey | sale_id | CASCADE |
| public.approval_requests | approval_requests_deal_id_fkey | deal_id | SET NULL |
| public.buying_committee | buying_committee_sale_id_fkey | sale_id | CASCADE |
| public.buying_committee_members | buying_committee_members_sale_id_fkey | sale_id | CASCADE |
| public.call_logs | call_logs_sale_id_fkey | sale_id | SET NULL |
| public.call_recordings | call_recordings_sale_id_fkey | sale_id | SET NULL |
| public.channel_interactions | channel_interactions_deal_id_fkey | deal_id | SET NULL |
| public.commissions | commissions_sale_id_fkey | sale_id | CASCADE |
| public.committee_coverage_history | committee_coverage_history_sale_id_fkey | sale_id | CASCADE |
| public.committee_extraction_runs | committee_extraction_runs_sale_id_fkey | sale_id | CASCADE |
| public.conversation_analyses | conversation_analyses_sale_id_fkey | sale_id | CASCADE |
| public.deal_chat_history | deal_chat_history_deal_id_fkey | deal_id | CASCADE |
| public.deal_committee_coverage | deal_committee_coverage_sale_id_fkey | sale_id | CASCADE |
| public.deal_health_history | deal_health_history_sale_id_fkey | sale_id | CASCADE |
| public.deal_health_scores | deal_health_scores_sale_id_fkey | sale_id | CASCADE |
| public.deal_outcomes | deal_outcomes_sale_id_fkey | sale_id | CASCADE |
| public.deal_probability_scores | deal_probability_scores_sale_id_fkey | sale_id | CASCADE |
| public.deal_risk_signals | deal_risk_signals_sale_id_fkey | sale_id | CASCADE |
| public.deal_stage_history | deal_stage_history_sale_id_fkey | sale_id | CASCADE |
| public.deal_stage_transitions | deal_stage_transitions_sale_id_fkey | sale_id | CASCADE |
| public.deal_stakeholders | deal_stakeholders_sale_id_fkey | sale_id | CASCADE |
| public.deal_velocity_alerts | deal_velocity_alerts_sale_id_fkey | sale_id | CASCADE |
| public.deal_velocity_predictions | deal_velocity_predictions_sale_id_fkey | sale_id | CASCADE |
| public.dialer_queue_items | dialer_queue_items_sale_id_fkey | sale_id | CASCADE |
| public.email_engagement_score_history | email_engagement_score_history_sale_id_fkey | sale_id | CASCADE |
| public.email_engagement_scores | email_engagement_scores_sale_id_fkey | sale_id | CASCADE |
| public.email_tracking_events | email_tracking_events_sale_id_fkey | sale_id | CASCADE |
| public.follow_up_audit_logs | follow_up_audit_logs_sale_id_fkey | sale_id | SET NULL |
| public.follow_up_notifications | follow_up_notifications_sale_id_fkey | sale_id | SET NULL |
| public.forecast_deal_contributions | forecast_deal_contributions_sale_id_fkey | sale_id | CASCADE |
| public.lead_assignments | lead_assignments_sale_id_fkey | sale_id | CASCADE |
| public.lead_churn_risk | lead_churn_risk_sale_id_fkey | sale_id | CASCADE |
| public.lead_score_explanations | lead_score_explanations_sale_id_fkey | sale_id | CASCADE |
| public.lead_score_history | lead_score_history_sale_id_fkey | sale_id | CASCADE |
| public.lead_scores | lead_scores_sale_id_fkey | sale_id | CASCADE |
| public.mql_qualifications | mql_qualifications_sale_id_fkey | sale_id | CASCADE |
| public.nps_surveys | nps_surveys_sale_id_fkey | sale_id | SET NULL |
| public.pipeline_inspection_snapshots | pipeline_inspection_snapshots_sale_id_fkey | sale_id | CASCADE |
| public.pipeline_inspections | pipeline_inspections_sale_id_fkey | sale_id | CASCADE |
| public.playbook_progress | playbook_progress_sale_id_fkey | sale_id | CASCADE |
| public.prospect_cadences | prospect_cadences_sale_id_fkey | sale_id | CASCADE |
| public.quotes | quotes_sale_id_fkey | sale_id | SET NULL |
| public.sale_notifications_audit | sale_notifications_audit_sale_id_fkey | sale_id | SET NULL |
| public.scheduled_sends | scheduled_sends_sale_id_fkey | sale_id | CASCADE |
| public.send_time_profiles | send_time_profiles_sale_id_fkey | sale_id | CASCADE |
| public.sla_violations | sla_violations_sale_id_fkey | sale_id | CASCADE |
| public.tasks | tasks_sale_id_fkey | sale_id | SET NULL |
| public.twilio_call_sessions | twilio_call_sessions_sale_id_fkey | sale_id | SET NULL |
| public.whatsapp_conversations | whatsapp_conversations_sale_id_fkey | sale_id | CASCADE |
| public.win_loss_analyses | win_loss_analyses_sale_id_fkey | sale_id | CASCADE |
| public.win_probability_deal_calibrations | win_probability_deal_calibrations_sale_id_fkey | sale_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sales_account_id | btree | account_id | não | sim |  | `CREATE INDEX idx_sales_account_id ON public.sales USING btree (account_id)` |
| idx_sales_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_sales_client_id ON public.sales USING btree (client_id)` |
| idx_sales_client_name_status | btree | client_name, status | não | sim |  | `CREATE INDEX idx_sales_client_name_status ON public.sales USING btree (client_name, status)` |
| idx_sales_client_name_trgm | gin | client_name | não | sim |  | `CREATE INDEX idx_sales_client_name_trgm ON public.sales USING gin (client_name gin_trgm_ops)` |
| idx_sales_closer_id | btree | closer_id | não | sim |  | `CREATE INDEX idx_sales_closer_id ON public.sales USING btree (closer_id)` |
| idx_sales_cost_source | btree | cost_source | não | sim |  | `CREATE INDEX idx_sales_cost_source ON public.sales USING btree (cost_source)` |
| idx_sales_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_sales_created_at ON public.sales USING btree (created_at)` |
| idx_sales_created_at_won | btree | created_at | não | sim | `(status = 'won'::text)` | `CREATE INDEX idx_sales_created_at_won ON public.sales USING btree (created_at) WHERE (status = 'won'::text)` |
| idx_sales_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` | `CREATE INDEX idx_sales_deleted_at ON public.sales USING btree (deleted_at) WHERE (deleted_at IS NOT NULL)` |
| idx_sales_lost_to_competitor_id | btree | lost_to_competitor_id | não | sim |  | `CREATE INDEX idx_sales_lost_to_competitor_id ON public.sales USING btree (lost_to_competitor_id)` |
| idx_sales_markup_pct | btree | markup_pct | não | sim |  | `CREATE INDEX idx_sales_markup_pct ON public.sales USING btree (markup_pct)` |
| idx_sales_pipeline_id | btree | pipeline_id | não | sim |  | `CREATE INDEX idx_sales_pipeline_id ON public.sales USING btree (pipeline_id)` |
| idx_sales_product_id | btree | product_id | não | sim |  | `CREATE INDEX idx_sales_product_id ON public.sales USING btree (product_id)` |
| idx_sales_product_name_trgm | gin | product_name | não | sim |  | `CREATE INDEX idx_sales_product_name_trgm ON public.sales USING gin (product_name gin_trgm_ops)` |
| idx_sales_salesperson_status | btree | salesperson_id, status | não | sim |  | `CREATE INDEX idx_sales_salesperson_status ON public.sales USING btree (salesperson_id, status)` |
| idx_sales_sdr_id | btree | sdr_id | não | sim |  | `CREATE INDEX idx_sales_sdr_id ON public.sales USING btree (sdr_id)` |
| idx_sales_source | btree | source | não | sim |  | `CREATE INDEX idx_sales_source ON public.sales USING btree (source)` |
| idx_sales_sp_created_status | btree | salesperson_id, created_at, status | não | sim |  | `CREATE INDEX idx_sales_sp_created_status ON public.sales USING btree (salesperson_id, created_at, status)` |
| idx_sales_status | btree | status | não | sim |  | `CREATE INDEX idx_sales_status ON public.sales USING btree (status)` |
| idx_sales_status_created_at | btree | status, created_at | não | sim |  | `CREATE INDEX idx_sales_status_created_at ON public.sales USING btree (status, created_at)` |
| idx_sales_status_created_at_desc | btree | status, created_at | não | sim |  | `CREATE INDEX idx_sales_status_created_at_desc ON public.sales USING btree (status, created_at DESC)` |
| idx_sales_status_is_first_sale | btree | status, is_first_sale | não | sim |  | `CREATE INDEX idx_sales_status_is_first_sale ON public.sales USING btree (status, is_first_sale)` |
| idx_sales_territory_id | btree | territory_id | não | sim |  | `CREATE INDEX idx_sales_territory_id ON public.sales USING btree (territory_id)` |
| sales_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sales_pkey ON public.sales USING btree (id)` |
| ux_sales_source_external_deal | btree | source, external_deal_id | sim | sim |  | `CREATE UNIQUE INDEX ux_sales_source_external_deal ON public.sales USING btree (source, external_deal_id)` |


## Policies (RLS)

### `Admins and Managers can insert sales`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager()` |

### `Admins and Managers can update sales`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager()` |
| WITH CHECK |  |

### `Admins and Managers can view all sales`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager()` |
| WITH CHECK |  |

### `Admins can update any sale`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Closers can view leads assigned to them`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(closer_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| WITH CHECK |  |

### `SDRs can view leads they prospected`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(sdr_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| WITH CHECK |  |

### `Salespeople can insert their own sales`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM salespeople   WHERE ((salespeople.auth_user_id = auth.uid()) AND (salespeople.id = sales.salesperson_id))))` |

### `Salespeople can update their own sales`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM salespeople   WHERE ((salespeople.auth_user_id = auth.uid()) AND (salespeople.id = sales.salesperson_id))))` |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM salespeople   WHERE ((salespeople.auth_user_id = auth.uid()) AND (salespeople.id = sales.salesperson_id))))` |

### `Salespeople can view their own sales`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM salespeople   WHERE ((salespeople.auth_user_id = auth.uid()) AND (salespeople.id = sales.salesperson_id))))` |
| WITH CHECK |  |

### `Users can enrich their own leads`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = salesperson_id)` |
| WITH CHECK | `(auth.uid() = salesperson_id)` |

### `Users can insert own sales`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |

### `Users can read own sales or admins all`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `admin_delete_sales`

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
| refresh_monthly_summary_on_sale | AFTER | INSERT OR DELETE OR UPDATE | ROW | enabled | private.trigger_refresh_monthly_summary |
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| tr_auto_followup_on_sale | AFTER | UPDATE | ROW | enabled | public.auto_create_sale_followup |
| tr_handle_sale_commissions | AFTER | INSERT OR UPDATE | ROW | enabled | private.handle_sale_commissions |
| tr_handle_stock_on_sale | AFTER | UPDATE | ROW | enabled | public.handle_stock_management |
| tr_manage_stock | BEFORE | INSERT OR UPDATE | ROW | enabled | public.manage_stock_on_sale |
| tr_notify_sale_victory | AFTER | UPDATE | ROW | enabled | public.fn_notify_victory |
| tr_on_sale_activation | AFTER | INSERT OR UPDATE | ROW | enabled | public.handle_client_activation |
| tr_performance_update_sales | AFTER | INSERT OR UPDATE | ROW | enabled | private.handle_performance_update |
| tr_set_sdr_id | BEFORE | INSERT | ROW | enabled | public.set_sdr_id_on_insert |
| tr_sync_battle_score_sales | AFTER | INSERT OR UPDATE | ROW | enabled | public.sync_battle_score |
| tr_sync_bets_sales | AFTER | INSERT OR DELETE OR UPDATE | ROW | enabled | public.sync_performance_bets |
| tr_sync_territory | AFTER | INSERT OR DELETE OR UPDATE | ROW | enabled | public.sync_territory_ownership |
| tr_territory_conquest | AFTER | INSERT | ROW | enabled | private.handle_territory_conquest |
| tr_update_bets_on_sale | AFTER | INSERT | ROW | enabled | public.process_performance_bet_event |
| tr_update_client_ltv | AFTER | INSERT OR UPDATE | ROW | enabled | public.update_client_ltv_on_sale |
| tr_update_client_total_value | AFTER | INSERT OR DELETE OR UPDATE | ROW | enabled | public.handle_client_ltv_update |
| tr_update_client_value | AFTER | INSERT OR DELETE OR UPDATE | ROW | enabled | public.update_client_total_value |
| tr_update_product_stock | AFTER | INSERT OR UPDATE | ROW | enabled | public.update_product_stock |
| tr_victory_sale | AFTER | UPDATE | ROW | enabled | public.auto_victory_post |
| trg_auto_create_commission | AFTER | INSERT OR UPDATE | ROW | disabled | private.auto_create_commission |
| trg_auto_enroll_on_sale | AFTER | INSERT OR UPDATE | ROW | enabled | private.auto_enroll_in_cadence |
| trg_auto_forecast_category | BEFORE | INSERT OR UPDATE | ROW | enabled | private.auto_set_forecast_category |
| trg_auto_link_sale_to_account | BEFORE | INSERT OR UPDATE | ROW | enabled | private.auto_link_sale_to_account |
| trg_broadcast_sale_completed | AFTER | INSERT OR UPDATE | ROW | enabled | public.broadcast_sale_completed |
| trg_deal_stage_history | AFTER | INSERT OR UPDATE | ROW | enabled | public.trg_deal_stage_history |
| trg_enforce_status_transition | BEFORE | UPDATE | ROW | enabled | public.enforce_status_transition |
| trg_process_race_event_on_sale | AFTER | INSERT OR UPDATE | ROW | enabled | public.process_race_event_on_sale |
| trg_record_sale_stage_transition | AFTER | INSERT OR UPDATE | ROW | enabled | public.record_sale_stage_transition |
| trg_refresh_ranking_on_sale_change | AFTER | INSERT OR DELETE OR UPDATE | STATEMENT | enabled | public.trg_refresh_ranking_on_sale |
| trg_sales_stamp_closed_at | BEFORE | INSERT OR UPDATE | ROW | enabled | public.trg_sales_stamp_closed_at |
| update_bets_on_sale | AFTER | INSERT OR UPDATE | ROW | enabled | private.trigger_update_performance_bets |
| update_sales_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |
| update_territories_on_sale | AFTER | INSERT OR UPDATE | ROW | enabled | private.trigger_update_territories |


## Grants

_nenhum_
