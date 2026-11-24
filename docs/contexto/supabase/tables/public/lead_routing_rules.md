# public.lead_routing_rules

> Regras que determinam como leads são distribuídos entre vendedores.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único da regra de roteamento. |
| 2 | `name` | `text` | não |  |  | Nome da regra. |
| 3 | `strategy` | `text` | não | `'round_robin'::text` |  | Estratégia de distribuição definida para a regra. |
| 4 | `priority` | `integer` | não | `0` |  | Prioridade usada para ordenar a aplicação das regras. |
| 5 | `is_active` | `boolean` | não | `true` |  | Indica se a regra está habilitada. |
| 6 | `filter_state` | `text` | sim |  |  | Estado usado como critério de filtragem, quando configurado. |
| 7 | `filter_min_value` | `numeric` | sim |  |  | Valor monetário mínimo usado como critério, em BRL, quando configurado. |
| 8 | `filter_source` | `text` | sim |  |  | Origem do lead usada como critério de filtragem, quando configurada. |
| 9 | `filter_role` | `text` | sim |  |  | Papel comercial usado como critério de filtragem, quando configurado. |
| 10 | `description` | `text` | sim |  |  | Descrição da regra de roteamento. |
| 11 | `created_by` | `uuid` | sim |  |  | Usuário que criou a regra, quando identificado. |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação da regra. |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Data e hora da última atualização da regra. |
| 14 | `filter_job_titles` | `text[]` | sim |  |  | Lista de cargos usados como critério de filtragem. |
| 15 | `filter_products` | `text[]` | sim |  |  | Lista de produtos usados como critério de filtragem. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| lead_routing_rules_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.lead_assignments | lead_assignments_rule_id_fkey | rule_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| lead_routing_rules_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX lead_routing_rules_pkey ON public.lead_routing_rules USING btree (id)` |


## Policies (RLS)

### `Admin/manager manage routing rules`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Authenticated view routing rules`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_lead_routing_rules_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
