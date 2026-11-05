# public.sales_battles

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `title` | `text` | não |  |  |  |
| 3 | `battle_type` | `text` | não | `'1v1'::text` |  |  |
| 4 | `metric` | `text` | não | `'calls'::text` |  |  |
| 5 | `target_value` | `integer` | sim | `0` |  |  |
| 6 | `starts_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `ends_at` | `timestamp with time zone` | não |  |  |  |
| 8 | `status` | `text` | não | `'active'::text` |  |  |
| 9 | `winner_id` | `uuid` | sim |  |  |  |
| 10 | `xp_reward` | `integer` | não | `100` |  |  |
| 11 | `created_by` | `uuid` | sim |  |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sales_battles_created_by_fkey | FOREIGN KEY | `FOREIGN KEY (created_by) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| sales_battles_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sales_battles_winner_id_fkey | FOREIGN KEY | `FOREIGN KEY (winner_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.battle_participants | battle_participants_battle_id_fkey | battle_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sales_battles_created_by | btree | created_by | não | sim |  | `CREATE INDEX idx_sales_battles_created_by ON public.sales_battles USING btree (created_by)` |
| idx_sales_battles_winner_id | btree | winner_id | não | sim |  | `CREATE INDEX idx_sales_battles_winner_id ON public.sales_battles USING btree (winner_id)` |
| sales_battles_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sales_battles_pkey ON public.sales_battles USING btree (id)` |


## Policies (RLS)

### `Admins can manage battles`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated can read sales_battles`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() IS NOT NULL)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| tr_notify_battle_victory | AFTER | UPDATE | ROW | enabled | public.fn_notify_victory |
| tr_victory_battle | AFTER | UPDATE | ROW | enabled | public.auto_victory_post |


## Grants

_nenhum_
