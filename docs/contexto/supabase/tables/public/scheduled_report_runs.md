# public.scheduled_report_runs

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
| 2 | `schedule_id` | `uuid` | não |  |  |  |
| 3 | `started_at` | `timestamp with time zone` | não | `now()` |  |  |
| 4 | `finished_at` | `timestamp with time zone` | sim |  |  |  |
| 5 | `status` | `text` | não | `'running'::text` |  |  |
| 6 | `rows_count` | `integer` | sim |  |  |  |
| 7 | `file_path` | `text` | sim |  |  |  |
| 8 | `error_message` | `text` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| scheduled_report_runs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| scheduled_report_runs_schedule_id_fkey | FOREIGN KEY | `FOREIGN KEY (schedule_id) REFERENCES scheduled_reports(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| scheduled_report_runs_status_check | CHECK | `CHECK (status = ANY (ARRAY['running'::text, 'success'::text, 'failed'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sched_runs_schedule | btree | schedule_id, started_at | não | sim |  | `CREATE INDEX idx_sched_runs_schedule ON public.scheduled_report_runs USING btree (schedule_id, started_at DESC)` |
| scheduled_report_runs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX scheduled_report_runs_pkey ON public.scheduled_report_runs USING btree (id)` |


## Policies (RLS)

### `owner or manager can view scheduled_report_runs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM scheduled_reports sr   WHERE ((sr.id = scheduled_report_runs.schedule_id) AND ((sr.created_by = auth.uid()) OR is_admin_or_manager(auth.uid())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
