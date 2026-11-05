# public.duplicate_block_logs

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
| 2 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 3 | `entity_name` | `text` | não |  |  |  |
| 4 | `block_type` | `text` | não |  |  |  |
| 5 | `status` | `text` | não | `'Blocked'::text` |  |  |
| 6 | `auditor` | `text` | não | `'System IA'::text` |  |  |
| 7 | `confidence_score` | `double precision` | não | `1.0` |  |  |
| 8 | `details` | `jsonb` | sim | `'{}'::jsonb` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| duplicate_block_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| duplicate_block_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX duplicate_block_logs_pkey ON public.duplicate_block_logs USING btree (id)` |


## Policies (RLS)

### `Authenticated users can view duplicate block logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
