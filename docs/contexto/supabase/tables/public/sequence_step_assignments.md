# public.sequence_step_assignments

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `enrollment_id` | `uuid` | não |  |  |  |
| 3 | `step_id` | `uuid` | não |  |  |  |
| 4 | `variant_id` | `uuid` | sim |  |  |  |
| 5 | `variant_label` | `text` | sim |  |  |  |
| 6 | `assigned_at` | `timestamp with time zone` | não | `now()` |  |  |


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

_nenhum_
