# public.notifications

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 7 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `user_id` | `uuid` | não |  |  |  |
| 3 | `type` | `text` | não |  |  |  |
| 4 | `category` | `text` | não | `'general'::text` |  |  |
| 5 | `priority` | `text` | não | `'medium'::text` |  |  |
| 6 | `title` | `text` | não |  |  |  |
| 7 | `message` | `text` | sim |  |  |  |
| 8 | `icon` | `text` | sim |  |  |  |
| 9 | `action_url` | `text` | sim |  |  |  |
| 10 | `action_label` | `text` | sim |  |  |  |
| 11 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 12 | `read_at` | `timestamp with time zone` | sim |  |  |  |
| 13 | `archived_at` | `timestamp with time zone` | sim |  |  |  |
| 14 | `expires_at` | `timestamp with time zone` | sim |  |  |  |
| 15 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| notifications_category_check | CHECK | `CHECK (category = ANY (ARRAY['general'::text, 'sales'::text, 'goals'::text, 'gamification'::text, 'security'::text, 'system'::text, 'team'::text, 'ai'::text, 'approval'::text]))` |  |  | sim |
| notifications_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| notifications_priority_check | CHECK | `CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_notifications_category | btree | user_id, category, created_at | não | sim |  | `CREATE INDEX idx_notifications_category ON public.notifications USING btree (user_id, category, created_at DESC)` |
| idx_notifications_user | btree | user_id | não | sim |  | `CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id)` |
| idx_notifications_user_created | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_notifications_user_created ON public.notifications USING btree (user_id, created_at DESC)` |
| idx_notifications_user_unread | btree | user_id, read_at, created_at | não | sim |  | `CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, read_at, created_at DESC)` |
| notifications_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id)` |


## Policies (RLS)

### `Admins and managers can view churn alert notifications`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((type = 'churn_alert'::text) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))` |
| WITH CHECK |  |

### `Users can insert their own notifications`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() = user_id)` |

### `Users can view their own notifications`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `notifications_delete_own`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(user_id = auth.uid())` |
| WITH CHECK |  |

### `notifications_insert_own_or_admin`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((user_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |

### `notifications_select_own`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(user_id = auth.uid())` |
| WITH CHECK |  |

### `notifications_update_own`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(user_id = auth.uid())` |
| WITH CHECK | `(user_id = auth.uid())` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
