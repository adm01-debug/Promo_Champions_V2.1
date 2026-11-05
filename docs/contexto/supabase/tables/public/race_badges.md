# public.race_badges

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
| 3 | `badge_code` | `text` | não |  |  |  |
| 4 | `season_id` | `uuid` | sim |  |  |  |
| 5 | `earned_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_badges_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| race_badges_salesperson_id_badge_code_season_id_key | UNIQUE | `UNIQUE (salesperson_id, badge_code, season_id)` |  |  | sim |
| race_badges_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| race_badges_season_id_fkey | FOREIGN KEY | `FOREIGN KEY (season_id) REFERENCES race_seasons(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| race_badges_unique_per_season | UNIQUE | `UNIQUE (salesperson_id, badge_code, season_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_champ_race_badges_season_id | btree | season_id | não | sim |  | `CREATE INDEX idx_champ_race_badges_season_id ON public.race_badges USING btree (season_id)` |
| idx_race_badges_sp | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_race_badges_sp ON public.race_badges USING btree (salesperson_id)` |
| race_badges_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_badges_pkey ON public.race_badges USING btree (id)` |
| race_badges_salesperson_id_badge_code_season_id_key | btree | salesperson_id, badge_code, season_id | sim | sim |  | `CREATE UNIQUE INDEX race_badges_salesperson_id_badge_code_season_id_key ON public.race_badges USING btree (salesperson_id, badge_code, season_id)` |
| race_badges_unique_per_season | btree | salesperson_id, badge_code, season_id | sim | sim |  | `CREATE UNIQUE INDEX race_badges_unique_per_season ON public.race_badges USING btree (salesperson_id, badge_code, season_id)` |


## Policies (RLS)

### `view_race_badges`

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

_nenhum_
