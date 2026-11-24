# public.login_alerts

> Alertas de login associados a dispositivos, endereços IP ou localizações incomuns.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do alerta de login. |
| 2 | `user_id` | `uuid` | não |  |  | Usuário do Supabase Auth associado ao alerta. |
| 3 | `device_fingerprint` | `text` | não |  |  | Identificador do dispositivo relacionado ao alerta. |
| 4 | `ip_address` | `text` | sim |  |  | Endereço IP associado ao alerta, quando disponível. |
| 5 | `browser` | `text` | sim |  |  | Navegador detectado, quando disponível. |
| 6 | `os` | `text` | sim |  |  | Sistema operacional detectado, quando disponível. |
| 7 | `location` | `text` | sim |  |  | Localização estimada associada ao alerta, quando disponível. |
| 8 | `alert_type` | `text` | sim | `'new_device'::text` |  | Tipo de alerta: new_device, new_ip, new_location ou suspicious. |
| 9 | `email_sent` | `boolean` | sim | `false` |  | Indica se um e-mail de alerta foi enviado. |
| 10 | `email_sent_at` | `timestamp with time zone` | sim |  |  | Data e hora do envio do e-mail de alerta. |
| 11 | `acknowledged` | `boolean` | sim | `false` |  | Indica se o usuário reconheceu o alerta. |
| 12 | `acknowledged_at` | `timestamp with time zone` | sim |  |  | Data e hora em que o alerta foi reconhecido. |
| 13 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora de criação do alerta. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| login_alerts_alert_type_check | CHECK | `CHECK (alert_type = ANY (ARRAY['new_device'::text, 'new_ip'::text, 'new_location'::text, 'suspicious'::text]))` |  |  | sim |
| login_alerts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| login_alerts_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_login_alerts_user | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_login_alerts_user ON public.login_alerts USING btree (user_id, created_at DESC)` |
| login_alerts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX login_alerts_pkey ON public.login_alerts USING btree (id)` |


## Policies (RLS)

### `Users can update own alerts`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `Users can view own alerts`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
