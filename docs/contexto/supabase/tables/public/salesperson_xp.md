# public.salesperson_xp

> Resumo do total de XP e do nível atual de cada vendedor.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do resumo de XP. |
| 2 | `salesperson_id` | `uuid` | não |  |  | Vendedor a que o resumo de XP pertence. |
| 3 | `total_xp` | `integer` | não | `0` |  | Quantidade total de pontos de experiência acumulados. |
| 4 | `current_level` | `integer` | não | `1` |  | Nível atual do vendedor no sistema de gamificação. |
| 5 | `xp_to_next_level` | `integer` | não | `100` |  | Quantidade de XP necessária para alcançar o próximo nível. |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação do resumo. |
| 7 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Data e hora da última atualização do resumo. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| salesperson_xp_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| salesperson_xp_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| salesperson_xp_salesperson_id_key | UNIQUE | `UNIQUE (salesperson_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| salesperson_xp_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX salesperson_xp_pkey ON public.salesperson_xp USING btree (id)` |
| salesperson_xp_salesperson_id_key | btree | salesperson_id | sim | sim |  | `CREATE UNIQUE INDEX salesperson_xp_salesperson_id_key ON public.salesperson_xp USING btree (salesperson_id)` |


## Policies (RLS)

### `Admins can update salesperson_xp`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated users can read salesperson_xp`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_salesperson_xp_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
