# public.security_alert_settings

> Parâmetros de limiar e intervalo para alertas de segurança.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único das configurações. |
| 2 | `spike_threshold` | `integer` | não | `5` |  | Quantidade de eventos usada como limiar para detectar um aumento anormal. |
| 3 | `time_window_hours` | `integer` | não | `1` |  | Janela de observação do alerta, em horas. |
| 4 | `cooldown_hours` | `integer` | não | `24` |  | Intervalo mínimo entre alertas repetidos, em horas. |
| 5 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação das configurações. |
| 6 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Data e hora da última atualização das configurações. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| security_alert_settings_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| security_alert_settings_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX security_alert_settings_pkey ON public.security_alert_settings USING btree (id)` |


## Policies (RLS)

### `Admins can insert security settings`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins can update security settings`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins can view security settings`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_security_alert_settings_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
