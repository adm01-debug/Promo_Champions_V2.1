# public.experiment_assignments

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
| 1 | `user_id` | `uuid` | não |  |  |  |
| 2 | `experiment_id` | `uuid` | não |  |  |  |
| 3 | `variant_id` | `uuid` | não |  |  |  |
| 4 | `assigned_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| experiment_assignments_experiment_id_fkey | FOREIGN KEY | `FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| experiment_assignments_pkey | PRIMARY KEY | `PRIMARY KEY (user_id, experiment_id)` |  |  | sim |
| experiment_assignments_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| experiment_assignments_variant_id_fkey | FOREIGN KEY | `FOREIGN KEY (variant_id) REFERENCES experiment_variants(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| experiment_assignments_pkey | btree | user_id, experiment_id | sim | sim |  | `CREATE UNIQUE INDEX experiment_assignments_pkey ON public.experiment_assignments USING btree (user_id, experiment_id)` |
| idx_experiment_assignments_experiment_id_fk | btree | experiment_id | não | sim |  | `CREATE INDEX idx_experiment_assignments_experiment_id_fk ON public.experiment_assignments USING btree (experiment_id)` |
| idx_experiment_assignments_variant_id_fk | btree | variant_id | não | sim |  | `CREATE INDEX idx_experiment_assignments_variant_id_fk ON public.experiment_assignments USING btree (variant_id)` |


## Policies (RLS)

### `Admins and managers can manage experiment_assignments`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Users can read their own experiment assignments`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((auth.uid() = user_id) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
