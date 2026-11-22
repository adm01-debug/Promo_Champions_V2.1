# public.cron_job_last_run

> Espelho do max(start_time) por cron job. Evita o seq scan em cron.job_run_details (sem indice em jobid, 269k+ linhas) dentro de detect_stalled_cron_jobs().

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 0 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `jobid` | `integer` | não |  |  |  |
| 2 | `last_start` | `timestamp with time zone` | não |  |  |  |
| 3 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cron_job_last_run_pkey | PRIMARY KEY | `PRIMARY KEY (jobid)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cron_job_last_run_pkey | btree | jobid | sim | sim |  | `CREATE UNIQUE INDEX cron_job_last_run_pkey ON public.cron_job_last_run USING btree (jobid)` |


## Policies (RLS)

> ⚠️ RLS habilitado **sem policies**: nenhum acesso via API (anon/authenticated).



## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
