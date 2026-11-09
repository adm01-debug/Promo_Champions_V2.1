# public.winloss_alert_settings

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `singleton` | `boolean` | não | `true` |  |  |
| 3 | `consecutive_failures` | `integer` | não | `5` |  |  |
| 4 | `retry_rate_threshold` | `numeric` | não | `0.5` |  |  |
| 5 | `window_minutes` | `integer` | não | `30` |  |  |
| 6 | `min_deliveries` | `integer` | não | `10` |  |  |
| 7 | `suppress_minutes` | `integer` | não | `60` |  |  |
| 8 | `max_attempts` | `integer` | não | `3` |  |  |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `updated_by` | `uuid` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| winloss_alert_settings_consecutive_failures_check | CHECK | `CHECK (consecutive_failures >= 1 AND consecutive_failures <= 100)` |  |  | sim |
| winloss_alert_settings_max_attempts_check | CHECK | `CHECK (max_attempts >= 1 AND max_attempts <= 20)` |  |  | sim |
| winloss_alert_settings_min_deliveries_check | CHECK | `CHECK (min_deliveries >= 1 AND min_deliveries <= 10000)` |  |  | sim |
| winloss_alert_settings_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| winloss_alert_settings_retry_rate_threshold_check | CHECK | `CHECK (retry_rate_threshold >= 0::numeric AND retry_rate_threshold <= 1::numeric)` |  |  | sim |
| winloss_alert_settings_singleton_key | UNIQUE | `UNIQUE (singleton)` |  |  | sim |
| winloss_alert_settings_suppress_minutes_check | CHECK | `CHECK (suppress_minutes >= 1 AND suppress_minutes <= 1440)` |  |  | sim |
| winloss_alert_settings_updated_by_fkey | FOREIGN KEY | `FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| winloss_alert_settings_window_minutes_check | CHECK | `CHECK (window_minutes >= 5 AND window_minutes <= 1440)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_winloss_alert_settings_updated_by | btree | updated_by | não | sim |  | `CREATE INDEX idx_winloss_alert_settings_updated_by ON public.winloss_alert_settings USING btree (updated_by)` |
| winloss_alert_settings_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX winloss_alert_settings_pkey ON public.winloss_alert_settings USING btree (id)` |
| winloss_alert_settings_singleton_key | btree | singleton | sim | sim |  | `CREATE UNIQUE INDEX winloss_alert_settings_singleton_key ON public.winloss_alert_settings USING btree (singleton)` |


## Policies (RLS)

### `Admins insert winloss_alert_settings`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Admins read winloss_alert_settings`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Admins update winloss_alert_settings`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_touch_winloss_alert_settings | BEFORE | UPDATE | ROW | enabled | public.touch_winloss_alert_settings |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
