# public.salesperson_leagues

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
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `league` | `sales_league` | não | `'bronze'::sales_league` |  |  |
| 4 | `season_number` | `integer` | não | `1` |  |  |
| 5 | `promoted_at` | `timestamp with time zone` | sim |  |  |  |
| 6 | `demoted_at` | `timestamp with time zone` | sim |  |  |  |
| 7 | `points` | `integer` | não | `0` |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| salesperson_leagues_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| salesperson_leagues_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| salesperson_leagues_salesperson_id_season_number_key | UNIQUE | `UNIQUE (salesperson_id, season_number)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_salesperson_leagues_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_salesperson_leagues_salesperson_id ON public.salesperson_leagues USING btree (salesperson_id)` |
| salesperson_leagues_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX salesperson_leagues_pkey ON public.salesperson_leagues USING btree (id)` |
| salesperson_leagues_salesperson_id_season_number_key | btree | salesperson_id, season_number | sim | sim |  | `CREATE UNIQUE INDEX salesperson_leagues_salesperson_id_season_number_key ON public.salesperson_leagues USING btree (salesperson_id, season_number)` |


## Policies (RLS)

### `Anyone can read leagues`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `System can manage leagues`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

_nenhum_
