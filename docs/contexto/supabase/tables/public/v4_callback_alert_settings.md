# public.v4_callback_alert_settings

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
| 3 | `is_active` | `boolean` | não | `true` |  |  |
| 4 | `failure_rate_threshold` | `numeric` | não | `20` |  |  |
| 5 | `exhausted_threshold_24h` | `integer` | não | `5` |  |  |
| 6 | `pending_threshold` | `integer` | não | `50` |  |  |
| 7 | `window_minutes` | `integer` | não | `60` |  |  |
| 8 | `min_events` | `integer` | não | `10` |  |  |
| 9 | `suppress_minutes` | `integer` | não | `30` |  |  |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `updated_by` | `uuid` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| v4_callback_alert_settings_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| v4_callback_alert_settings_singleton_key | UNIQUE | `UNIQUE (singleton)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| v4_callback_alert_settings_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX v4_callback_alert_settings_pkey ON public.v4_callback_alert_settings USING btree (id)` |
| v4_callback_alert_settings_singleton_key | btree | singleton | sim | sim |  | `CREATE UNIQUE INDEX v4_callback_alert_settings_singleton_key ON public.v4_callback_alert_settings USING btree (singleton)` |


## Policies (RLS)

### `Admins manage v4 callback alert settings`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |


## Triggers

_nenhum_


## Grants

_nenhum_
