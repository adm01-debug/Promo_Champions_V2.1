# public.race_teams

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
| 2 | `season_id` | `uuid` | não |  |  |  |
| 3 | `name` | `text` | não |  |  |  |
| 4 | `color_primary` | `text` | não | `'#dc2626'::text` |  |  |
| 5 | `color_secondary` | `text` | não | `'#fbbf24'::text` |  |  |
| 6 | `emoji` | `text` | sim | `'🏎️'::text` |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_teams_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| race_teams_season_id_fkey | FOREIGN KEY | `FOREIGN KEY (season_id) REFERENCES race_seasons(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| race_teams_season_id_name_key | UNIQUE | `UNIQUE (season_id, name)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.race_team_members | race_team_members_team_id_fkey | team_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_race_teams_season | btree | season_id | não | sim |  | `CREATE INDEX idx_race_teams_season ON public.race_teams USING btree (season_id)` |
| race_teams_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_teams_pkey ON public.race_teams USING btree (id)` |
| race_teams_season_id_name_key | btree | season_id, name | sim | sim |  | `CREATE UNIQUE INDEX race_teams_season_id_name_key ON public.race_teams USING btree (season_id, name)` |


## Policies (RLS)

### `Admins manage teams`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Authenticated users can view teams`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_race_teams_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
