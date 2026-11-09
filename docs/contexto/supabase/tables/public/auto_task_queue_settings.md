# public.auto_task_queue_settings

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
| 2 | `singleton` | `boolean` | não | `true` |  |  |
| 3 | `enabled` | `boolean` | não | `false` |  |  |
| 4 | `cutoff_time` | `time without time zone` | não | `'09:00:00'::time without time zone` |  |  |
| 5 | `timezone` | `text` | não | `'America/Sao_Paulo'::text` |  |  |
| 6 | `min_urgency` | `text` | não | `'high'::text` |  |  |
| 7 | `max_tasks_per_salesperson` | `integer` | não | `5` |  |  |
| 8 | `last_run_date` | `date` | sim |  |  |  |
| 9 | `last_run_created_count` | `integer` | sim |  |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| auto_task_queue_settings_max_tasks_per_salesperson_check | CHECK | `CHECK (max_tasks_per_salesperson >= 1 AND max_tasks_per_salesperson <= 50)` |  |  | sim |
| auto_task_queue_settings_min_urgency_check | CHECK | `CHECK (min_urgency = ANY (ARRAY['critical'::text, 'high'::text, 'medium'::text]))` |  |  | sim |
| auto_task_queue_settings_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| auto_task_queue_settings_singleton_key | UNIQUE | `UNIQUE (singleton)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| auto_task_queue_settings_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX auto_task_queue_settings_pkey ON public.auto_task_queue_settings USING btree (id)` |
| auto_task_queue_settings_singleton_key | btree | singleton | sim | sim |  | `CREATE UNIQUE INDEX auto_task_queue_settings_singleton_key ON public.auto_task_queue_settings USING btree (singleton)` |


## Policies (RLS)

### `auto_task_queue_settings_admin_write`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `auto_task_queue_settings_read_auth`

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
| trg_auto_task_queue_settings_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
