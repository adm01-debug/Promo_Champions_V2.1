# public.collectible_badges

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
| 3 | `description` | `text` | sim |  |  |  |
| 4 | `icon` | `text` | não | `'🏅'::text` |  |  |
| 5 | `category` | `text` | não | `'general'::text` |  |  |
| 6 | `rarity` | `text` | não | `'common'::text` |  |  |
| 7 | `unlock_condition` | `text` | não |  |  |  |
| 8 | `unlock_threshold` | `integer` | não | `1` |  |  |
| 9 | `xp_reward` | `integer` | não | `50` |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| collectible_badges_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.salesperson_badges | salesperson_badges_badge_id_fkey | badge_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| collectible_badges_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX collectible_badges_pkey ON public.collectible_badges USING btree (id)` |


## Policies (RLS)

### `Anyone authenticated can view badges`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() IS NOT NULL)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
