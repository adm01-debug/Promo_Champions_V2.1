# public.integration_autotest_settings

> Tabela public.integration_autotest_settings. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), singleton boolean NOT NULL DEFAULT true, interval_minutes integer NOT NULL DEFAULT 60, failure_window_minutes integer NOT NULL DEFAULT 15, enabled boolean NOT NULL DEFAULT true, updated_by uuid NULLABLE, updated_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.integration_autotest_settings. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `singleton` | `boolean` | não | `true` |  | Coluna singleton da tabela public.integration_autotest_settings. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 3 | `interval_minutes` | `integer` | não | `60` |  | Coluna interval_minutes da tabela public.integration_autotest_settings. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 60. Validação CHECK: CHECK (interval_minutes >= 5 AND interval_minutes <= 1440). |
| 4 | `failure_window_minutes` | `integer` | não | `15` |  | Coluna failure_window_minutes da tabela public.integration_autotest_settings. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 15. Validação CHECK: CHECK (failure_window_minutes >= 1 AND failure_window_minutes <= 240). |
| 5 | `enabled` | `boolean` | não | `true` |  | Coluna enabled da tabela public.integration_autotest_settings. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 6 | `updated_by` | `uuid` | sim |  |  | Coluna updated_by da tabela public.integration_autotest_settings. Tipo PostgreSQL: uuid. Aceita NULL. |
| 7 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.integration_autotest_settings. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| integration_autotest_settings_failure_window_minutes_check | CHECK | `CHECK (failure_window_minutes >= 1 AND failure_window_minutes <= 240)` |  |  | sim |
| integration_autotest_settings_interval_minutes_check | CHECK | `CHECK (interval_minutes >= 5 AND interval_minutes <= 1440)` |  |  | sim |
| integration_autotest_settings_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| integration_autotest_settings_singleton_key | UNIQUE | `UNIQUE (singleton)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| integration_autotest_settings_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX integration_autotest_settings_pkey ON public.integration_autotest_settings USING btree (id)` |
| integration_autotest_settings_singleton_key | btree | singleton | sim | sim |  | `CREATE UNIQUE INDEX integration_autotest_settings_singleton_key ON public.integration_autotest_settings USING btree (singleton)` |


## Policies (RLS)

### `admins manage autotest settings`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_integration_autotest_settings_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
