# public.report_schedules

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `report_id` | `uuid` | não |  |  |  |
| 3 | `frequency` | `text` | não |  |  |  |
| 4 | `day_of_week` | `smallint` | sim |  |  |  |
| 5 | `day_of_month` | `smallint` | sim |  |  |  |
| 6 | `time_of_day` | `time without time zone` | não | `'08:00:00'::time without time zone` |  |  |
| 7 | `recipients` | `text[]` | não | `'{}'::text[]` |  |  |
| 8 | `format` | `text` | não | `'csv'::text` |  |  |
| 9 | `is_active` | `boolean` | não | `true` |  |  |
| 10 | `last_run_at` | `timestamp with time zone` | sim |  |  |  |
| 11 | `next_run_at` | `timestamp with time zone` | sim |  |  |  |
| 12 | `created_by` | `uuid` | não |  |  |  |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


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
