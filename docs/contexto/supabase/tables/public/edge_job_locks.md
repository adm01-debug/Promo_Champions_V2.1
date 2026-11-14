# public.edge_job_locks

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
| 1 | `job_name` | `text` | não |  |  |  |
| 2 | `locked_at` | `timestamp with time zone` | não | `now()` |  |  |
| 3 | `request_id` | `text` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| edge_job_locks_pkey | PRIMARY KEY | `PRIMARY KEY (job_name)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| edge_job_locks_pkey | btree | job_name | sim | sim |  | `CREATE UNIQUE INDEX edge_job_locks_pkey ON public.edge_job_locks USING btree (job_name)` |


## Policies (RLS)

### `Service role can manage job locks`

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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
