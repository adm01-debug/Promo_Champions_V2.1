# public.v4_callback_alerts

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `kind` | `text` | não |  |  |  |
| 3 | `details` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 4 | `fired_at` | `timestamp with time zone` | não | `now()` |  |  |
| 5 | `acknowledged_at` | `timestamp with time zone` | sim |  |  |  |
| 6 | `acknowledged_by` | `uuid` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| v4_callback_alerts_kind_check | CHECK | `CHECK (kind = ANY (ARRAY['high_failure_rate'::text, 'exhausted_spike'::text, 'pending_backlog'::text]))` |  |  | sim |
| v4_callback_alerts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_v4_callback_alerts_fired_at | btree | fired_at | não | sim |  | `CREATE INDEX idx_v4_callback_alerts_fired_at ON public.v4_callback_alerts USING btree (fired_at DESC)` |
| v4_callback_alerts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX v4_callback_alerts_pkey ON public.v4_callback_alerts USING btree (id)` |


## Policies (RLS)

### `Admins ack v4 callback alerts`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins read v4 callback alerts`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Service role writes v4 callback alerts`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | service_role |
| USING |  |
| WITH CHECK | `true` |


## Triggers

_nenhum_


## Grants

_nenhum_
