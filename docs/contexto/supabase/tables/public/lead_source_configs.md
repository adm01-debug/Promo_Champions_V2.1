# public.lead_source_configs

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
| 2 | `source_name` | `text` | não |  |  |  |
| 3 | `monthly_budget` | `numeric(12,2)` | sim | `0` |  |  |
| 4 | `target_cpl` | `numeric(12,2)` | sim | `0` |  |  |
| 5 | `is_active` | `boolean` | sim | `true` |  |  |
| 6 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| lead_source_configs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| lead_source_configs_source_name_key | UNIQUE | `UNIQUE (source_name)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| lead_source_configs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX lead_source_configs_pkey ON public.lead_source_configs USING btree (id)` |
| lead_source_configs_source_name_key | btree | source_name | sim | sim |  | `CREATE UNIQUE INDEX lead_source_configs_source_name_key ON public.lead_source_configs USING btree (source_name)` |


## Policies (RLS)

### `Allow read for all authenticated users`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'authenticated'::text)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
