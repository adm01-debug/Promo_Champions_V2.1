# public.report_executions

> Tabela public.report_executions. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), schedule_id uuid NULLABLE, report_id uuid NOT NULL, executed_at timestamp with time zone NOT NULL DEFAULT now(), status text NOT NULL DEFAULT 'pending'::text, file_url text NULLABLE, recipients_sent text[] NULLABLE DEFAULT '{}'::text[], error_message text NULLABLE, rows_count integer NULLABLE, duration_ms integer NULLABLE. Relacionamentos FK: report_id → public.custom_reports(id); schedule_id → public.report_schedules(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.report_executions. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `schedule_id` | `uuid` | sim |  |  | Coluna schedule_id da tabela public.report_executions. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.report_schedules(id). |
| 3 | `report_id` | `uuid` | não |  |  | Coluna report_id da tabela public.report_executions. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.custom_reports(id). |
| 4 | `executed_at` | `timestamp with time zone` | não | `now()` |  | Coluna executed_at da tabela public.report_executions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 5 | `status` | `text` | não | `'pending'::text` |  | Coluna status da tabela public.report_executions. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pending'::text. Validação CHECK: CHECK (status = ANY (ARRAY['pending'::text, 'running'::text, 'success'::text, 'failed'::text])). |
| 6 | `file_url` | `text` | sim |  |  | Coluna file_url da tabela public.report_executions. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `recipients_sent` | `text[]` | sim | `'{}'::text[]` |  | Coluna recipients_sent da tabela public.report_executions. Tipo PostgreSQL: text[]. Aceita NULL. Valor padrão: '{}'::text[]. |
| 8 | `error_message` | `text` | sim |  |  | Coluna error_message da tabela public.report_executions. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `rows_count` | `integer` | sim |  |  | Coluna rows_count da tabela public.report_executions. Tipo PostgreSQL: integer. Aceita NULL. |
| 10 | `duration_ms` | `integer` | sim |  |  | Coluna duration_ms da tabela public.report_executions. Tipo PostgreSQL: integer. Aceita NULL. |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
