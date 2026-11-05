# public.webhook_inbound_dedupe

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | sim |
| policies | 2 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `correlation_key` | `text` | não |  |  |  |
| 3 | `event` | `text` | não |  |  |  |
| 4 | `source` | `text` | não | `'v4'::text` |  |  |
| 5 | `payload` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 6 | `received_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `first_seen_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `hit_count` | `integer` | não | `1` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| chk_webhook_inbound_dedupe_hit_count_non_negative | CHECK | `CHECK (hit_count >= 0)` |  |  | sim |
| chk_webhook_inbound_dedupe_payload_size | CHECK | `CHECK (pg_column_size(payload) <= 262144)` |  |  | sim |
| webhook_inbound_dedupe_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_webhook_dedupe_source_received | btree | source, received_at | não | sim |  | `CREATE INDEX idx_webhook_dedupe_source_received ON public.webhook_inbound_dedupe USING btree (source, received_at DESC)` |
| idx_webhook_inbound_dedupe_received_at | btree | received_at | não | sim |  | `CREATE INDEX idx_webhook_inbound_dedupe_received_at ON public.webhook_inbound_dedupe USING btree (received_at DESC)` |
| ux_webhook_inbound_dedupe_key | btree | correlation_key | sim | sim |  | `CREATE UNIQUE INDEX ux_webhook_inbound_dedupe_key ON public.webhook_inbound_dedupe USING btree (correlation_key)` |
| webhook_inbound_dedupe_first_seen_idx | btree | first_seen_at | não | sim |  | `CREATE INDEX webhook_inbound_dedupe_first_seen_idx ON public.webhook_inbound_dedupe USING btree (first_seen_at)` |
| webhook_inbound_dedupe_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX webhook_inbound_dedupe_pkey ON public.webhook_inbound_dedupe USING btree (id)` |


## Policies (RLS)

### `Admins can read inbound dedupe`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Deny writes to non-service`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | RESTRICTIVE |
| roles | anon, authenticated |
| USING | `false` |
| WITH CHECK | `false` |


## Triggers

_nenhum_


## Grants

_nenhum_
