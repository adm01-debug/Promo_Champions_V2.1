# public.scheduled_reports

> Tabela public.scheduled_reports. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), created_by uuid NOT NULL DEFAULT auth.uid(), report_id uuid NOT NULL, name text NOT NULL, frequency text NOT NULL DEFAULT 'daily'::text, hour_of_day integer NOT NULL DEFAULT 8, day_of_week integer NULLABLE, day_of_month integer NULLABLE, recipients text[] NOT NULL DEFAULT '{}'::text[], format text NOT NULL DEFAULT 'csv'::text, enabled boolean NOT NULL DEFAULT true, last_run_at timestamp with time zone NULLABLE, next_run_at timestamp with time zone NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: report_id → public.custom_reports(id).

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


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.scheduled_reports. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `created_by` | `uuid` | não | `auth.uid()` |  | Coluna created_by da tabela public.scheduled_reports. Tipo PostgreSQL: uuid. Não aceita NULL. Valor padrão: auth.uid(). |
| 3 | `report_id` | `uuid` | não |  |  | Coluna report_id da tabela public.scheduled_reports. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.custom_reports(id). |
| 4 | `name` | `text` | não |  |  | Coluna name da tabela public.scheduled_reports. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `frequency` | `text` | não | `'daily'::text` |  | Coluna frequency da tabela public.scheduled_reports. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'daily'::text. Validação CHECK: CHECK (frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text])). |
| 6 | `hour_of_day` | `integer` | não | `8` |  | Coluna hour_of_day da tabela public.scheduled_reports. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 8. Validação CHECK: CHECK (hour_of_day >= 0 AND hour_of_day <= 23). |
| 7 | `day_of_week` | `integer` | sim |  |  | Coluna day_of_week da tabela public.scheduled_reports. Tipo PostgreSQL: integer. Aceita NULL. Validação CHECK: CHECK (day_of_week >= 0 AND day_of_week <= 6). |
| 8 | `day_of_month` | `integer` | sim |  |  | Coluna day_of_month da tabela public.scheduled_reports. Tipo PostgreSQL: integer. Aceita NULL. Validação CHECK: CHECK (day_of_month >= 1 AND day_of_month <= 28). |
| 9 | `recipients` | `text[]` | não | `'{}'::text[]` |  | Coluna recipients da tabela public.scheduled_reports. Tipo PostgreSQL: text[]. Não aceita NULL. Valor padrão: '{}'::text[]. |
| 10 | `format` | `text` | não | `'csv'::text` |  | Coluna format da tabela public.scheduled_reports. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'csv'::text. Validação CHECK: CHECK (format = ANY (ARRAY['csv'::text, 'json'::text])). |
| 11 | `enabled` | `boolean` | não | `true` |  | Coluna enabled da tabela public.scheduled_reports. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 12 | `last_run_at` | `timestamp with time zone` | sim |  |  | Coluna last_run_at da tabela public.scheduled_reports. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 13 | `next_run_at` | `timestamp with time zone` | sim |  |  | Coluna next_run_at da tabela public.scheduled_reports. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 14 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.scheduled_reports. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 15 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.scheduled_reports. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| scheduled_reports_day_of_month_check | CHECK | `CHECK (day_of_month >= 1 AND day_of_month <= 28)` |  |  | sim |
| scheduled_reports_day_of_week_check | CHECK | `CHECK (day_of_week >= 0 AND day_of_week <= 6)` |  |  | sim |
| scheduled_reports_format_check | CHECK | `CHECK (format = ANY (ARRAY['csv'::text, 'json'::text]))` |  |  | sim |
| scheduled_reports_frequency_check | CHECK | `CHECK (frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text]))` |  |  | sim |
| scheduled_reports_hour_of_day_check | CHECK | `CHECK (hour_of_day >= 0 AND hour_of_day <= 23)` |  |  | sim |
| scheduled_reports_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| scheduled_reports_report_id_fkey | FOREIGN KEY | `FOREIGN KEY (report_id) REFERENCES custom_reports(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.scheduled_report_runs | scheduled_report_runs_schedule_id_fkey | schedule_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sched_reports_created_by | btree | created_by | não | sim |  | `CREATE INDEX idx_sched_reports_created_by ON public.scheduled_reports USING btree (created_by)` |
| idx_sched_reports_next_run | btree | next_run_at | não | sim | `(enabled = true)` | `CREATE INDEX idx_sched_reports_next_run ON public.scheduled_reports USING btree (next_run_at) WHERE (enabled = true)` |
| idx_scheduled_reports_report_id | btree | report_id | não | sim |  | `CREATE INDEX idx_scheduled_reports_report_id ON public.scheduled_reports USING btree (report_id)` |
| scheduled_reports_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX scheduled_reports_pkey ON public.scheduled_reports USING btree (id)` |


## Policies (RLS)

### `owner can insert scheduled_reports`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(created_by = auth.uid())` |

### `owner or manager can delete scheduled_reports`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((created_by = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `owner or manager can update scheduled_reports`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((created_by = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `owner or manager can view scheduled_reports`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((created_by = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_compute_next_run | BEFORE | INSERT OR UPDATE | ROW | enabled | public.compute_scheduled_report_next_run |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
