# public.battle_participants

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
| 2 | `battle_id` | `uuid` | não |  |  |  |
| 3 | `salesperson_id` | `uuid` | não |  |  |  |
| 4 | `team_name` | `text` | sim |  |  |  |
| 5 | `current_score` | `integer` | não | `0` |  |  |
| 6 | `joined_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| battle_participants_battle_id_fkey | FOREIGN KEY | `FOREIGN KEY (battle_id) REFERENCES sales_battles(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| battle_participants_battle_id_salesperson_id_key | UNIQUE | `UNIQUE (battle_id, salesperson_id)` |  |  | sim |
| battle_participants_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| battle_participants_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| battle_participants_battle_id_salesperson_id_key | btree | battle_id, salesperson_id | sim | sim |  | `CREATE UNIQUE INDEX battle_participants_battle_id_salesperson_id_key ON public.battle_participants USING btree (battle_id, salesperson_id)` |
| battle_participants_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX battle_participants_pkey ON public.battle_participants USING btree (id)` |
| idx_battle_participants_battle_id | btree | battle_id | não | sim |  | `CREATE INDEX idx_battle_participants_battle_id ON public.battle_participants USING btree (battle_id)` |
| idx_champ_battle_participants_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_champ_battle_participants_salesperson_id ON public.battle_participants USING btree (salesperson_id)` |


## Policies (RLS)

### `Admins can update participants`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated can read battle_participants`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() IS NOT NULL)` |
| WITH CHECK |  |

### `Users can join battles as self`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |


## Triggers

_nenhum_


## Grants

_nenhum_
