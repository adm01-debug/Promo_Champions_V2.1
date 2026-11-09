# public.league_history

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `league_id` | `uuid` | sim |  |  |  |
| 4 | `rank_achieved` | `integer` | sim |  |  |  |
| 5 | `xp_earned` | `integer` | sim |  |  |  |
| 6 | `season_date` | `date` | sim | `CURRENT_DATE` |  |  |
| 7 | `promoted` | `boolean` | sim | `false` |  |  |
| 8 | `demoted` | `boolean` | sim | `false` |  |  |
| 9 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| league_history_league_id_fkey | FOREIGN KEY | `FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| league_history_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| league_history_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_league_history_league_id | btree | league_id | não | sim |  | `CREATE INDEX idx_league_history_league_id ON public.league_history USING btree (league_id)` |
| idx_league_history_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_league_history_salesperson_id ON public.league_history USING btree (salesperson_id)` |
| league_history_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX league_history_pkey ON public.league_history USING btree (id)` |


## Policies (RLS)

### `Users can view their own league history`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
