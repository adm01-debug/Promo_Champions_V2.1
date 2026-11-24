# public.daily_streak_achievements

> Conquistas registradas por sequências diárias de atividade ou desempenho.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único da conquista de sequência. |
| 2 | `salesperson_id` | `uuid` | não |  |  | Vendedor que alcançou a sequência. |
| 3 | `streak_type` | `text` | não |  |  | Tipo de sequência alcançada. |
| 4 | `achieved_at` | `timestamp with time zone` | não | `now()` |  | Data e hora em que a conquista foi alcançada. |
| 5 | `streak_count` | `integer` | não |  |  | Quantidade de dias consecutivos da sequência. |
| 6 | `xp_awarded` | `integer` | não | `0` |  | Quantidade de XP concedida pela conquista. |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de registro da conquista. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| daily_streak_achievements_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| daily_streak_achievements_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| daily_streak_achievements_salesperson_id_streak_type_key | UNIQUE | `UNIQUE (salesperson_id, streak_type)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| daily_streak_achievements_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX daily_streak_achievements_pkey ON public.daily_streak_achievements USING btree (id)` |
| daily_streak_achievements_salesperson_id_streak_type_key | btree | salesperson_id, streak_type | sim | sim |  | `CREATE UNIQUE INDEX daily_streak_achievements_salesperson_id_streak_type_key ON public.daily_streak_achievements USING btree (salesperson_id, streak_type)` |
| idx_daily_streak_achievements_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_daily_streak_achievements_salesperson ON public.daily_streak_achievements USING btree (salesperson_id)` |


## Policies (RLS)

### `Users can read own daily_streak_achievements`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
