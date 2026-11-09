# public.sdr_alert_history

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 3 | `triggered_by` | `text` | sim | `'cron'::text` |  |  |
| 4 | `sdrs_notified` | `integer` | não | `0` |  |  |
| 5 | `threshold_used` | `integer` | não | `3` |  |  |
| 6 | `sdr_details` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 7 | `admin_emails` | `text[]` | não | `'{}'::text[]` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sdr_alert_history_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sdr_alert_history_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_sdr_alert_history_created_at ON public.sdr_alert_history USING btree (created_at DESC)` |
| sdr_alert_history_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sdr_alert_history_pkey ON public.sdr_alert_history USING btree (id)` |


## Policies (RLS)

### `Only admins can view SDR alert history`

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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
