# public.scheduled_report_runs

> Tabela public.scheduled_report_runs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), schedule_id uuid NOT NULL, started_at timestamp with time zone NOT NULL DEFAULT now(), finished_at timestamp with time zone NULLABLE, status text NOT NULL DEFAULT 'running'::text, rows_count integer NULLABLE, file_path text NULLABLE, error_message text NULLABLE. Relacionamentos FK: schedule_id → public.scheduled_reports(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.scheduled_report_runs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `schedule_id` | `uuid` | não |  |  | Coluna schedule_id da tabela public.scheduled_report_runs. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.scheduled_reports(id). |
| 3 | `started_at` | `timestamp with time zone` | não | `now()` |  | Coluna started_at da tabela public.scheduled_report_runs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 4 | `finished_at` | `timestamp with time zone` | sim |  |  | Coluna finished_at da tabela public.scheduled_report_runs. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 5 | `status` | `text` | não | `'running'::text` |  | Coluna status da tabela public.scheduled_report_runs. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'running'::text. Validação CHECK: CHECK (status = ANY (ARRAY['running'::text, 'success'::text, 'failed'::text])). |
| 6 | `rows_count` | `integer` | sim |  |  | Coluna rows_count da tabela public.scheduled_report_runs. Tipo PostgreSQL: integer. Aceita NULL. |
| 7 | `file_path` | `text` | sim |  |  | Coluna file_path da tabela public.scheduled_report_runs. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `error_message` | `text` | sim |  |  | Coluna error_message da tabela public.scheduled_report_runs. Tipo PostgreSQL: text. Aceita NULL. |


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
