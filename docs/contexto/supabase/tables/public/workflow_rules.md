# public.workflow_rules

> Regras de automação associadas a gatilhos e ações comerciais.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único da regra de workflow. |
| 2 | `name` | `text` | não |  |  | Nome da regra. |
| 3 | `description` | `text` | sim |  |  | Descrição da regra. |
| 4 | `trigger_type` | `text` | não | `'deal_stagnant'::text` |  | Tipo de evento que pode acionar a regra. |
| 5 | `trigger_config` | `jsonb` | não | `'{}'::jsonb` |  | Parâmetros do gatilho em JSON; a estrutura é definida pela aplicação. |
| 6 | `action_type` | `text` | não | `'create_task'::text` |  | Tipo de ação executada pela regra. |
| 7 | `action_config` | `jsonb` | não | `'{}'::jsonb` |  | Parâmetros da ação em JSON; a estrutura é definida pela aplicação. |
| 8 | `is_active` | `boolean` | não | `true` |  | Indica se a regra está habilitada. |
| 9 | `salesperson_id` | `uuid` | sim |  |  | Vendedor ao qual a regra se aplica, quando restrita a uma pessoa. |
| 10 | `executions_count` | `integer` | não | `0` |  | Quantidade de execuções registradas para a regra. |
| 11 | `last_executed_at` | `timestamp with time zone` | sim |  |  | Data e hora da execução mais recente. |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação da regra. |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Data e hora da última atualização da regra. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| workflow_rules_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| workflow_rules_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_workflow_rules_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_workflow_rules_salesperson_id ON public.workflow_rules USING btree (salesperson_id)` |
| workflow_rules_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX workflow_rules_pkey ON public.workflow_rules USING btree (id)` |


## Policies (RLS)

### `Users can manage own workflow rules`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
