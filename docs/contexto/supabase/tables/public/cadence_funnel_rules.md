# public.cadence_funnel_rules

> Tabela public.cadence_funnel_rules. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), cadence_id uuid NULLABLE, from_stage text NOT NULL, to_stage text NOT NULL, condition_type text NOT NULL, condition_value integer NULLABLE DEFAULT 1, is_active boolean NULLABLE DEFAULT true, created_at timestamp with time zone NULLABLE DEFAULT now(), updated_at timestamp with time zone NULLABLE DEFAULT now(), time_window_hours integer NULLABLE DEFAULT 24, notify_push boolean NULLABLE DEFAULT false, notify_email boolean NULLABLE DEFAULT false, alert_priority text NULLABLE DEFAULT 'normal'::text. Relacionamentos FK: cadence_id → public.cadences(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.cadence_funnel_rules. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `cadence_id` | `uuid` | sim |  |  | Coluna cadence_id da tabela public.cadence_funnel_rules. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.cadences(id). |
| 3 | `from_stage` | `text` | não |  |  | Coluna from_stage da tabela public.cadence_funnel_rules. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (from_stage = ANY (ARRAY['new'::text, 'high_interest'::text, 'waiting_approval'::text, 'scheduled'::text])). |
| 4 | `to_stage` | `text` | não |  |  | Coluna to_stage da tabela public.cadence_funnel_rules. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (to_stage = ANY (ARRAY['new'::text, 'high_interest'::text, 'waiting_approval'::text, 'scheduled'::text])). |
| 5 | `condition_type` | `text` | não |  |  | Coluna condition_type da tabela public.cadence_funnel_rules. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (condition_type = ANY (ARRAY['email_open'::text, 'quote_open'::text, 'price_click'::text, 'reply'::text, 'manual'::text])). |
| 6 | `condition_value` | `integer` | sim | `1` |  | Coluna condition_value da tabela public.cadence_funnel_rules. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 1. |
| 7 | `is_active` | `boolean` | sim | `true` |  | Coluna is_active da tabela public.cadence_funnel_rules. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: true. |
| 8 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.cadence_funnel_rules. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 9 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Coluna updated_at da tabela public.cadence_funnel_rules. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 10 | `time_window_hours` | `integer` | sim | `24` |  | Coluna time_window_hours da tabela public.cadence_funnel_rules. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 24. |
| 11 | `notify_push` | `boolean` | sim | `false` |  | Coluna notify_push da tabela public.cadence_funnel_rules. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: false. |
| 12 | `notify_email` | `boolean` | sim | `false` |  | Coluna notify_email da tabela public.cadence_funnel_rules. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: false. |
| 13 | `alert_priority` | `text` | sim | `'normal'::text` |  | Coluna alert_priority da tabela public.cadence_funnel_rules. Tipo PostgreSQL: text. Aceita NULL. Valor padrão: 'normal'::text. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cadence_funnel_rules_cadence_id_fkey | FOREIGN KEY | `FOREIGN KEY (cadence_id) REFERENCES cadences(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| cadence_funnel_rules_condition_type_check | CHECK | `CHECK (condition_type = ANY (ARRAY['email_open'::text, 'quote_open'::text, 'price_click'::text, 'reply'::text, 'manual'::text]))` |  |  | sim |
| cadence_funnel_rules_from_stage_check | CHECK | `CHECK (from_stage = ANY (ARRAY['new'::text, 'high_interest'::text, 'waiting_approval'::text, 'scheduled'::text]))` |  |  | sim |
| cadence_funnel_rules_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| cadence_funnel_rules_to_stage_check | CHECK | `CHECK (to_stage = ANY (ARRAY['new'::text, 'high_interest'::text, 'waiting_approval'::text, 'scheduled'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cadence_funnel_rules_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cadence_funnel_rules_pkey ON public.cadence_funnel_rules USING btree (id)` |
| idx_cadence_funnel_rules_cadence_id | btree | cadence_id | não | sim |  | `CREATE INDEX idx_cadence_funnel_rules_cadence_id ON public.cadence_funnel_rules USING btree (cadence_id)` |


## Policies (RLS)

### `Authenticated users can view funnel rules`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Only admins can manage funnel rules`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_cadence_funnel_rules_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
