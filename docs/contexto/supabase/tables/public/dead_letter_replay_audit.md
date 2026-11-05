# public.dead_letter_replay_audit

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `job_id` | `uuid` | não |  |  |  |
| 3 | `performed_by` | `uuid` | sim |  |  |  |
| 4 | `performed_role` | `text` | não |  |  |  |
| 5 | `outcome` | `text` | não |  |  |  |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| dead_letter_replay_audit_outcome_check | CHECK | `CHECK (outcome = ANY (ARRAY['replayed'::text, 'skipped_locked'::text, 'not_found_or_not_dead_letter'::text]))` |  |  | sim |
| dead_letter_replay_audit_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| dead_letter_replay_audit_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX dead_letter_replay_audit_pkey ON public.dead_letter_replay_audit USING btree (id)` |
| idx_dlq_replay_audit_job_created | btree | job_id, created_at | não | sim |  | `CREATE INDEX idx_dlq_replay_audit_job_created ON public.dead_letter_replay_audit USING btree (job_id, created_at DESC)` |


## Policies (RLS)

### `admins read dlq replay audit`

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
