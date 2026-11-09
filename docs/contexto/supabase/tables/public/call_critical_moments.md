# public.call_critical_moments

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 5 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `recording_id` | `uuid` | não |  |  |  |
| 3 | `owner_id` | `uuid` | não |  |  |  |
| 4 | `salesperson_id` | `uuid` | não |  |  |  |
| 5 | `moment_type` | `text` | não |  |  |  |
| 6 | `severity` | `text` | não | `'medium'::text` |  |  |
| 7 | `timestamp_sec` | `integer` | não | `0` |  |  |
| 8 | `quote` | `text` | sim |  |  |  |
| 9 | `context` | `text` | sim |  |  |  |
| 10 | `suggested_action` | `text` | sim |  |  |  |
| 11 | `status` | `text` | não | `'new'::text` |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_critical_moments_moment_type_check | CHECK | `CHECK (moment_type = ANY (ARRAY['objection'::text, 'buying_signal'::text, 'price_mention'::text, 'discount_request'::text, 'churn_signal'::text, 'competitor'::text, 'commitment'::text, 'next_step'::text]))` |  |  | sim |
| call_critical_moments_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_critical_moments_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| call_critical_moments_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| call_critical_moments_severity_check | CHECK | `CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))` |  |  | sim |
| call_critical_moments_status_check | CHECK | `CHECK (status = ANY (ARRAY['new'::text, 'acknowledged'::text, 'actioned'::text, 'dismissed'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.critical_moment_notifications | critical_moment_notifications_moment_id_fkey | moment_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_critical_moments_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_critical_moments_pkey ON public.call_critical_moments USING btree (id)` |
| idx_call_critical_moments_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_call_critical_moments_salesperson_id ON public.call_critical_moments USING btree (salesperson_id)` |
| idx_ccm_owner_status_sev | btree | owner_id, status, severity, created_at | não | sim |  | `CREATE INDEX idx_ccm_owner_status_sev ON public.call_critical_moments USING btree (owner_id, status, severity, created_at DESC)` |
| idx_ccm_recording | btree | recording_id, timestamp_sec | não | sim |  | `CREATE INDEX idx_ccm_recording ON public.call_critical_moments USING btree (recording_id, timestamp_sec)` |


## Policies (RLS)

### `Authenticated users can insert critical moments`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() = owner_id)` |

### `Users can view own critical moments`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((get_current_salesperson_id() = salesperson_id) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `ccm_admin_delete`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR (owner_id = auth.uid()))` |
| WITH CHECK |  |

### `ccm_owner_read`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK |  |

### `ccm_owner_update`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| tr_critical_moment_health | AFTER | INSERT OR UPDATE | ROW | enabled | private.trigger_recalculate_deal_health |
| trg_ccm_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |
| trg_notify_critical_moment | AFTER | INSERT | ROW | enabled | private.notify_critical_moment_created |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
