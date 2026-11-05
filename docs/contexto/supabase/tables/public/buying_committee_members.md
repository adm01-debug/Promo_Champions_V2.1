# public.buying_committee_members

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
| 2 | `sale_id` | `uuid` | não |  |  |  |
| 3 | `contact_name` | `text` | não |  |  |  |
| 4 | `contact_email` | `text` | sim |  |  |  |
| 5 | `job_title` | `text` | sim |  |  |  |
| 6 | `committee_role` | `text` | não | `'user'::text` |  |  |
| 7 | `influence_level` | `integer` | não | `3` |  |  |
| 8 | `sentiment` | `text` | não | `'neutral'::text` |  |  |
| 9 | `is_single_threaded` | `boolean` | sim | `false` |  |  |
| 10 | `notes` | `text` | sim |  |  |  |
| 11 | `created_by` | `uuid` | sim |  |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| buying_committee_members_influence_level_check | CHECK | `CHECK (influence_level >= 1 AND influence_level <= 5)` |  |  | sim |
| buying_committee_members_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| buying_committee_members_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| buying_committee_members_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX buying_committee_members_pkey ON public.buying_committee_members USING btree (id)` |
| idx_bcm_sale | btree | sale_id | não | sim |  | `CREATE INDEX idx_bcm_sale ON public.buying_committee_members USING btree (sale_id)` |


## Policies (RLS)

### `bcm_delete`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = buying_committee_members.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |

### `bcm_insert`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = buying_committee_members.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |

### `bcm_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = buying_committee_members.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |

### `bcm_update`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = buying_committee_members.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_bcm_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
