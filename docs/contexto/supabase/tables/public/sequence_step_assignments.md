# public.sequence_step_assignments

> Tabela public.sequence_step_assignments. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), enrollment_id uuid NOT NULL, step_id uuid NOT NULL, variant_id uuid NULLABLE, variant_label text NULLABLE, assigned_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: enrollment_id → public.sequence_enrollments(id); step_id → public.sequence_steps(id); variant_id → public.sequence_step_variants(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.sequence_step_assignments. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `enrollment_id` | `uuid` | não |  |  | Coluna enrollment_id da tabela public.sequence_step_assignments. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sequence_enrollments(id). |
| 3 | `step_id` | `uuid` | não |  |  | Coluna step_id da tabela public.sequence_step_assignments. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sequence_steps(id). |
| 4 | `variant_id` | `uuid` | sim |  |  | Coluna variant_id da tabela public.sequence_step_assignments. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sequence_step_variants(id). |
| 5 | `variant_label` | `text` | sim |  |  | Coluna variant_label da tabela public.sequence_step_assignments. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `assigned_at` | `timestamp with time zone` | não | `now()` |  | Coluna assigned_at da tabela public.sequence_step_assignments. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sequence_step_assignments_enrollment_id_fkey | FOREIGN KEY | `FOREIGN KEY (enrollment_id) REFERENCES sequence_enrollments(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| sequence_step_assignments_enrollment_id_step_id_key | UNIQUE | `UNIQUE (enrollment_id, step_id)` |  |  | sim |
| sequence_step_assignments_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sequence_step_assignments_step_id_fkey | FOREIGN KEY | `FOREIGN KEY (step_id) REFERENCES sequence_steps(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| sequence_step_assignments_variant_id_fkey | FOREIGN KEY | `FOREIGN KEY (variant_id) REFERENCES sequence_step_variants(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sequence_step_assignments_enrollment_id | btree | enrollment_id | não | sim |  | `CREATE INDEX idx_sequence_step_assignments_enrollment_id ON public.sequence_step_assignments USING btree (enrollment_id)` |
| idx_ssa_step | btree | step_id | não | sim |  | `CREATE INDEX idx_ssa_step ON public.sequence_step_assignments USING btree (step_id)` |
| idx_ssa_variant | btree | variant_id | não | sim |  | `CREATE INDEX idx_ssa_variant ON public.sequence_step_assignments USING btree (variant_id)` |
| sequence_step_assignments_enrollment_id_step_id_key | btree | enrollment_id, step_id | sim | sim |  | `CREATE UNIQUE INDEX sequence_step_assignments_enrollment_id_step_id_key ON public.sequence_step_assignments USING btree (enrollment_id, step_id)` |
| sequence_step_assignments_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sequence_step_assignments_pkey ON public.sequence_step_assignments USING btree (id)` |


## Policies (RLS)

### `insert assignments via sequence owner`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM (sequence_enrollments e      JOIN sequences s ON ((s.id = e.sequence_id)))   WHERE ((e.id = sequence_step_assignments.enrollment_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |

### `view assignments via sequence owner`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(EXISTS ( SELECT 1    FROM (sequence_enrollments e      JOIN sequences s ON ((s.id = e.sequence_id)))   WHERE ((e.id = sequence_step_assignments.enrollment_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
