# public.territory_history

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `territory_id` | `uuid` | não |  |  |  |
| 3 | `salesperson_id` | `uuid` | não |  |  |  |
| 4 | `revenue_contribution` | `numeric` | não | `0` |  |  |
| 5 | `deals_count` | `integer` | não | `0` |  |  |
| 6 | `conquered_at` | `timestamp with time zone` | sim |  |  |  |
| 7 | `lost_at` | `timestamp with time zone` | sim |  |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| territory_history_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| territory_history_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| territory_history_territory_id_fkey | FOREIGN KEY | `FOREIGN KEY (territory_id) REFERENCES territories(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_territory_history_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_territory_history_salesperson_id ON public.territory_history USING btree (salesperson_id)` |
| idx_territory_history_territory_id | btree | territory_id | não | sim |  | `CREATE INDEX idx_territory_history_territory_id ON public.territory_history USING btree (territory_id)` |
| territory_history_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX territory_history_pkey ON public.territory_history USING btree (id)` |


## Policies (RLS)

### `Admins can insert territory_history`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Auth users can read territory history`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Users can read own territory_history`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
