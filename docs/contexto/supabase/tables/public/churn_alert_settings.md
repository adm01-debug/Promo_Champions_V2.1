# public.churn_alert_settings

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
| 1 | `id` | `boolean` | não | `true` |  |  |
| 2 | `enabled` | `boolean` | não | `true` |  |  |
| 3 | `min_level` | `text` | não | `'high'::text` |  |  |
| 4 | `cooldown_hours` | `integer` | não | `24` |  |  |
| 5 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 6 | `email_enabled` | `boolean` | não | `false` |  |  |
| 7 | `email_from` | `text` | sim |  |  |  |
| 8 | `email_reply_to` | `text` | sim |  |  |  |
| 9 | `email_recipients` | `text[]` | não | `'{}'::text[]` |  |  |
| 10 | `email_subject_template` | `text` | não | `'[Churn] Cliente {{client_name}} em risco {{level}}'::text` |  |  |
| 11 | `email_provider` | `text` | não | `'lovable'::text` |  |  |
| 12 | `auto_task_enabled` | `boolean` | não | `false` |  |  |
| 13 | `auto_task_min_level` | `text` | não | `'high'::text` |  |  |
| 14 | `auto_task_cooldown_hours` | `integer` | não | `48` |  |  |
| 15 | `auto_task_priority` | `text` | não | `'high'::text` |  |  |
| 16 | `auto_task_due_in_days` | `integer` | não | `1` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| churn_alert_settings_auto_task_cooldown_hours_check | CHECK | `CHECK (auto_task_cooldown_hours >= 1 AND auto_task_cooldown_hours <= 720)` |  |  | sim |
| churn_alert_settings_auto_task_due_in_days_check | CHECK | `CHECK (auto_task_due_in_days >= 0 AND auto_task_due_in_days <= 30)` |  |  | sim |
| churn_alert_settings_auto_task_min_level_check | CHECK | `CHECK (auto_task_min_level = ANY (ARRAY['medium'::text, 'high'::text, 'critical'::text]))` |  |  | sim |
| churn_alert_settings_auto_task_priority_check | CHECK | `CHECK (auto_task_priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))` |  |  | sim |
| churn_alert_settings_cooldown_hours_check | CHECK | `CHECK (cooldown_hours >= 1)` |  |  | sim |
| churn_alert_settings_id_check | CHECK | `CHECK (id)` |  |  | sim |
| churn_alert_settings_min_level_check | CHECK | `CHECK (min_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))` |  |  | sim |
| churn_alert_settings_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| churn_alert_settings_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX churn_alert_settings_pkey ON public.churn_alert_settings USING btree (id)` |


## Policies (RLS)

### `Admins manage churn alert settings`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Anyone authenticated can read churn alert settings`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
