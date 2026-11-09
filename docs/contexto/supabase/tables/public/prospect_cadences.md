# public.prospect_cadences

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 5 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | sim |  |  |  |
| 3 | `cadence_id` | `uuid` | não |  |  |  |
| 4 | `salesperson_id` | `uuid` | sim |  |  |  |
| 5 | `status` | `text` | não | `'active'::text` |  |  |
| 6 | `started_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `current_step` | `integer` | não | `0` |  |  |
| 8 | `next_action_date` | `date` | sim |  |  |  |
| 9 | `completed_at` | `timestamp with time zone` | sim |  |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 12 | `enrolled_via_rule_id` | `uuid` | sim |  |  |  |
| 13 | `enrollment_source` | `text` | não | `'manual'::text` |  |  |
| 14 | `paused_reason` | `text` | sim |  |  |  |
| 15 | `paused_at` | `timestamp with time zone` | sim |  |  |  |
| 16 | `quote_id` | `uuid` | sim |  |  |  |
| 17 | `funnel_stage` | `text` | sim | `'new'::text` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| prospect_cadences_cadence_id_fkey | FOREIGN KEY | `FOREIGN KEY (cadence_id) REFERENCES cadences(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| prospect_cadences_enrolled_via_rule_id_fkey | FOREIGN KEY | `FOREIGN KEY (enrolled_via_rule_id) REFERENCES cadence_enrollment_rules(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| prospect_cadences_funnel_stage_check | CHECK | `CHECK (funnel_stage = ANY (ARRAY['new'::text, 'high_interest'::text, 'waiting_approval'::text, 'scheduled'::text]))` |  |  | sim |
| prospect_cadences_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| prospect_cadences_quote_id_fkey | FOREIGN KEY | `FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| prospect_cadences_sale_id_cadence_id_key | UNIQUE | `UNIQUE (sale_id, cadence_id)` |  |  | sim |
| prospect_cadences_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| prospect_cadences_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| prospect_cadences_status_check | CHECK | `CHECK (status = ANY (ARRAY['active'::text, 'paused'::text, 'completed'::text, 'cancelled'::text]))` |  |  | sim |
| prospect_cadences_target_check | CHECK | `CHECK (sale_id IS NOT NULL OR quote_id IS NOT NULL)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.cadence_ab_assignments | cadence_ab_assignments_prospect_cadence_id_fkey | prospect_cadence_id | CASCADE |
| public.cadence_tasks | cadence_tasks_prospect_cadence_id_fkey | prospect_cadence_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_champ_prospect_cadences_cadence_id | btree | cadence_id | não | sim |  | `CREATE INDEX idx_champ_prospect_cadences_cadence_id ON public.prospect_cadences USING btree (cadence_id)` |
| idx_prospect_cadences_active_status | btree | status, next_action_date | não | sim | `(status = 'active'::text)` | `CREATE INDEX idx_prospect_cadences_active_status ON public.prospect_cadences USING btree (status, next_action_date) WHERE (status = 'active'::text)` |
| idx_prospect_cadences_enrolled_via_rule_id | btree | enrolled_via_rule_id | não | sim |  | `CREATE INDEX idx_prospect_cadences_enrolled_via_rule_id ON public.prospect_cadences USING btree (enrolled_via_rule_id)` |
| idx_prospect_cadences_quote_id | btree | quote_id | não | sim |  | `CREATE INDEX idx_prospect_cadences_quote_id ON public.prospect_cadences USING btree (quote_id)` |
| idx_prospect_cadences_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_prospect_cadences_sale_id ON public.prospect_cadences USING btree (sale_id)` |
| idx_prospect_cadences_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_prospect_cadences_salesperson_id ON public.prospect_cadences USING btree (salesperson_id)` |
| idx_prospect_cadences_status | btree | status | não | sim |  | `CREATE INDEX idx_prospect_cadences_status ON public.prospect_cadences USING btree (status)` |
| prospect_cadences_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX prospect_cadences_pkey ON public.prospect_cadences USING btree (id)` |
| prospect_cadences_sale_id_cadence_id_key | btree | sale_id, cadence_id | sim | sim |  | `CREATE UNIQUE INDEX prospect_cadences_sale_id_cadence_id_key ON public.prospect_cadences USING btree (sale_id, cadence_id)` |


## Policies (RLS)

### `Salespeople view own quote cadences`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((quote_id IS NOT NULL) AND (EXISTS ( SELECT 1    FROM (quotes q      JOIN salespeople sp ON ((sp.id = COALESCE(prospect_cadences.salesperson_id, sp.id))))   WHERE ((q.id = prospect_cadences.quote_id) AND ((q.created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))))))` |
| WITH CHECK |  |

### `Users can delete own prospect_cadences`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can insert own prospect_cadences`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |

### `Users can read own prospect_cadences`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can update own prospect_cadences`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_generate_cadence_tasks | AFTER | INSERT | ROW | enabled | public.generate_cadence_tasks |
| update_prospect_cadences_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
