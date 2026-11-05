# public.active_power_ups

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
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `power_up_type` | `text` | não |  |  |  |
| 4 | `multiplier` | `numeric` | não | `2.0` |  |  |
| 5 | `activated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 6 | `expires_at` | `timestamp with time zone` | não |  |  |  |
| 7 | `source` | `text` | sim | `'streak'::text` |  |  |
| 8 | `is_active` | `boolean` | não | `true` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| active_power_ups_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| active_power_ups_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| active_power_ups_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX active_power_ups_pkey ON public.active_power_ups USING btree (id)` |
| idx_active_power_ups_active | btree | is_active, expires_at | não | sim |  | `CREATE INDEX idx_active_power_ups_active ON public.active_power_ups USING btree (is_active, expires_at)` |
| idx_active_power_ups_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_active_power_ups_salesperson ON public.active_power_ups USING btree (salesperson_id)` |


## Policies (RLS)

### `Users can insert own power_ups`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |

### `Users can view own or admin can view all power-ups`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid()))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
