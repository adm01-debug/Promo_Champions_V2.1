# public.campaign_health_alerts

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `job_id` | `uuid` | não |  |  |  |
| 3 | `owner_id` | `uuid` | não |  |  |  |
| 4 | `alert_type` | `text` | não |  |  |  |
| 5 | `severity` | `text` | não | `'warning'::text` |  |  |
| 6 | `message` | `text` | não |  |  |  |
| 7 | `metrics` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `dedupe_bucket` | `timestamp with time zone` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| campaign_health_alerts_alert_type_check | CHECK | `CHECK (alert_type = ANY (ARRAY['opt_out_rate'::text, 'stalled'::text, 'failure_rate'::text]))` |  |  | sim |
| campaign_health_alerts_job_id_fkey | FOREIGN KEY | `FOREIGN KEY (job_id) REFERENCES email_bulk_jobs(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| campaign_health_alerts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| campaign_health_alerts_severity_check | CHECK | `CHECK (severity = ANY (ARRAY['info'::text, 'warning'::text, 'critical'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| campaign_health_alerts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX campaign_health_alerts_pkey ON public.campaign_health_alerts USING btree (id)` |
| idx_campaign_health_alerts_job_type | btree | job_id, alert_type, created_at | não | sim |  | `CREATE INDEX idx_campaign_health_alerts_job_type ON public.campaign_health_alerts USING btree (job_id, alert_type, created_at DESC)` |
| idx_campaign_health_alerts_owner_created | btree | owner_id, created_at | não | sim |  | `CREATE INDEX idx_campaign_health_alerts_owner_created ON public.campaign_health_alerts USING btree (owner_id, created_at DESC)` |
| uq_campaign_health_alerts_dedupe_bucket | btree | job_id, alert_type, dedupe_bucket | sim | sim | `(dedupe_bucket IS NOT NULL)` | `CREATE UNIQUE INDEX uq_campaign_health_alerts_dedupe_bucket ON public.campaign_health_alerts USING btree (job_id, alert_type, dedupe_bucket) WHERE (dedupe_bucket IS NOT NULL)` |


## Policies (RLS)

### `admin can delete campaign health alerts`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `owner or admin can view campaign health alerts`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_campaign_health_alerts_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
