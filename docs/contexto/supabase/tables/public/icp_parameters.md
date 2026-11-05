# public.icp_parameters

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
| 2 | `target_industries` | `text[]` | sim | `'{}'::text[]` |  |  |
| 3 | `min_capital` | `numeric` | sim | `0` |  |  |
| 4 | `min_employees` | `integer` | sim | `0` |  |  |
| 5 | `preferred_niches` | `text[]` | sim | `'{}'::text[]` |  |  |
| 6 | `weight_industry` | `integer` | sim | `30` |  |  |
| 7 | `weight_capital` | `integer` | sim | `20` |  |  |
| 8 | `weight_employees` | `integer` | sim | `20` |  |  |
| 9 | `weight_niche` | `integer` | sim | `30` |  |  |
| 10 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 11 | `updated_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| icp_parameters_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| icp_parameters_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX icp_parameters_pkey ON public.icp_parameters USING btree (id)` |


## Policies (RLS)

### `Admins can manage ICP parameters`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `All authenticated can view ICP parameters`

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


## Grants

_nenhum_
