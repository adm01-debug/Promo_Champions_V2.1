# public.auto_task_queue_settings

> Tabela public.auto_task_queue_settings. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), singleton boolean NOT NULL DEFAULT true, enabled boolean NOT NULL DEFAULT false, cutoff_time time without time zone NOT NULL DEFAULT '09:00:00'::time without time zone, timezone text NOT NULL DEFAULT 'America/Sao_Paulo'::text, min_urgency text NOT NULL DEFAULT 'high'::text, max_tasks_per_salesperson integer NOT NULL DEFAULT 5, last_run_date date NULLABLE, last_run_created_count integer NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.auto_task_queue_settings. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `singleton` | `boolean` | não | `true` |  | Coluna singleton da tabela public.auto_task_queue_settings. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 3 | `enabled` | `boolean` | não | `false` |  | Coluna enabled da tabela public.auto_task_queue_settings. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: false. |
| 4 | `cutoff_time` | `time without time zone` | não | `'09:00:00'::time without time zone` |  | Coluna cutoff_time da tabela public.auto_task_queue_settings. Tipo PostgreSQL: time without time zone. Não aceita NULL. Valor padrão: '09:00:00'::time without time zone. |
| 5 | `timezone` | `text` | não | `'America/Sao_Paulo'::text` |  | Coluna timezone da tabela public.auto_task_queue_settings. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'America/Sao_Paulo'::text. |
| 6 | `min_urgency` | `text` | não | `'high'::text` |  | Coluna min_urgency da tabela public.auto_task_queue_settings. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'high'::text. Validação CHECK: CHECK (min_urgency = ANY (ARRAY['critical'::text, 'high'::text, 'medium'::text])). |
| 7 | `max_tasks_per_salesperson` | `integer` | não | `5` |  | Coluna max_tasks_per_salesperson da tabela public.auto_task_queue_settings. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 5. Validação CHECK: CHECK (max_tasks_per_salesperson >= 1 AND max_tasks_per_salesperson <= 50). |
| 8 | `last_run_date` | `date` | sim |  |  | Coluna last_run_date da tabela public.auto_task_queue_settings. Tipo PostgreSQL: date. Aceita NULL. |
| 9 | `last_run_created_count` | `integer` | sim |  |  | Coluna last_run_created_count da tabela public.auto_task_queue_settings. Tipo PostgreSQL: integer. Aceita NULL. |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.auto_task_queue_settings. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.auto_task_queue_settings. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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
