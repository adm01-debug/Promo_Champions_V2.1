# public.webhook_events

> Deny-all intencional: RLS habilitado sem policies (20260104180000). Sem consumidores PostgREST em src/ nem functions/; qualquer escrita futura ocorre via service_role, que bypassa RLS. Documentado no pacote authz 2026-10-01.

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


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `uuid_generate_v4()` |  |  |
| 2 | `webhook_id` | `uuid` | não |  |  |  |
| 3 | `event_type` | `text` | não |  |  |  |
| 4 | `payload` | `jsonb` | não |  |  |  |
| 5 | `status` | `text` | não | `'pending'::text` |  |  |
| 6 | `attempts` | `integer` | sim | `0` |  |  |
| 7 | `last_attempt_at` | `timestamp with time zone` | sim |  |  |  |
| 8 | `next_retry_at` | `timestamp with time zone` | sim |  |  |  |
| 9 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| webhook_events_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| webhook_events_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'success'::text, 'failed'::text]))` |  |  | sim |
| webhook_events_webhook_id_fkey | FOREIGN KEY | `FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_webhook_events_retry | btree | next_retry_at | não | sim | `(status = 'pending'::text)` | `CREATE INDEX idx_webhook_events_retry ON public.webhook_events USING btree (next_retry_at) WHERE (status = 'pending'::text)` |
| idx_webhook_events_status | btree | status | não | sim | `(status = 'pending'::text)` | `CREATE INDEX idx_webhook_events_status ON public.webhook_events USING btree (status) WHERE (status = 'pending'::text)` |
| idx_webhook_events_webhook_id | btree | webhook_id | não | sim |  | `CREATE INDEX idx_webhook_events_webhook_id ON public.webhook_events USING btree (webhook_id)` |
| webhook_events_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX webhook_events_pkey ON public.webhook_events USING btree (id)` |


## Policies (RLS)

### `Admins and managers can manage webhook_events`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
