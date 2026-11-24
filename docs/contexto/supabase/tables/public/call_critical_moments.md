# public.call_critical_moments

> Tabela public.call_critical_moments. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), recording_id uuid NOT NULL, owner_id uuid NOT NULL, salesperson_id uuid NOT NULL, moment_type text NOT NULL, severity text NOT NULL DEFAULT 'medium'::text, timestamp_sec integer NOT NULL DEFAULT 0, quote text NULLABLE, context text NULLABLE, suggested_action text NULLABLE, status text NOT NULL DEFAULT 'new'::text, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: recording_id → public.call_recordings(id); salesperson_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.call_critical_moments. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `recording_id` | `uuid` | não |  |  | Coluna recording_id da tabela public.call_critical_moments. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.call_recordings(id). |
| 3 | `owner_id` | `uuid` | não |  |  | Coluna owner_id da tabela public.call_critical_moments. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 4 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.call_critical_moments. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 5 | `moment_type` | `text` | não |  |  | Coluna moment_type da tabela public.call_critical_moments. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (moment_type = ANY (ARRAY['objection'::text, 'buying_signal'::text, 'price_mention'::text, 'discount_request'::text, 'churn_signal'::text, 'competitor'::text, 'commitment'::text, 'next_step'::text])). |
| 6 | `severity` | `text` | não | `'medium'::text` |  | Coluna severity da tabela public.call_critical_moments. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'medium'::text. Validação CHECK: CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])). |
| 7 | `timestamp_sec` | `integer` | não | `0` |  | Coluna timestamp_sec da tabela public.call_critical_moments. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `quote` | `text` | sim |  |  | Coluna quote da tabela public.call_critical_moments. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `context` | `text` | sim |  |  | Coluna context da tabela public.call_critical_moments. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `suggested_action` | `text` | sim |  |  | Coluna suggested_action da tabela public.call_critical_moments. Tipo PostgreSQL: text. Aceita NULL. |
| 11 | `status` | `text` | não | `'new'::text` |  | Coluna status da tabela public.call_critical_moments. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'new'::text. Validação CHECK: CHECK (status = ANY (ARRAY['new'::text, 'acknowledged'::text, 'actioned'::text, 'dismissed'::text])). |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.call_critical_moments. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.call_critical_moments. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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
