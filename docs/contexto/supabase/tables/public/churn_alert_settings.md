# public.churn_alert_settings

> Tabela public.churn_alert_settings. Estrutura registrada no catálogo do PostgreSQL: id boolean NOT NULL DEFAULT true, enabled boolean NOT NULL DEFAULT true, min_level text NOT NULL DEFAULT 'high'::text, cooldown_hours integer NOT NULL DEFAULT 24, updated_at timestamp with time zone NOT NULL DEFAULT now(), email_enabled boolean NOT NULL DEFAULT false, email_from text NULLABLE, email_reply_to text NULLABLE, email_recipients text[] NOT NULL DEFAULT '{}'::text[], email_subject_template text NOT NULL DEFAULT '[Churn] Cliente {{client_name}} em risco {{level}}'::text, email_provider text NOT NULL DEFAULT 'lovable'::text, auto_task_enabled boolean NOT NULL DEFAULT false, auto_task_min_level text NOT NULL DEFAULT 'high'::text, auto_task_cooldown_hours integer NOT NULL DEFAULT 48, auto_task_priority text NOT NULL DEFAULT 'high'::text, auto_task_due_in_days integer NOT NULL DEFAULT 1.

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
| 1 | `id` | `boolean` | não | `true` |  | Coluna id da tabela public.churn_alert_settings. Tipo PostgreSQL: boolean. Participa da chave primária. Não aceita NULL. Valor padrão: true. Validação CHECK: CHECK (id). |
| 2 | `enabled` | `boolean` | não | `true` |  | Coluna enabled da tabela public.churn_alert_settings. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 3 | `min_level` | `text` | não | `'high'::text` |  | Coluna min_level da tabela public.churn_alert_settings. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'high'::text. Validação CHECK: CHECK (min_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])). |
| 4 | `cooldown_hours` | `integer` | não | `24` |  | Coluna cooldown_hours da tabela public.churn_alert_settings. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 24. Validação CHECK: CHECK (cooldown_hours >= 1). |
| 5 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.churn_alert_settings. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 6 | `email_enabled` | `boolean` | não | `false` |  | Coluna email_enabled da tabela public.churn_alert_settings. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: false. |
| 7 | `email_from` | `text` | sim |  |  | Coluna email_from da tabela public.churn_alert_settings. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `email_reply_to` | `text` | sim |  |  | Coluna email_reply_to da tabela public.churn_alert_settings. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `email_recipients` | `text[]` | não | `'{}'::text[]` |  | Coluna email_recipients da tabela public.churn_alert_settings. Tipo PostgreSQL: text[]. Não aceita NULL. Valor padrão: '{}'::text[]. |
| 10 | `email_subject_template` | `text` | não | `'[Churn] Cliente {{client_name}} em risco {{level}}'::text` |  | Coluna email_subject_template da tabela public.churn_alert_settings. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: '[Churn] Cliente {{client_name}} em risco {{level}}'::text. |
| 11 | `email_provider` | `text` | não | `'lovable'::text` |  | Coluna email_provider da tabela public.churn_alert_settings. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'lovable'::text. |
| 12 | `auto_task_enabled` | `boolean` | não | `false` |  | Coluna auto_task_enabled da tabela public.churn_alert_settings. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: false. |
| 13 | `auto_task_min_level` | `text` | não | `'high'::text` |  | Coluna auto_task_min_level da tabela public.churn_alert_settings. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'high'::text. Validação CHECK: CHECK (auto_task_min_level = ANY (ARRAY['medium'::text, 'high'::text, 'critical'::text])). |
| 14 | `auto_task_cooldown_hours` | `integer` | não | `48` |  | Coluna auto_task_cooldown_hours da tabela public.churn_alert_settings. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 48. Validação CHECK: CHECK (auto_task_cooldown_hours >= 1 AND auto_task_cooldown_hours <= 720). |
| 15 | `auto_task_priority` | `text` | não | `'high'::text` |  | Coluna auto_task_priority da tabela public.churn_alert_settings. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'high'::text. Validação CHECK: CHECK (auto_task_priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])). |
| 16 | `auto_task_due_in_days` | `integer` | não | `1` |  | Coluna auto_task_due_in_days da tabela public.churn_alert_settings. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 1. Validação CHECK: CHECK (auto_task_due_in_days >= 0 AND auto_task_due_in_days <= 30). |


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
