# public.salesperson_badges

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `badge_id` | `uuid` | não |  |  |  |
| 4 | `earned_at` | `timestamp with time zone` | não | `now()` |  |  |
| 5 | `is_showcase` | `boolean` | não | `false` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| salesperson_badges_badge_id_fkey | FOREIGN KEY | `FOREIGN KEY (badge_id) REFERENCES collectible_badges(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| salesperson_badges_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| salesperson_badges_salesperson_id_badge_id_key | UNIQUE | `UNIQUE (salesperson_id, badge_id)` |  |  | sim |
| salesperson_badges_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_champ_salesperson_badges_badge_id | btree | badge_id | não | sim |  | `CREATE INDEX idx_champ_salesperson_badges_badge_id ON public.salesperson_badges USING btree (badge_id)` |
| idx_salesperson_badges_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_salesperson_badges_salesperson_id ON public.salesperson_badges USING btree (salesperson_id)` |
| salesperson_badges_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX salesperson_badges_pkey ON public.salesperson_badges USING btree (id)` |
| salesperson_badges_salesperson_id_badge_id_key | btree | salesperson_id, badge_id | sim | sim |  | `CREATE UNIQUE INDEX salesperson_badges_salesperson_id_badge_id_key ON public.salesperson_badges USING btree (salesperson_id, badge_id)` |


## Policies (RLS)

### `Authenticated can view earned badges`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `System can insert badges`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |

### `Users can update own badges`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
