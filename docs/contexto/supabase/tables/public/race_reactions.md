# public.race_reactions

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `season_id` | `uuid` | sim |  |  |  |
| 3 | `target_car_id` | `uuid` | não |  |  |  |
| 4 | `reactor_user_id` | `uuid` | não |  |  |  |
| 5 | `emoji` | `text` | não |  |  |  |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_reactions_emoji_check | CHECK | `CHECK (char_length(emoji) >= 1 AND char_length(emoji) <= 8)` |  |  | sim |
| race_reactions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_race_reactions_season | btree | season_id, created_at | não | sim |  | `CREATE INDEX idx_race_reactions_season ON public.race_reactions USING btree (season_id, created_at DESC)` |
| idx_race_reactions_target_created | btree | target_car_id, created_at | não | sim |  | `CREATE INDEX idx_race_reactions_target_created ON public.race_reactions USING btree (target_car_id, created_at DESC)` |
| race_reactions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_reactions_pkey ON public.race_reactions USING btree (id)` |


## Policies (RLS)

### `Reactions readable by authenticated`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Users insert own reactions`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(auth.uid() = reactor_user_id)` |


## Triggers

_nenhum_


## Grants

_nenhum_
