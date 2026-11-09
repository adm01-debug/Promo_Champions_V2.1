# public.activity_goals

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
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `calls_goal` | `integer` | não | `30` |  |  |
| 4 | `emails_goal` | `integer` | não | `20` |  |  |
| 5 | `meetings_goal` | `integer` | não | `3` |  |  |
| 6 | `linkedin_goal` | `integer` | não | `10` |  |  |
| 7 | `whatsapp_goal` | `integer` | não | `15` |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| activity_goals_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| activity_goals_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE RESTRICT` | RESTRICT | NO ACTION | sim |
| activity_goals_salesperson_id_key | UNIQUE | `UNIQUE (salesperson_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| activity_goals_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX activity_goals_pkey ON public.activity_goals USING btree (id)` |
| activity_goals_salesperson_id_key | btree | salesperson_id | sim | sim |  | `CREATE UNIQUE INDEX activity_goals_salesperson_id_key ON public.activity_goals USING btree (salesperson_id)` |
| idx_activity_goals_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_activity_goals_salesperson_id ON public.activity_goals USING btree (salesperson_id)` |


## Policies (RLS)

### `Admins can delete activity_goals`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Users can insert own activity_goals`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |

### `Users can update own activity_goals`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can view own activity_goals or admin`

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
| update_activity_goals_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
