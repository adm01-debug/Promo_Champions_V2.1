# public.sequence_step_executions

> Tabela public.sequence_step_executions. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), enrollment_id uuid NOT NULL, step_id uuid NOT NULL, executed_at timestamp with time zone NOT NULL DEFAULT now(), status text NOT NULL, channel text NULLABLE, error_message text NULLABLE, engagement jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now(), variant_id uuid NULLABLE, replied_at timestamp with time zone NULLABLE. Relacionamentos FK: enrollment_id → public.sequence_enrollments(id); step_id → public.sequence_steps(id); variant_id → public.sequence_step_variants(id).

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
| usada por views | public.sequence_variant_performance |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.sequence_step_executions. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `enrollment_id` | `uuid` | não |  |  | Coluna enrollment_id da tabela public.sequence_step_executions. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sequence_enrollments(id). |
| 3 | `step_id` | `uuid` | não |  |  | Coluna step_id da tabela public.sequence_step_executions. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sequence_steps(id). |
| 4 | `executed_at` | `timestamp with time zone` | não | `now()` |  | Coluna executed_at da tabela public.sequence_step_executions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 5 | `status` | `text` | não |  |  | Coluna status da tabela public.sequence_step_executions. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (status = ANY (ARRAY['sent'::text, 'failed'::text, 'skipped'::text, 'queued'::text])). |
| 6 | `channel` | `text` | sim |  |  | Coluna channel da tabela public.sequence_step_executions. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `error_message` | `text` | sim |  |  | Coluna error_message da tabela public.sequence_step_executions. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `engagement` | `jsonb` | não | `'{}'::jsonb` |  | Coluna engagement da tabela public.sequence_step_executions. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.sequence_step_executions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 10 | `variant_id` | `uuid` | sim |  |  | Coluna variant_id da tabela public.sequence_step_executions. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sequence_step_variants(id). |
| 11 | `replied_at` | `timestamp with time zone` | sim |  |  | Coluna replied_at da tabela public.sequence_step_executions. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sequence_step_executions_enrollment_id_fkey | FOREIGN KEY | `FOREIGN KEY (enrollment_id) REFERENCES sequence_enrollments(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| sequence_step_executions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sequence_step_executions_status_check | CHECK | `CHECK (status = ANY (ARRAY['sent'::text, 'failed'::text, 'skipped'::text, 'queued'::text]))` |  |  | sim |
| sequence_step_executions_step_id_fkey | FOREIGN KEY | `FOREIGN KEY (step_id) REFERENCES sequence_steps(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| sequence_step_executions_variant_id_fkey | FOREIGN KEY | `FOREIGN KEY (variant_id) REFERENCES sequence_step_variants(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sequence_step_executions_step_id | btree | step_id | não | sim |  | `CREATE INDEX idx_sequence_step_executions_step_id ON public.sequence_step_executions USING btree (step_id)` |
| idx_sequence_step_executions_variant | btree | variant_id | não | sim |  | `CREATE INDEX idx_sequence_step_executions_variant ON public.sequence_step_executions USING btree (variant_id)` |
| idx_step_executions_enrollment | btree | enrollment_id, executed_at | não | sim |  | `CREATE INDEX idx_step_executions_enrollment ON public.sequence_step_executions USING btree (enrollment_id, executed_at DESC)` |
| sequence_step_executions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sequence_step_executions_pkey ON public.sequence_step_executions USING btree (id)` |


## Policies (RLS)

### `View executions of accessible sequences`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM (sequence_enrollments e      JOIN sequences s ON ((s.id = e.sequence_id)))   WHERE ((e.id = sequence_step_executions.enrollment_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
