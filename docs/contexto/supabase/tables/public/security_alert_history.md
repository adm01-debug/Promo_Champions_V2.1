# public.security_alert_history

> Histórico de alertas de segurança emitidos e dos limiares usados.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do alerta registrado. |
| 2 | `alert_type` | `text` | não | `'access_denied_spike'::text` |  | Tipo do alerta de segurança. |
| 3 | `recipients` | `text[]` | não |  |  | Lista de destinatários notificados. |
| 4 | `access_count` | `integer` | não |  |  | Quantidade de eventos de acesso observada no alerta. |
| 5 | `time_window_hours` | `integer` | não |  |  | Janela de observação usada, em horas. |
| 6 | `threshold_used` | `integer` | não |  |  | Limiar usado para decidir se o alerta deveria ser emitido. |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de registro do alerta. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| security_alert_history_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_security_alert_history_created | btree | created_at | não | sim |  | `CREATE INDEX idx_security_alert_history_created ON public.security_alert_history USING btree (created_at DESC)` |
| security_alert_history_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX security_alert_history_pkey ON public.security_alert_history USING btree (id)` |


## Policies (RLS)

### `Admins can view alert history`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
