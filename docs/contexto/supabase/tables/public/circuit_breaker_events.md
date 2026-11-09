# public.circuit_breaker_events

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
| usada por views | public.v_platform_slo |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `circuit_name` | `text` | não |  |  |  |
| 3 | `event_type` | `text` | não |  |  |  |
| 4 | `previous_state` | `text` | sim |  |  |  |
| 5 | `new_state` | `text` | sim |  |  |  |
| 6 | `failure_count` | `integer` | sim | `0` |  |  |
| 7 | `details` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| circuit_breaker_events_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| circuit_breaker_events_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX circuit_breaker_events_pkey ON public.circuit_breaker_events USING btree (id)` |
| idx_circuit_breaker_events_circuit_name | btree | circuit_name | não | sim |  | `CREATE INDEX idx_circuit_breaker_events_circuit_name ON public.circuit_breaker_events USING btree (circuit_name)` |
| idx_circuit_breaker_events_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_circuit_breaker_events_created_at ON public.circuit_breaker_events USING btree (created_at DESC)` |
| idx_circuit_breaker_events_event_type | btree | event_type | não | sim |  | `CREATE INDEX idx_circuit_breaker_events_event_type ON public.circuit_breaker_events USING btree (event_type)` |


## Policies (RLS)

### `Admin/manager can log circuit breaker events`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can view circuit breaker events`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins can delete circuit breaker events`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
