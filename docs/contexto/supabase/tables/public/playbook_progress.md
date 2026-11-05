# public.playbook_progress

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 6 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `playbook_item_id` | `uuid` | não |  |  |  |
| 3 | `sale_id` | `uuid` | não |  |  |  |
| 4 | `completed_at` | `timestamp with time zone` | não | `now()` |  |  |
| 5 | `completed_by` | `uuid` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| playbook_progress_completed_by_fkey | FOREIGN KEY | `FOREIGN KEY (completed_by) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| playbook_progress_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| playbook_progress_playbook_item_id_fkey | FOREIGN KEY | `FOREIGN KEY (playbook_item_id) REFERENCES playbook_items(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| playbook_progress_playbook_item_id_sale_id_key | UNIQUE | `UNIQUE (playbook_item_id, sale_id)` |  |  | sim |
| playbook_progress_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_champ_playbook_progress_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_champ_playbook_progress_sale_id ON public.playbook_progress USING btree (sale_id)` |
| idx_playbook_progress_completed_by | btree | completed_by | não | sim |  | `CREATE INDEX idx_playbook_progress_completed_by ON public.playbook_progress USING btree (completed_by)` |
| idx_playbook_progress_playbook_item_id | btree | playbook_item_id | não | sim |  | `CREATE INDEX idx_playbook_progress_playbook_item_id ON public.playbook_progress USING btree (playbook_item_id)` |
| playbook_progress_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX playbook_progress_pkey ON public.playbook_progress USING btree (id)` |
| playbook_progress_playbook_item_id_sale_id_key | btree | playbook_item_id, sale_id | sim | sim |  | `CREATE UNIQUE INDEX playbook_progress_playbook_item_id_sale_id_key ON public.playbook_progress USING btree (playbook_item_id, sale_id)` |


## Policies (RLS)

### `Allow read for all authenticated`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'authenticated'::text)` |
| WITH CHECK |  |

### `Allow update for own completion`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = completed_by)` |
| WITH CHECK |  |

### `Users can delete own playbook_progress`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((completed_by = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can insert own playbook_progress`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((completed_by = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |

### `Users can update own playbook_progress`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((completed_by = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can view own playbook_progress or admin`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((completed_by = get_current_salesperson_id()) OR (sale_id IN ( SELECT sales.id    FROM sales   WHERE (sales.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
