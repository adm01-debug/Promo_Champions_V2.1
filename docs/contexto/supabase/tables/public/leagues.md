# public.leagues

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
| 2 | `name` | `text` | não |  |  |  |
| 3 | `tier` | `integer` | não | `1` |  |  |
| 4 | `icon` | `text` | não | `'🥉'::text` |  |  |
| 5 | `color` | `text` | não | `'#94a3b8'::text` |  |  |
| 6 | `min_xp` | `integer` | não | `0` |  |  |
| 7 | `xp_bonus_percent` | `integer` | não | `0` |  |  |
| 8 | `promotion_slots` | `integer` | não | `3` |  |  |
| 9 | `demotion_slots` | `integer` | não | `3` |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| leagues_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.league_history | league_history_league_id_fkey | league_id | CASCADE |
| public.league_members | league_members_league_id_fkey | league_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| leagues_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX leagues_pkey ON public.leagues USING btree (id)` |


## Policies (RLS)

### `Anyone can read leagues`

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
