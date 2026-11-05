# public.plan_rollback_ddl

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
| 1 | `id` | `bigint` | não | `nextval('plan_rollback_ddl_id_seq'::regclass)` |  |  |
| 2 | `etapa` | `integer` | não |  |  |  |
| 3 | `object_type` | `text` | não |  |  |  |
| 4 | `object_name` | `text` | não |  |  |  |
| 5 | `ddl` | `text` | sim |  |  |  |
| 6 | `captured_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| plan_rollback_ddl_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| plan_rollback_ddl_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX plan_rollback_ddl_pkey ON public.plan_rollback_ddl USING btree (id)` |


## Policies (RLS)

### `Internal admin only - service_role bypasses RLS`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | service_role |
| USING | `true` |
| WITH CHECK | `true` |


## Triggers

_nenhum_


## Grants

_nenhum_
