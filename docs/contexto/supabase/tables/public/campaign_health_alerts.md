# public.campaign_health_alerts

> Tabela public.campaign_health_alerts. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), job_id uuid NOT NULL, owner_id uuid NOT NULL, alert_type text NOT NULL, severity text NOT NULL DEFAULT 'warning'::text, message text NOT NULL, metrics jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), dedupe_bucket timestamp with time zone NULLABLE. Relacionamentos FK: job_id → public.email_bulk_jobs(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.campaign_health_alerts. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `job_id` | `uuid` | não |  |  | Coluna job_id da tabela public.campaign_health_alerts. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.email_bulk_jobs(id). |
| 3 | `owner_id` | `uuid` | não |  |  | Coluna owner_id da tabela public.campaign_health_alerts. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 4 | `alert_type` | `text` | não |  |  | Coluna alert_type da tabela public.campaign_health_alerts. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (alert_type = ANY (ARRAY['opt_out_rate'::text, 'stalled'::text, 'failure_rate'::text])). |
| 5 | `severity` | `text` | não | `'warning'::text` |  | Coluna severity da tabela public.campaign_health_alerts. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'warning'::text. Validação CHECK: CHECK (severity = ANY (ARRAY['info'::text, 'warning'::text, 'critical'::text])). |
| 6 | `message` | `text` | não |  |  | Coluna message da tabela public.campaign_health_alerts. Tipo PostgreSQL: text. Não aceita NULL. |
| 7 | `metrics` | `jsonb` | não | `'{}'::jsonb` |  | Coluna metrics da tabela public.campaign_health_alerts. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.campaign_health_alerts. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.campaign_health_alerts. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 10 | `dedupe_bucket` | `timestamp with time zone` | sim |  |  | Coluna dedupe_bucket da tabela public.campaign_health_alerts. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |


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
