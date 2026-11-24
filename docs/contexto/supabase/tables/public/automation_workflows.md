# public.automation_workflows

> Definições de automações comerciais acionadas por eventos ou horários.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único da automação. |
| 2 | `name` | `text` | não |  |  | Nome da automação. |
| 3 | `description` | `text` | sim |  |  | Descrição da automação. |
| 4 | `trigger_type` | `text` | não |  |  | Evento que pode iniciar a automação; os valores aceitos são definidos pela constraint. |
| 5 | `trigger_config` | `jsonb` | não | `'{}'::jsonb` |  | Parâmetros do gatilho em JSON. |
| 6 | `conditions` | `jsonb` | não | `'[]'::jsonb` |  | Condições que determinam se a automação deve executar, em JSON. |
| 7 | `actions` | `jsonb` | não | `'[]'::jsonb` |  | Ações configuradas para a automação, em JSON. |
| 8 | `is_active` | `boolean` | não | `true` |  | Indica se a automação está habilitada. |
| 9 | `created_by` | `uuid` | sim |  |  | Usuário que criou a automação, quando identificado. |
| 10 | `run_count` | `integer` | não | `0` |  | Quantidade de execuções registradas. |
| 11 | `last_run_at` | `timestamp with time zone` | sim |  |  | Data e hora da execução mais recente. |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação da automação. |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Data e hora da última atualização da automação. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| automation_workflows_created_by_fkey | FOREIGN KEY | `FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| automation_workflows_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| automation_workflows_trigger_type_check | CHECK | `CHECK (trigger_type = ANY (ARRAY['deal_created'::text, 'stage_changed'::text, 'activity_logged'::text, 'scheduled'::text, 'manual'::text, 'no_activity_days'::text, 'proposal_opened'::text, 'price_clicked'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.automation_runs | automation_runs_workflow_id_fkey | workflow_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| automation_workflows_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX automation_workflows_pkey ON public.automation_workflows USING btree (id)` |
| idx_automation_workflows_created_by | btree | created_by | não | sim |  | `CREATE INDEX idx_automation_workflows_created_by ON public.automation_workflows USING btree (created_by)` |
| idx_automation_workflows_trigger | btree | trigger_type | não | sim | `(is_active = true)` | `CREATE INDEX idx_automation_workflows_trigger ON public.automation_workflows USING btree (trigger_type) WHERE (is_active = true)` |


## Policies (RLS)

### `Admins/managers manage workflows`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Authenticated users can view active workflows`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() IS NOT NULL)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_automation_workflows_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
