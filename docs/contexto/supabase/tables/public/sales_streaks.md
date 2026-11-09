# public.sales_streaks

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `current_streak` | `integer` | não | `0` |  |  |
| 4 | `longest_streak` | `integer` | não | `0` |  |  |
| 5 | `last_sale_date` | `date` | sim |  |  |  |
| 6 | `xp_multiplier` | `numeric(3,1)` | não | `1.0` |  |  |
| 7 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sales_streaks_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sales_streaks_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| sales_streaks_salesperson_id_key | UNIQUE | `UNIQUE (salesperson_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| sales_streaks_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sales_streaks_pkey ON public.sales_streaks USING btree (id)` |
| sales_streaks_salesperson_id_key | btree | salesperson_id | sim | sim |  | `CREATE UNIQUE INDEX sales_streaks_salesperson_id_key ON public.sales_streaks USING btree (salesperson_id)` |


## Policies (RLS)

### `Admins can update sales_streaks`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Anyone can read streaks`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Insert own streak`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
