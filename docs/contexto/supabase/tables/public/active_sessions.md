# public.active_sessions

> Registro de sessões ativas e metadados de atividade e expiração.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 6 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único da sessão registrada. |
| 2 | `user_id` | `uuid` | sim |  |  | Usuário do Supabase Auth associado à sessão, quando identificado. |
| 3 | `session_token` | `text` | sim |  |  | Token de sessão; credencial sensível que não deve ser exposta a clientes ou registrada em logs. |
| 4 | `ip_address` | `text` | sim |  |  | Endereço IP observado para a sessão, quando disponível. |
| 5 | `user_agent` | `text` | sim |  |  | User-Agent do cliente que iniciou a sessão, quando disponível. |
| 6 | `device_info` | `jsonb` | sim | `'{}'::jsonb` |  | Metadados do dispositivo associados à sessão, em formato JSON. |
| 7 | `last_activity` | `timestamp with time zone` | sim | `now()` |  | Data e hora da atividade mais recente da sessão. |
| 8 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora de criação da sessão. |
| 9 | `expires_at` | `timestamp with time zone` | sim |  |  | Data e hora de expiração da sessão, quando configurada. |
| 10 | `refresh_count` | `integer` | sim | `0` |  | Quantidade de renovações registradas para a sessão. |
| 11 | `last_refresh_at` | `timestamp with time zone` | sim |  |  | Data e hora da renovação mais recente. |
| 12 | `max_lifetime_hours` | `integer` | sim | `24` |  | Tempo máximo de vida da sessão em horas, quando configurado. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| active_sessions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| active_sessions_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| active_sessions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX active_sessions_pkey ON public.active_sessions USING btree (id)` |
| idx_active_sessions_activity | btree | last_activity | não | sim |  | `CREATE INDEX idx_active_sessions_activity ON public.active_sessions USING btree (last_activity)` |
| idx_active_sessions_user | btree | user_id | não | sim |  | `CREATE INDEX idx_active_sessions_user ON public.active_sessions USING btree (user_id)` |


## Policies (RLS)

### `Admins can view all sessions`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Users can delete own sessions`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(user_id = auth.uid())` |
| WITH CHECK |  |

### `Users can insert own sessions`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(user_id = auth.uid())` |

### `Users can read own sessions`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(user_id = auth.uid())` |
| WITH CHECK |  |

### `Users can update own sessions`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(user_id = auth.uid())` |
| WITH CHECK |  |

### `Users can view own sessions`

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
