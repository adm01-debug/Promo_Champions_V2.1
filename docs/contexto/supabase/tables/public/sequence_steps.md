# public.sequence_steps

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
| 2 | `sequence_id` | `uuid` | não |  |  |  |
| 3 | `step_order` | `integer` | não |  |  |  |
| 4 | `channel` | `text` | não |  |  |  |
| 5 | `delay_days` | `integer` | não | `0` |  |  |
| 6 | `delay_hours` | `integer` | não | `0` |  |  |
| 7 | `template_id` | `uuid` | sim |  |  |  |
| 8 | `subject` | `text` | sim |  |  |  |
| 9 | `body` | `text` | sim |  |  |  |
| 10 | `conditions` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 12 | `whatsapp_template_id` | `text` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sequence_steps_channel_check | CHECK | `CHECK (channel = ANY (ARRAY['email'::text, 'whatsapp'::text, 'call'::text, 'linkedin'::text, 'task'::text]))` |  |  | sim |
| sequence_steps_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sequence_steps_sequence_id_fkey | FOREIGN KEY | `FOREIGN KEY (sequence_id) REFERENCES sequences(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| sequence_steps_sequence_id_step_order_key | UNIQUE | `UNIQUE (sequence_id, step_order)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.outbound_messages | outbound_messages_step_id_fkey | step_id | SET NULL |
| public.sequence_step_assignments | sequence_step_assignments_step_id_fkey | step_id | CASCADE |
| public.sequence_step_executions | sequence_step_executions_step_id_fkey | step_id | CASCADE |
| public.sequence_step_variants | sequence_step_variants_step_id_fkey | step_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sequence_steps_seq | btree | sequence_id, step_order | não | sim |  | `CREATE INDEX idx_sequence_steps_seq ON public.sequence_steps USING btree (sequence_id, step_order)` |
| sequence_steps_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sequence_steps_pkey ON public.sequence_steps USING btree (id)` |
| sequence_steps_sequence_id_step_order_key | btree | sequence_id, step_order | sim | sim |  | `CREATE UNIQUE INDEX sequence_steps_sequence_id_step_order_key ON public.sequence_steps USING btree (sequence_id, step_order)` |


## Policies (RLS)

### `Manage steps of own sequences`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sequences s   WHERE ((s.id = sequence_steps.sequence_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM sequences s   WHERE ((s.id = sequence_steps.sequence_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |

### `View steps of accessible sequences`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sequences s   WHERE ((s.id = sequence_steps.sequence_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
