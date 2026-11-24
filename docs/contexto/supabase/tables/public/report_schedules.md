# public.report_schedules

> Tabela public.report_schedules. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), report_id uuid NOT NULL, frequency text NOT NULL, day_of_week smallint NULLABLE, day_of_month smallint NULLABLE, time_of_day time without time zone NOT NULL DEFAULT '08:00:00'::time without time zone, recipients text[] NOT NULL DEFAULT '{}'::text[], format text NOT NULL DEFAULT 'csv'::text, is_active boolean NOT NULL DEFAULT true, last_run_at timestamp with time zone NULLABLE, next_run_at timestamp with time zone NULLABLE, created_by uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: report_id → public.custom_reports(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.report_schedules. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `report_id` | `uuid` | não |  |  | Coluna report_id da tabela public.report_schedules. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.custom_reports(id). |
| 3 | `frequency` | `text` | não |  |  | Coluna frequency da tabela public.report_schedules. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text])). |
| 4 | `day_of_week` | `smallint` | sim |  |  | Coluna day_of_week da tabela public.report_schedules. Tipo PostgreSQL: smallint. Aceita NULL. Validação CHECK: CHECK (day_of_week >= 0 AND day_of_week <= 6). |
| 5 | `day_of_month` | `smallint` | sim |  |  | Coluna day_of_month da tabela public.report_schedules. Tipo PostgreSQL: smallint. Aceita NULL. Validação CHECK: CHECK (day_of_month >= 1 AND day_of_month <= 31). |
| 6 | `time_of_day` | `time without time zone` | não | `'08:00:00'::time without time zone` |  | Coluna time_of_day da tabela public.report_schedules. Tipo PostgreSQL: time without time zone. Não aceita NULL. Valor padrão: '08:00:00'::time without time zone. |
| 7 | `recipients` | `text[]` | não | `'{}'::text[]` |  | Coluna recipients da tabela public.report_schedules. Tipo PostgreSQL: text[]. Não aceita NULL. Valor padrão: '{}'::text[]. |
| 8 | `format` | `text` | não | `'csv'::text` |  | Coluna format da tabela public.report_schedules. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'csv'::text. Validação CHECK: CHECK (format = ANY (ARRAY['csv'::text, 'xlsx'::text, 'pdf'::text])). |
| 9 | `is_active` | `boolean` | não | `true` |  | Coluna is_active da tabela public.report_schedules. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 10 | `last_run_at` | `timestamp with time zone` | sim |  |  | Coluna last_run_at da tabela public.report_schedules. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 11 | `next_run_at` | `timestamp with time zone` | sim |  |  | Coluna next_run_at da tabela public.report_schedules. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 12 | `created_by` | `uuid` | não |  |  | Coluna created_by da tabela public.report_schedules. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.report_schedules. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.report_schedules. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| report_schedules_day_of_month_check | CHECK | `CHECK (day_of_month >= 1 AND day_of_month <= 31)` |  |  | sim |
| report_schedules_day_of_week_check | CHECK | `CHECK (day_of_week >= 0 AND day_of_week <= 6)` |  |  | sim |
| report_schedules_format_check | CHECK | `CHECK (format = ANY (ARRAY['csv'::text, 'xlsx'::text, 'pdf'::text]))` |  |  | sim |
| report_schedules_frequency_check | CHECK | `CHECK (frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text]))` |  |  | sim |
| report_schedules_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| report_schedules_report_id_fkey | FOREIGN KEY | `FOREIGN KEY (report_id) REFERENCES custom_reports(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.report_executions | report_executions_schedule_id_fkey | schedule_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_report_schedules_next_run | btree | next_run_at | não | sim | `(is_active = true)` | `CREATE INDEX idx_report_schedules_next_run ON public.report_schedules USING btree (next_run_at) WHERE (is_active = true)` |
| idx_report_schedules_report | btree | report_id | não | sim |  | `CREATE INDEX idx_report_schedules_report ON public.report_schedules USING btree (report_id)` |
| report_schedules_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX report_schedules_pkey ON public.report_schedules USING btree (id)` |


## Policies (RLS)

### `creator_full_access`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((created_by = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK | `((created_by = auth.uid()) OR is_admin_or_manager(auth.uid()))` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_report_schedules_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
