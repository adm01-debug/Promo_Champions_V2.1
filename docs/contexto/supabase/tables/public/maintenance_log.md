# public.maintenance_log

> Tabela public.maintenance_log. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), job_name text NOT NULL, started_at timestamp with time zone NOT NULL DEFAULT now(), completed_at timestamp with time zone NULLABLE, rows_affected bigint NULLABLE DEFAULT 0, status text NOT NULL DEFAULT 'running'::text, error_message text NULLABLE, metadata jsonb NULLABLE DEFAULT '{}'::jsonb.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | sim |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.maintenance_log. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `job_name` | `text` | não |  |  | Coluna job_name da tabela public.maintenance_log. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `started_at` | `timestamp with time zone` | não | `now()` |  | Coluna started_at da tabela public.maintenance_log. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). Validação CHECK: CHECK (completed_at IS NULL OR completed_at >= started_at). |
| 4 | `completed_at` | `timestamp with time zone` | sim |  |  | Coluna completed_at da tabela public.maintenance_log. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Validação CHECK: CHECK (completed_at IS NULL OR completed_at >= started_at). |
| 5 | `rows_affected` | `bigint` | sim | `0` |  | Coluna rows_affected da tabela public.maintenance_log. Tipo PostgreSQL: bigint. Aceita NULL. Valor padrão: 0. Validação CHECK: CHECK (rows_affected IS NULL OR rows_affected >= 0). |
| 6 | `status` | `text` | não | `'running'::text` |  | Coluna status da tabela public.maintenance_log. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'running'::text. Validação CHECK: CHECK (status = ANY (ARRAY['running'::text, 'completed'::text, 'failed'::text, 'skipped'::text])). |
| 7 | `error_message` | `text` | sim |  |  | Coluna error_message da tabela public.maintenance_log. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  | Coluna metadata da tabela public.maintenance_log. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '{}'::jsonb. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| chk_maintenance_log_completed_after_started | CHECK | `CHECK (completed_at IS NULL OR completed_at >= started_at)` |  |  | sim |
| chk_maintenance_log_rows_affected_non_negative | CHECK | `CHECK (rows_affected IS NULL OR rows_affected >= 0)` |  |  | sim |
| chk_maintenance_log_status_allowed | CHECK | `CHECK (status = ANY (ARRAY['running'::text, 'completed'::text, 'failed'::text, 'skipped'::text]))` |  |  | sim |
| maintenance_log_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_maintenance_log_job_started | btree | job_name, started_at | não | sim |  | `CREATE INDEX idx_maintenance_log_job_started ON public.maintenance_log USING btree (job_name, started_at DESC)` |
| idx_maintenance_log_started_at | btree | started_at | não | sim |  | `CREATE INDEX idx_maintenance_log_started_at ON public.maintenance_log USING btree (started_at DESC)` |
| idx_maintenance_log_status | btree | status | não | sim | `(status = ANY (ARRAY['running'::text, 'failed'::text]))` | `CREATE INDEX idx_maintenance_log_status ON public.maintenance_log USING btree (status) WHERE (status = ANY (ARRAY['running'::text, 'failed'::text]))` |
| maintenance_log_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX maintenance_log_pkey ON public.maintenance_log USING btree (id)` |


## Policies (RLS)

### `Admins can view maintenance log`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| authenticated | SELECT |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
