# public.integration_autotest_settings

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
| 2 | `singleton` | `boolean` | não | `true` |  |  |
| 3 | `interval_minutes` | `integer` | não | `60` |  |  |
| 4 | `failure_window_minutes` | `integer` | não | `15` |  |  |
| 5 | `enabled` | `boolean` | não | `true` |  |  |
| 6 | `updated_by` | `uuid` | sim |  |  |  |
| 7 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


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

_nenhum_
