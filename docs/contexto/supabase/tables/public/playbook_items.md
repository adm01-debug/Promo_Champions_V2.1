# public.playbook_items

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
| 2 | `playbook_id` | `uuid` | não |  |  |  |
| 3 | `content` | `text` | não |  |  |  |
| 4 | `item_order` | `integer` | não | `0` |  |  |
| 5 | `is_required` | `boolean` | não | `false` |  |  |
| 6 | `item_type` | `text` | não | `'checklist'::text` |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `asset_id` | `uuid` | sim |  |  |  |
| 9 | `target_outcome` | `text` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| playbook_items_asset_id_fkey | FOREIGN KEY | `FOREIGN KEY (asset_id) REFERENCES sales_enablement_assets(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| playbook_items_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| playbook_items_playbook_id_fkey | FOREIGN KEY | `FOREIGN KEY (playbook_id) REFERENCES playbooks(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.playbook_progress | playbook_progress_playbook_item_id_fkey | playbook_item_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_playbook_items_asset_id | btree | asset_id | não | sim |  | `CREATE INDEX idx_playbook_items_asset_id ON public.playbook_items USING btree (asset_id)` |
| idx_playbook_items_playbook_id | btree | playbook_id | não | sim |  | `CREATE INDEX idx_playbook_items_playbook_id ON public.playbook_items USING btree (playbook_id)` |
| playbook_items_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX playbook_items_pkey ON public.playbook_items USING btree (id)` |


## Policies (RLS)

### `Admins and managers can delete playbook_items`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can insert playbook_items`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can update playbook_items`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated users can read playbook_items`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
