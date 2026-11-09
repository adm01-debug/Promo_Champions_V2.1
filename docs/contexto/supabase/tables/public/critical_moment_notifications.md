# public.critical_moment_notifications

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `moment_id` | `uuid` | não |  |  |  |
| 3 | `recipient_user_id` | `uuid` | não |  |  |  |
| 4 | `delivered` | `boolean` | não | `true` |  |  |
| 5 | `read_at` | `timestamp with time zone` | sim |  |  |  |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| critical_moment_notifications_moment_id_fkey | FOREIGN KEY | `FOREIGN KEY (moment_id) REFERENCES call_critical_moments(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| critical_moment_notifications_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| critical_moment_notifications_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX critical_moment_notifications_pkey ON public.critical_moment_notifications USING btree (id)` |
| idx_cmn_recipient | btree | recipient_user_id, read_at, created_at | não | sim |  | `CREATE INDEX idx_cmn_recipient ON public.critical_moment_notifications USING btree (recipient_user_id, read_at, created_at DESC)` |
| idx_critical_moment_notifications_moment_id | btree | moment_id | não | sim |  | `CREATE INDEX idx_critical_moment_notifications_moment_id ON public.critical_moment_notifications USING btree (moment_id)` |


## Policies (RLS)

### `Authenticated users can insert critical moment notifications`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() = recipient_user_id)` |

### `Users can view own critical moment notifications`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(auth.uid() = recipient_user_id)` |
| WITH CHECK |  |

### `cmn_recipient_read`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((recipient_user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK |  |

### `cmn_recipient_update`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(recipient_user_id = auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
