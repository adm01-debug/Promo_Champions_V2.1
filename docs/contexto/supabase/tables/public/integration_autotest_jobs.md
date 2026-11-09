# public.integration_autotest_jobs

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
| 2 | `started_at` | `timestamp with time zone` | não | `now()` |  |  |
| 3 | `finished_at` | `timestamp with time zone` | sim |  |  |  |
| 4 | `status` | `text` | não | `'running'::text` |  |  |
| 5 | `total` | `integer` | sim | `0` |  |  |
| 6 | `succeeded` | `integer` | sim | `0` |  |  |
| 7 | `failed` | `integer` | sim | `0` |  |  |
| 8 | `results` | `jsonb` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| integration_autotest_jobs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_autotest_jobs_started | btree | started_at | não | sim |  | `CREATE INDEX idx_autotest_jobs_started ON public.integration_autotest_jobs USING btree (started_at DESC)` |
| integration_autotest_jobs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX integration_autotest_jobs_pkey ON public.integration_autotest_jobs USING btree (id)` |


## Policies (RLS)

### `admins manage autotest jobs`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
