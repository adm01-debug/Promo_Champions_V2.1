# public.active_sessions

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `user_id` | `uuid` | sim |  |  |  |
| 3 | `session_token` | `text` | sim |  |  |  |
| 4 | `ip_address` | `text` | sim |  |  |  |
| 5 | `user_agent` | `text` | sim |  |  |  |
| 6 | `device_info` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 7 | `last_activity` | `timestamp with time zone` | sim | `now()` |  |  |
| 8 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 9 | `expires_at` | `timestamp with time zone` | sim |  |  |  |
| 10 | `refresh_count` | `integer` | sim | `0` |  |  |
| 11 | `last_refresh_at` | `timestamp with time zone` | sim |  |  |  |
| 12 | `max_lifetime_hours` | `integer` | sim | `24` |  |  |


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
