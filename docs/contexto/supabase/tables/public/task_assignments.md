# public.task_assignments

> Tabela public.task_assignments. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), catalog_id uuid NOT NULL, assigned_to uuid NOT NULL, assigned_by uuid NOT NULL, due_date date NULLABLE, status task_assignment_status NOT NULL DEFAULT 'pending'::task_assignment_status, submission_note text NULLABLE, reviewed_by uuid NULLABLE, reviewed_at timestamp with time zone NULLABLE, xp_granted integer NULLABLE DEFAULT 0, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), squad_id uuid NULLABLE, recurrence_rule text NULLABLE, parent_recurrence_id uuid NULLABLE. Relacionamentos FK: catalog_id → public.task_catalog(id); squad_id → public.squads(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.task_assignments. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `catalog_id` | `uuid` | não |  |  | Coluna catalog_id da tabela public.task_assignments. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.task_catalog(id). |
| 3 | `assigned_to` | `uuid` | não |  |  | Coluna assigned_to da tabela public.task_assignments. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 4 | `assigned_by` | `uuid` | não |  |  | Coluna assigned_by da tabela public.task_assignments. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 5 | `due_date` | `date` | sim |  |  | Coluna due_date da tabela public.task_assignments. Tipo PostgreSQL: date. Aceita NULL. |
| 6 | `status` | `task_assignment_status` | não | `'pending'::task_assignment_status` |  | Coluna status da tabela public.task_assignments. Tipo PostgreSQL: task_assignment_status. Não aceita NULL. Valor padrão: 'pending'::task_assignment_status. Valores do enum: 'pending', 'in_progress', 'submitted', 'approved', 'rejected'. |
| 7 | `submission_note` | `text` | sim |  |  | Coluna submission_note da tabela public.task_assignments. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `reviewed_by` | `uuid` | sim |  |  | Coluna reviewed_by da tabela public.task_assignments. Tipo PostgreSQL: uuid. Aceita NULL. |
| 9 | `reviewed_at` | `timestamp with time zone` | sim |  |  | Coluna reviewed_at da tabela public.task_assignments. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 10 | `xp_granted` | `integer` | sim | `0` |  | Coluna xp_granted da tabela public.task_assignments. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 0. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.task_assignments. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.task_assignments. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 13 | `squad_id` | `uuid` | sim |  |  | Coluna squad_id da tabela public.task_assignments. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.squads(id). |
| 14 | `recurrence_rule` | `text` | sim |  |  | Coluna recurrence_rule da tabela public.task_assignments. Tipo PostgreSQL: text. Aceita NULL. |
| 15 | `parent_recurrence_id` | `uuid` | sim |  |  | Coluna parent_recurrence_id da tabela public.task_assignments. Tipo PostgreSQL: uuid. Aceita NULL. |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
