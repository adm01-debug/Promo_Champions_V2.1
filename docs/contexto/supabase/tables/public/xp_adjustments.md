# public.xp_adjustments

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
| 2 | `user_id` | `uuid` | não |  |  |  |
| 3 | `amount` | `integer` | não |  |  |  |
| 4 | `reason` | `text` | não |  |  |  |
| 5 | `source` | `text` | não | `'manual'::text` |  |  |
| 6 | `related_assignment_id` | `uuid` | sim |  |  |  |
| 7 | `adjusted_by` | `uuid` | não |  |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| xp_adjustments_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| xp_adjustments_related_assignment_id_fkey | FOREIGN KEY | `FOREIGN KEY (related_assignment_id) REFERENCES task_assignments(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_xp_adjustments_created | btree | created_at | não | sim |  | `CREATE INDEX idx_xp_adjustments_created ON public.xp_adjustments USING btree (created_at DESC)` |
| idx_xp_adjustments_related_assignment_id | btree | related_assignment_id | não | sim |  | `CREATE INDEX idx_xp_adjustments_related_assignment_id ON public.xp_adjustments USING btree (related_assignment_id)` |
| idx_xp_adjustments_user | btree | user_id | não | sim |  | `CREATE INDEX idx_xp_adjustments_user ON public.xp_adjustments USING btree (user_id)` |
| xp_adjustments_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX xp_adjustments_pkey ON public.xp_adjustments USING btree (id)` |


## Policies (RLS)

### `Admin can insert xp adjustments`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Admin can view xp adjustments`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR (user_id = auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
