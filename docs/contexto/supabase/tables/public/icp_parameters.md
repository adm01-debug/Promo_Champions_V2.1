# public.icp_parameters

> Tabela public.icp_parameters. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), target_industries text[] NULLABLE DEFAULT '{}'::text[], min_capital numeric NULLABLE DEFAULT 0, min_employees integer NULLABLE DEFAULT 0, preferred_niches text[] NULLABLE DEFAULT '{}'::text[], weight_industry integer NULLABLE DEFAULT 30, weight_capital integer NULLABLE DEFAULT 20, weight_employees integer NULLABLE DEFAULT 20, weight_niche integer NULLABLE DEFAULT 30, created_at timestamp with time zone NULLABLE DEFAULT now(), updated_at timestamp with time zone NULLABLE DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.icp_parameters. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `target_industries` | `text[]` | sim | `'{}'::text[]` |  | Coluna target_industries da tabela public.icp_parameters. Tipo PostgreSQL: text[]. Aceita NULL. Valor padrão: '{}'::text[]. |
| 3 | `min_capital` | `numeric` | sim | `0` |  | Coluna min_capital da tabela public.icp_parameters. Tipo PostgreSQL: numeric. Aceita NULL. Valor padrão: 0. |
| 4 | `min_employees` | `integer` | sim | `0` |  | Coluna min_employees da tabela public.icp_parameters. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 0. |
| 5 | `preferred_niches` | `text[]` | sim | `'{}'::text[]` |  | Coluna preferred_niches da tabela public.icp_parameters. Tipo PostgreSQL: text[]. Aceita NULL. Valor padrão: '{}'::text[]. |
| 6 | `weight_industry` | `integer` | sim | `30` |  | Coluna weight_industry da tabela public.icp_parameters. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 30. |
| 7 | `weight_capital` | `integer` | sim | `20` |  | Coluna weight_capital da tabela public.icp_parameters. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 20. |
| 8 | `weight_employees` | `integer` | sim | `20` |  | Coluna weight_employees da tabela public.icp_parameters. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 20. |
| 9 | `weight_niche` | `integer` | sim | `30` |  | Coluna weight_niche da tabela public.icp_parameters. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 30. |
| 10 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.icp_parameters. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 11 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Coluna updated_at da tabela public.icp_parameters. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
