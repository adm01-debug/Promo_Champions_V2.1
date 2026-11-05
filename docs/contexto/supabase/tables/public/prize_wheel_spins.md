# public.prize_wheel_spins

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `prize_type` | `text` | não |  |  |  |
| 4 | `prize_value` | `integer` | não | `0` |  |  |
| 5 | `prize_label` | `text` | não |  |  |  |
| 6 | `trigger_type` | `text` | não | `'mission'::text` |  |  |
| 7 | `spun_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `request_id` | `uuid` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| prize_wheel_spins_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| prize_wheel_spins_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_prize_wheel_spins_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_prize_wheel_spins_salesperson_id ON public.prize_wheel_spins USING btree (salesperson_id)` |
| prize_wheel_spins_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX prize_wheel_spins_pkey ON public.prize_wheel_spins USING btree (id)` |
| prize_wheel_spins_salesperson_request_id_key | btree | salesperson_id, request_id | sim | sim | `(request_id IS NOT NULL)` | `CREATE UNIQUE INDEX prize_wheel_spins_salesperson_request_id_key ON public.prize_wheel_spins USING btree (salesperson_id, request_id) WHERE (request_id IS NOT NULL)` |


## Policies (RLS)

### `Insert own spins`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |

### `Own or admin can view spins`

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
