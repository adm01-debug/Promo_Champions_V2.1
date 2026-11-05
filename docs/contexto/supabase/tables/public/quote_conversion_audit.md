# public.quote_conversion_audit

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
| usada por views | public.v_quote_conversion_history, public.v_quote_conversion_metrics_daily |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `quote_id` | `uuid` | não |  |  |  |
| 3 | `sale_id` | `uuid` | sim |  |  |  |
| 4 | `order_id` | `uuid` | sim |  |  |  |
| 5 | `order_number` | `text` | sim |  |  |  |
| 6 | `previous_status` | `text` | sim |  |  |  |
| 7 | `new_status` | `text` | sim |  |  |  |
| 8 | `reused_order` | `boolean` | não | `false` |  |  |
| 9 | `idempotent` | `boolean` | não | `false` |  |  |
| 10 | `success` | `boolean` | não |  |  |  |
| 11 | `error_code` | `text` | sim |  |  |  |
| 12 | `error_message` | `text` | sim |  |  |  |
| 13 | `latency_ms` | `integer` | sim |  |  |  |
| 14 | `request_id` | `text` | sim |  |  |  |
| 15 | `actor_user_id` | `uuid` | sim |  |  |  |
| 16 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| quote_conversion_audit_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_quote_conversion_audit_created | btree | created_at | não | sim |  | `CREATE INDEX idx_quote_conversion_audit_created ON public.quote_conversion_audit USING btree (created_at DESC)` |
| idx_quote_conversion_audit_quote | btree | quote_id | não | sim |  | `CREATE INDEX idx_quote_conversion_audit_quote ON public.quote_conversion_audit USING btree (quote_id)` |
| idx_quote_conversion_audit_request | btree | request_id | não | sim |  | `CREATE INDEX idx_quote_conversion_audit_request ON public.quote_conversion_audit USING btree (request_id)` |
| idx_quote_conversion_audit_sale | btree | sale_id | não | sim |  | `CREATE INDEX idx_quote_conversion_audit_sale ON public.quote_conversion_audit USING btree (sale_id)` |
| quote_conversion_audit_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX quote_conversion_audit_pkey ON public.quote_conversion_audit USING btree (id)` |


## Policies (RLS)

### `admins can read conversion audit`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
