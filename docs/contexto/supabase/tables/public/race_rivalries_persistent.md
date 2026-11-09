# public.race_rivalries_persistent

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
| 2 | `season_id` | `uuid` | não |  |  |  |
| 3 | `car_id` | `uuid` | não |  |  |  |
| 4 | `rival_car_id` | `uuid` | não |  |  |  |
| 5 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 6 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_rivalries_persistent_car_id_fkey | FOREIGN KEY | `FOREIGN KEY (car_id) REFERENCES race_cars(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| race_rivalries_persistent_check | CHECK | `CHECK (car_id <> rival_car_id)` |  |  | sim |
| race_rivalries_persistent_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| race_rivalries_persistent_rival_car_id_fkey | FOREIGN KEY | `FOREIGN KEY (rival_car_id) REFERENCES race_cars(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| race_rivalries_persistent_season_id_car_id_key | UNIQUE | `UNIQUE (season_id, car_id)` |  |  | sim |
| race_rivalries_persistent_season_id_fkey | FOREIGN KEY | `FOREIGN KEY (season_id) REFERENCES race_seasons(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_race_rivalries_persistent_car | btree | car_id | não | sim |  | `CREATE INDEX idx_race_rivalries_persistent_car ON public.race_rivalries_persistent USING btree (car_id)` |
| idx_race_rivalries_persistent_rival_car_id | btree | rival_car_id | não | sim |  | `CREATE INDEX idx_race_rivalries_persistent_rival_car_id ON public.race_rivalries_persistent USING btree (rival_car_id)` |
| idx_race_rivalries_persistent_season | btree | season_id | não | sim |  | `CREATE INDEX idx_race_rivalries_persistent_season ON public.race_rivalries_persistent USING btree (season_id)` |
| race_rivalries_persistent_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_rivalries_persistent_pkey ON public.race_rivalries_persistent USING btree (id)` |
| race_rivalries_persistent_season_id_car_id_key | btree | season_id, car_id | sim | sim |  | `CREATE UNIQUE INDEX race_rivalries_persistent_season_id_car_id_key ON public.race_rivalries_persistent USING btree (season_id, car_id)` |


## Policies (RLS)

### `Admins manage all rivalries`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Authenticated users can view rivalries`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Owners can manage own rivalry`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(EXISTS ( SELECT 1    FROM (race_cars rc      JOIN salespeople sp ON ((sp.id = rc.salesperson_id)))   WHERE ((rc.id = race_rivalries_persistent.car_id) AND (sp.auth_user_id = auth.uid()))))` |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM (race_cars rc      JOIN salespeople sp ON ((sp.id = rc.salesperson_id)))   WHERE ((rc.id = race_rivalries_persistent.car_id) AND (sp.auth_user_id = auth.uid()))))` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_race_rivalries_persistent_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
