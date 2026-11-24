# public.cadence_steps

> Etapas ordenadas que definem as ações de uma cadência.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único da etapa. |
| 2 | `cadence_id` | `uuid` | não |  |  | Cadência à qual a etapa pertence. |
| 3 | `day_number` | `integer` | não | `1` |  | Dia relativo da cadência em que a etapa está prevista. |
| 4 | `action_type` | `text` | não |  |  | Canal ou tipo de ação: email, call, linkedin, whatsapp, meeting ou other. |
| 5 | `title` | `text` | não |  |  | Título da etapa. |
| 6 | `description` | `text` | sim |  |  | Descrição da ação prevista. |
| 7 | `template_content` | `text` | sim |  |  | Conteúdo de mensagem ou modelo associado à etapa, quando informado. |
| 8 | `step_order` | `integer` | não | `0` |  | Posição da etapa na sequência da cadência. |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação da etapa. |
| 10 | `needs_approval` | `boolean` | sim | `false` |  | Indica se a ação da etapa requer aprovação. |
| 11 | `singu_variables` | `jsonb` | sim | `'[]'::jsonb` |  | Variáveis associadas à etapa em formato JSON. |
| 12 | `task_type` | `text` | sim | `'manual'::text` |  | Tipo de tarefa criado ou usado para esta etapa. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cadence_steps_action_type_check | CHECK | `CHECK (action_type = ANY (ARRAY['email'::text, 'call'::text, 'linkedin'::text, 'whatsapp'::text, 'meeting'::text, 'other'::text]))` |  |  | sim |
| cadence_steps_cadence_id_fkey | FOREIGN KEY | `FOREIGN KEY (cadence_id) REFERENCES cadences(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| cadence_steps_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.cadence_tasks | cadence_tasks_cadence_step_id_fkey | cadence_step_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cadence_steps_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cadence_steps_pkey ON public.cadence_steps USING btree (id)` |
| idx_cadence_steps_cadence | btree | cadence_id, step_order | não | sim |  | `CREATE INDEX idx_cadence_steps_cadence ON public.cadence_steps USING btree (cadence_id, step_order)` |


## Policies (RLS)

### `Admins and managers can delete cadence_steps`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can insert cadence_steps`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can update cadence_steps`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated users can read cadence_steps`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
