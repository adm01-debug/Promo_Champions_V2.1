# public.race_team_members

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
| 2 | `team_id` | `uuid` | não |  |  |  |
| 3 | `car_id` | `uuid` | não |  |  |  |
| 4 | `joined_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_team_members_car_id_fkey | FOREIGN KEY | `FOREIGN KEY (car_id) REFERENCES race_cars(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| race_team_members_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| race_team_members_team_id_car_id_key | UNIQUE | `UNIQUE (team_id, car_id)` |  |  | sim |
| race_team_members_team_id_fkey | FOREIGN KEY | `FOREIGN KEY (team_id) REFERENCES race_teams(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_race_team_members_car | btree | car_id | não | sim |  | `CREATE INDEX idx_race_team_members_car ON public.race_team_members USING btree (car_id)` |
| idx_race_team_members_car_per_season | btree | car_id, team_id | sim | sim |  | `CREATE UNIQUE INDEX idx_race_team_members_car_per_season ON public.race_team_members USING btree (car_id, team_id)` |
| idx_race_team_members_team | btree | team_id | não | sim |  | `CREATE INDEX idx_race_team_members_team ON public.race_team_members USING btree (team_id)` |
| race_team_members_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_team_members_pkey ON public.race_team_members USING btree (id)` |
| race_team_members_team_id_car_id_key | btree | team_id, car_id | sim | sim |  | `CREATE UNIQUE INDEX race_team_members_team_id_car_id_key ON public.race_team_members USING btree (team_id, car_id)` |


## Policies (RLS)

### `Admins manage team members`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Authenticated users can view team members`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
