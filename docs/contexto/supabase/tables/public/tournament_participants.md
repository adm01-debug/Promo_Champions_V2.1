# public.tournament_participants

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
| 2 | `tournament_id` | `uuid` | não |  |  |  |
| 3 | `salesperson_id` | `uuid` | não |  |  |  |
| 4 | `seed` | `integer` | sim |  |  |  |
| 5 | `is_eliminated` | `boolean` | não | `false` |  |  |
| 6 | `eliminated_in_round` | `integer` | sim |  |  |  |
| 7 | `final_position` | `integer` | sim |  |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| tournament_participants_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| tournament_participants_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| tournament_participants_tournament_id_fkey | FOREIGN KEY | `FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| tournament_participants_tournament_id_salesperson_id_key | UNIQUE | `UNIQUE (tournament_id, salesperson_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_champ_tournament_participants_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_champ_tournament_participants_salesperson_id ON public.tournament_participants USING btree (salesperson_id)` |
| idx_tournament_participants_tournament_id | btree | tournament_id | não | sim |  | `CREATE INDEX idx_tournament_participants_tournament_id ON public.tournament_participants USING btree (tournament_id)` |
| tournament_participants_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX tournament_participants_pkey ON public.tournament_participants USING btree (id)` |
| tournament_participants_tournament_id_salesperson_id_key | btree | tournament_id, salesperson_id | sim | sim |  | `CREATE UNIQUE INDEX tournament_participants_tournament_id_salesperson_id_key ON public.tournament_participants USING btree (tournament_id, salesperson_id)` |


## Policies (RLS)

### `Auth users can read participants`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Users can insert own tournament_participants`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |

### `Users can update own tournament_participants`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
