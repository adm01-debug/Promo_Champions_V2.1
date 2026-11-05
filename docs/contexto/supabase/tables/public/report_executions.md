# public.report_executions

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
| 2 | `schedule_id` | `uuid` | sim |  |  |  |
| 3 | `report_id` | `uuid` | não |  |  |  |
| 4 | `executed_at` | `timestamp with time zone` | não | `now()` |  |  |
| 5 | `status` | `text` | não | `'pending'::text` |  |  |
| 6 | `file_url` | `text` | sim |  |  |  |
| 7 | `recipients_sent` | `text[]` | sim | `'{}'::text[]` |  |  |
| 8 | `error_message` | `text` | sim |  |  |  |
| 9 | `rows_count` | `integer` | sim |  |  |  |
| 10 | `duration_ms` | `integer` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| report_executions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| report_executions_report_id_fkey | FOREIGN KEY | `FOREIGN KEY (report_id) REFERENCES custom_reports(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| report_executions_schedule_id_fkey | FOREIGN KEY | `FOREIGN KEY (schedule_id) REFERENCES report_schedules(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| report_executions_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'running'::text, 'success'::text, 'failed'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_report_executions_report | btree | report_id, executed_at | não | sim |  | `CREATE INDEX idx_report_executions_report ON public.report_executions USING btree (report_id, executed_at DESC)` |
| idx_report_executions_schedule | btree | schedule_id, executed_at | não | sim |  | `CREATE INDEX idx_report_executions_schedule ON public.report_executions USING btree (schedule_id, executed_at DESC)` |
| report_executions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX report_executions_pkey ON public.report_executions USING btree (id)` |


## Policies (RLS)

### `report_owner_view`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(EXISTS ( SELECT 1    FROM custom_reports r   WHERE ((r.id = report_executions.report_id) AND ((r.owner_id = auth.uid()) OR is_admin_or_manager(auth.uid())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
