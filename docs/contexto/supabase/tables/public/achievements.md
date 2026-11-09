# public.achievements

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
| 3 | `achievement_type` | `text` | não | `'daily_goal'::text` |  |  |
| 4 | `achievement_date` | `date` | não | `CURRENT_DATE` |  |  |
| 5 | `details` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| achievements_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| achievements_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE RESTRICT` | RESTRICT | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| achievements_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX achievements_pkey ON public.achievements USING btree (id)` |
| idx_achievements_date | btree | achievement_date | não | sim |  | `CREATE INDEX idx_achievements_date ON public.achievements USING btree (achievement_date DESC)` |
| idx_achievements_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_achievements_salesperson ON public.achievements USING btree (salesperson_id)` |
| idx_achievements_sp_type_date | btree | salesperson_id, achievement_type, achievement_date | não | sim |  | `CREATE INDEX idx_achievements_sp_type_date ON public.achievements USING btree (salesperson_id, achievement_type, achievement_date)` |
| idx_achievements_type | btree | achievement_type | não | sim |  | `CREATE INDEX idx_achievements_type ON public.achievements USING btree (achievement_type)` |


## Policies (RLS)

### `Authenticated users can read achievements`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Users can insert own achievements`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
