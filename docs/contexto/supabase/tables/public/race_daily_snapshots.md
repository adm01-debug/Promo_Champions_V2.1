# public.race_daily_snapshots

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
| 3 | `salesperson_id` | `uuid` | não |  |  |  |
| 4 | `snapshot_date` | `date` | não | `((now() AT TIME ZONE 'America/Sao_Paulo'::text))::date` |  |  |
| 5 | `rank` | `integer` | não |  |  |  |
| 6 | `progress` | `numeric` | não | `0` |  |  |
| 7 | `total_sales` | `numeric` | não | `0` |  |  |
| 8 | `deals_count` | `integer` | não | `0` |  |  |
| 9 | `score` | `numeric` | sim |  |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_daily_snapshots_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| race_daily_snapshots_season_id_fkey | FOREIGN KEY | `FOREIGN KEY (season_id) REFERENCES race_seasons(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| race_daily_snapshots_season_id_salesperson_id_snapshot_date_key | UNIQUE | `UNIQUE (season_id, salesperson_id, snapshot_date)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_race_daily_snapshots_lookup | btree | salesperson_id, season_id, snapshot_date | não | sim |  | `CREATE INDEX idx_race_daily_snapshots_lookup ON public.race_daily_snapshots USING btree (salesperson_id, season_id, snapshot_date DESC)` |
| idx_race_daily_snapshots_season_id | btree | season_id | não | sim |  | `CREATE INDEX idx_race_daily_snapshots_season_id ON public.race_daily_snapshots USING btree (season_id)` |
| race_daily_snapshots_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_daily_snapshots_pkey ON public.race_daily_snapshots USING btree (id)` |
| race_daily_snapshots_season_id_salesperson_id_snapshot_date_key | btree | season_id, salesperson_id, snapshot_date | sim | sim |  | `CREATE UNIQUE INDEX race_daily_snapshots_season_id_salesperson_id_snapshot_date_key ON public.race_daily_snapshots USING btree (season_id, salesperson_id, snapshot_date)` |


## Policies (RLS)

### `race_daily_snapshots_admin_manage`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `race_daily_snapshots_select_authenticated`

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
