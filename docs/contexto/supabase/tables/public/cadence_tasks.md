# public.cadence_tasks

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `prospect_cadence_id` | `uuid` | não |  |  |  |
| 3 | `cadence_step_id` | `uuid` | não |  |  |  |
| 4 | `scheduled_date` | `date` | não |  |  |  |
| 5 | `status` | `text` | não | `'pending'::text` |  |  |
| 6 | `completed_at` | `timestamp with time zone` | sim |  |  |  |
| 7 | `notes` | `text` | sim |  |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `call_result` | `text` | sim |  |  |  |
| 10 | `priority` | `text` | sim | `'normal'::text` |  |  |
| 11 | `task_type` | `text` | sim | `'manual'::text` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cadence_tasks_cadence_step_id_fkey | FOREIGN KEY | `FOREIGN KEY (cadence_step_id) REFERENCES cadence_steps(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| cadence_tasks_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| cadence_tasks_prospect_cadence_id_fkey | FOREIGN KEY | `FOREIGN KEY (prospect_cadence_id) REFERENCES prospect_cadences(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| cadence_tasks_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'skipped'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cadence_tasks_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cadence_tasks_pkey ON public.cadence_tasks USING btree (id)` |
| idx_cadence_tasks_cadence_step_id | btree | cadence_step_id | não | sim |  | `CREATE INDEX idx_cadence_tasks_cadence_step_id ON public.cadence_tasks USING btree (cadence_step_id)` |
| idx_cadence_tasks_completed_at | btree | completed_at | não | sim |  | `CREATE INDEX idx_cadence_tasks_completed_at ON public.cadence_tasks USING btree (completed_at)` |
| idx_cadence_tasks_prospect_cadence_id | btree | prospect_cadence_id | não | sim |  | `CREATE INDEX idx_cadence_tasks_prospect_cadence_id ON public.cadence_tasks USING btree (prospect_cadence_id)` |
| idx_cadence_tasks_status | btree | status | não | sim |  | `CREATE INDEX idx_cadence_tasks_status ON public.cadence_tasks USING btree (status)` |
| idx_cadence_tasks_status_date | btree | status, scheduled_date | não | sim |  | `CREATE INDEX idx_cadence_tasks_status_date ON public.cadence_tasks USING btree (status, scheduled_date)` |


## Policies (RLS)

### `Users can delete own cadence_tasks`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((prospect_cadence_id IN ( SELECT prospect_cadences.id    FROM prospect_cadences   WHERE (prospect_cadences.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can insert own cadence_tasks`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((prospect_cadence_id IN ( SELECT prospect_cadences.id    FROM prospect_cadences   WHERE (prospect_cadences.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |

### `Users can update own cadence_tasks`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((prospect_cadence_id IN ( SELECT prospect_cadences.id    FROM prospect_cadences   WHERE (prospect_cadences.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can view own cadence_tasks or admin`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((prospect_cadence_id IN ( SELECT prospect_cadences.id    FROM prospect_cadences   WHERE (prospect_cadences.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_award_xp_on_quote_cadence_task_complete | AFTER | UPDATE | ROW | enabled | private.award_xp_on_quote_cadence_task_complete |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
