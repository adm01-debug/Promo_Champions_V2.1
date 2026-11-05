# public.email_bulk_jobs

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `owner_id` | `uuid` | não |  |  |  |
| 3 | `prompt` | `text` | não |  |  |  |
| 4 | `tone` | `text` | não | `'consultivo'::text` |  |  |
| 5 | `language` | `text` | não | `'pt-BR'::text` |  |  |
| 6 | `target_count` | `integer` | não | `0` |  |  |
| 7 | `status` | `text` | não | `'draft'::text` |  |  |
| 8 | `error_message` | `text` | sim |  |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `completed_at` | `timestamp with time zone` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| email_bulk_jobs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.campaign_health_alerts | campaign_health_alerts_job_id_fkey | job_id | CASCADE |
| public.email_bulk_drafts | email_bulk_drafts_job_id_fkey | job_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| email_bulk_jobs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX email_bulk_jobs_pkey ON public.email_bulk_jobs USING btree (id)` |
| idx_email_bulk_jobs_owner | btree | owner_id, created_at | não | sim |  | `CREATE INDEX idx_email_bulk_jobs_owner ON public.email_bulk_jobs USING btree (owner_id, created_at DESC)` |
| idx_email_bulk_jobs_status | btree | status | não | sim |  | `CREATE INDEX idx_email_bulk_jobs_status ON public.email_bulk_jobs USING btree (status)` |


## Policies (RLS)

### `owner can delete own bulk jobs`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK |  |

### `owner can insert own bulk jobs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(owner_id = auth.uid())` |

### `owner can update own bulk jobs`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK |  |

### `owner can view own bulk jobs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_email_bulk_jobs_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
