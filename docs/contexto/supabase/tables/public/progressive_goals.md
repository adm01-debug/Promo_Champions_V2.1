# public.progressive_goals

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
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `goal_type` | `text` | não | `'revenue'::text` |  |  |
| 4 | `current_level` | `integer` | não | `1` |  |  |
| 5 | `current_target` | `numeric` | não | `10000` |  |  |
| 6 | `current_progress` | `numeric` | não | `0` |  |  |
| 7 | `multiplier` | `numeric` | não | `1.3` |  |  |
| 8 | `completed_levels` | `integer` | não | `0` |  |  |
| 9 | `total_xp_earned` | `integer` | não | `0` |  |  |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| progressive_goals_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| progressive_goals_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| progressive_goals_salesperson_id_goal_type_key | UNIQUE | `UNIQUE (salesperson_id, goal_type)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_progressive_goals_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_progressive_goals_salesperson_id ON public.progressive_goals USING btree (salesperson_id)` |
| progressive_goals_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX progressive_goals_pkey ON public.progressive_goals USING btree (id)` |
| progressive_goals_salesperson_id_goal_type_key | btree | salesperson_id, goal_type | sim | sim |  | `CREATE UNIQUE INDEX progressive_goals_salesperson_id_goal_type_key ON public.progressive_goals USING btree (salesperson_id, goal_type)` |


## Policies (RLS)

### `Admins can update progressive_goals`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Users can insert own goals`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |

### `Users can view own goals or admin`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


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
