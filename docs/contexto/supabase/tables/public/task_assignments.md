# public.task_assignments

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `catalog_id` | `uuid` | não |  |  |  |
| 3 | `assigned_to` | `uuid` | não |  |  |  |
| 4 | `assigned_by` | `uuid` | não |  |  |  |
| 5 | `due_date` | `date` | sim |  |  |  |
| 6 | `status` | `task_assignment_status` | não | `'pending'::task_assignment_status` |  |  |
| 7 | `submission_note` | `text` | sim |  |  |  |
| 8 | `reviewed_by` | `uuid` | sim |  |  |  |
| 9 | `reviewed_at` | `timestamp with time zone` | sim |  |  |  |
| 10 | `xp_granted` | `integer` | sim | `0` |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 13 | `squad_id` | `uuid` | sim |  |  |  |
| 14 | `recurrence_rule` | `text` | sim |  |  |  |
| 15 | `parent_recurrence_id` | `uuid` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| task_assignments_catalog_id_fkey | FOREIGN KEY | `FOREIGN KEY (catalog_id) REFERENCES task_catalog(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| task_assignments_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| task_assignments_squad_id_fkey | FOREIGN KEY | `FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.xp_adjustments | xp_adjustments_related_assignment_id_fkey | related_assignment_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_task_assignments_assigned_to | btree | assigned_to | não | sim |  | `CREATE INDEX idx_task_assignments_assigned_to ON public.task_assignments USING btree (assigned_to)` |
| idx_task_assignments_catalog | btree | catalog_id | não | sim |  | `CREATE INDEX idx_task_assignments_catalog ON public.task_assignments USING btree (catalog_id)` |
| idx_task_assignments_parent_recurrence | btree | parent_recurrence_id | não | sim |  | `CREATE INDEX idx_task_assignments_parent_recurrence ON public.task_assignments USING btree (parent_recurrence_id)` |
| idx_task_assignments_squad | btree | squad_id | não | sim |  | `CREATE INDEX idx_task_assignments_squad ON public.task_assignments USING btree (squad_id)` |
| idx_task_assignments_status | btree | status | não | sim |  | `CREATE INDEX idx_task_assignments_status ON public.task_assignments USING btree (status)` |
| task_assignments_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX task_assignments_pkey ON public.task_assignments USING btree (id)` |


## Policies (RLS)

### `Admin can delete assignments`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Admin can insert assignments`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Admin updates any, user updates own progress`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR ((assigned_to = auth.uid()) AND (status = ANY (ARRAY['pending'::task_assignment_status, 'in_progress'::task_assignment_status, 'submitted'::task_assignment_status]))))` |
| WITH CHECK |  |

### `Users view own or admin views all assignments`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((assigned_to = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_task_assignments_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
