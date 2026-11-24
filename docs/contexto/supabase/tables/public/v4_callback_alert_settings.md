# public.v4_callback_alert_settings

> Tabela public.v4_callback_alert_settings. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), singleton boolean NOT NULL DEFAULT true, is_active boolean NOT NULL DEFAULT true, failure_rate_threshold numeric NOT NULL DEFAULT 20, exhausted_threshold_24h integer NOT NULL DEFAULT 5, pending_threshold integer NOT NULL DEFAULT 50, window_minutes integer NOT NULL DEFAULT 60, min_events integer NOT NULL DEFAULT 10, suppress_minutes integer NOT NULL DEFAULT 30, updated_at timestamp with time zone NOT NULL DEFAULT now(), updated_by uuid NULLABLE.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.v4_callback_alert_settings. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `singleton` | `boolean` | não | `true` |  | Coluna singleton da tabela public.v4_callback_alert_settings. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 3 | `is_active` | `boolean` | não | `true` |  | Coluna is_active da tabela public.v4_callback_alert_settings. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 4 | `failure_rate_threshold` | `numeric` | não | `20` |  | Coluna failure_rate_threshold da tabela public.v4_callback_alert_settings. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 20. |
| 5 | `exhausted_threshold_24h` | `integer` | não | `5` |  | Coluna exhausted_threshold_24h da tabela public.v4_callback_alert_settings. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 5. |
| 6 | `pending_threshold` | `integer` | não | `50` |  | Coluna pending_threshold da tabela public.v4_callback_alert_settings. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 50. |
| 7 | `window_minutes` | `integer` | não | `60` |  | Coluna window_minutes da tabela public.v4_callback_alert_settings. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 60. |
| 8 | `min_events` | `integer` | não | `10` |  | Coluna min_events da tabela public.v4_callback_alert_settings. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 10. |
| 9 | `suppress_minutes` | `integer` | não | `30` |  | Coluna suppress_minutes da tabela public.v4_callback_alert_settings. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 30. |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.v4_callback_alert_settings. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 11 | `updated_by` | `uuid` | sim |  |  | Coluna updated_by da tabela public.v4_callback_alert_settings. Tipo PostgreSQL: uuid. Aceita NULL. |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
