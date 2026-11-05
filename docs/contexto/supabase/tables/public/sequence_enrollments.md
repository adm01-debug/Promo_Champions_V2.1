# public.sequence_enrollments

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
| 2 | `sequence_id` | `uuid` | não |  |  |  |
| 3 | `contact_id` | `uuid` | não |  |  |  |
| 4 | `contact_type` | `text` | não |  |  |  |
| 5 | `enrolled_by` | `uuid` | sim |  |  |  |
| 6 | `status` | `text` | não | `'active'::text` |  |  |
| 7 | `current_step` | `integer` | não | `0` |  |  |
| 8 | `next_action_at` | `timestamp with time zone` | sim |  |  |  |
| 9 | `started_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `last_executed_at` | `timestamp with time zone` | sim |  |  |  |
| 11 | `completed_at` | `timestamp with time zone` | sim |  |  |  |
| 12 | `exit_reason` | `text` | sim |  |  |  |
| 13 | `metadata` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 14 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 15 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 16 | `optimized_for_at` | `timestamp with time zone` | sim |  |  |  |
| 17 | `auto_paused_at` | `timestamp with time zone` | sim |  |  |  |
| 18 | `auto_pause_reason` | `text` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sequence_enrollments_contact_type_check | CHECK | `CHECK (contact_type = ANY (ARRAY['lead'::text, 'client'::text, 'contact'::text]))` |  |  | sim |
| sequence_enrollments_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sequence_enrollments_sequence_id_contact_id_contact_type_key | UNIQUE | `UNIQUE (sequence_id, contact_id, contact_type)` |  |  | sim |
| sequence_enrollments_sequence_id_fkey | FOREIGN KEY | `FOREIGN KEY (sequence_id) REFERENCES sequences(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| sequence_enrollments_status_check | CHECK | `CHECK (status = ANY (ARRAY['active'::text, 'paused'::text, 'completed'::text, 'exited'::text, 'failed'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.inbound_reply_events | inbound_reply_events_matched_enrollment_id_fkey | matched_enrollment_id | SET NULL |
| public.outbound_messages | outbound_messages_enrollment_id_fkey | enrollment_id | SET NULL |
| public.sequence_step_assignments | sequence_step_assignments_enrollment_id_fkey | enrollment_id | CASCADE |
| public.sequence_step_executions | sequence_step_executions_enrollment_id_fkey | enrollment_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_seq_enrollments_contact | btree | contact_id, contact_type | não | sim |  | `CREATE INDEX idx_seq_enrollments_contact ON public.sequence_enrollments USING btree (contact_id, contact_type)` |
| idx_seq_enrollments_runner | btree | status, next_action_at | não | sim | `(status = 'active'::text)` | `CREATE INDEX idx_seq_enrollments_runner ON public.sequence_enrollments USING btree (status, next_action_at) WHERE (status = 'active'::text)` |
| idx_seq_enrollments_seq | btree | sequence_id | não | sim |  | `CREATE INDEX idx_seq_enrollments_seq ON public.sequence_enrollments USING btree (sequence_id)` |
| sequence_enrollments_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sequence_enrollments_pkey ON public.sequence_enrollments USING btree (id)` |
| sequence_enrollments_sequence_id_contact_id_contact_type_key | btree | sequence_id, contact_id, contact_type | sim | sim |  | `CREATE UNIQUE INDEX sequence_enrollments_sequence_id_contact_id_contact_type_key ON public.sequence_enrollments USING btree (sequence_id, contact_id, contact_type)` |


## Policies (RLS)

### `Delete enrollments of own sequences`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sequences s   WHERE ((s.id = sequence_enrollments.sequence_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |
| WITH CHECK |  |

### `Insert enrollments to own sequences`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM sequences s   WHERE ((s.id = sequence_enrollments.sequence_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |

### `Update enrollments of own sequences`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sequences s   WHERE ((s.id = sequence_enrollments.sequence_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |
| WITH CHECK |  |

### `View enrollments of accessible sequences`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sequences s   WHERE ((s.id = sequence_enrollments.sequence_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_seq_enrollments_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
