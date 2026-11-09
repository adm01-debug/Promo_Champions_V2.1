# public.cron_failure_alerts

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
| 2 | `jobid` | `bigint` | não |  |  |  |
| 3 | `jobname` | `text` | sim |  |  |  |
| 4 | `start_time` | `timestamp with time zone` | não |  |  |  |
| 5 | `status` | `text` | não |  |  |  |
| 6 | `return_message` | `text` | sim |  |  |  |
| 7 | `alerted_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `notified_admin_count` | `integer` | não | `0` |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cron_failure_alerts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| cron_failure_alerts_unique | UNIQUE | `UNIQUE (jobid, start_time)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cron_failure_alerts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cron_failure_alerts_pkey ON public.cron_failure_alerts USING btree (id)` |
| cron_failure_alerts_unique | btree | jobid, start_time | sim | sim |  | `CREATE UNIQUE INDEX cron_failure_alerts_unique ON public.cron_failure_alerts USING btree (jobid, start_time)` |
| idx_cron_failure_alerts_alerted_at | btree | alerted_at | não | sim |  | `CREATE INDEX idx_cron_failure_alerts_alerted_at ON public.cron_failure_alerts USING btree (alerted_at DESC)` |
| idx_cron_failure_alerts_jobname_alerted | btree | jobname, alerted_at | não | sim | `(jobname IS NOT NULL)` | `CREATE INDEX idx_cron_failure_alerts_jobname_alerted ON public.cron_failure_alerts USING btree (jobname, alerted_at DESC) WHERE (jobname IS NOT NULL)` |


## Policies (RLS)

### `Admins can view cron failure alerts`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
