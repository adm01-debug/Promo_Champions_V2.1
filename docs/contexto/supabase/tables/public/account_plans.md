# public.account_plans

> Plano estratégico anual de relacionamento e crescimento para uma conta empresarial.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do plano de conta. |
| 2 | `account_id` | `uuid` | não |  |  | Conta empresarial à qual o plano pertence. |
| 3 | `fiscal_year` | `text` | sim |  |  | Ano fiscal de referência do plano. |
| 4 | `revenue_target` | `numeric(15,2)` | sim |  |  | Meta de receita da conta para o período, em BRL. |
| 5 | `executive_summary` | `text` | sim |  |  | Resumo executivo do plano. |
| 6 | `key_objectives` | `text[]` | sim |  |  | Lista de objetivos principais para a conta. |
| 7 | `main_challenges` | `text[]` | sim |  |  | Lista dos principais desafios identificados para a conta. |
| 8 | `swot_strengths` | `text[]` | sim |  |  | Pontos fortes da conta ou do relacionamento. |
| 9 | `swot_weaknesses` | `text[]` | sim |  |  | Pontos fracos identificados na análise da conta. |
| 10 | `swot_opportunities` | `text[]` | sim |  |  | Oportunidades identificadas na análise da conta. |
| 11 | `swot_threats` | `text[]` | sim |  |  | Ameaças identificadas na análise da conta. |
| 12 | `account_strategy` | `text` | sim |  |  | Estratégia de relacionamento e crescimento para a conta. |
| 13 | `action_plan` | `jsonb` | sim |  |  | Plano de ação estruturado em JSON. |
| 14 | `created_by` | `uuid` | sim |  |  | Usuário que criou o plano, quando identificado. |
| 15 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora de criação do plano. |
| 16 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora da última atualização do plano. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| account_plans_account_id_fkey | FOREIGN KEY | `FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| account_plans_created_by_fkey | FOREIGN KEY | `FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| account_plans_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| account_plans_account_id_key | btree | account_id | sim | sim |  | `CREATE UNIQUE INDEX account_plans_account_id_key ON public.account_plans USING btree (account_id)` |
| account_plans_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX account_plans_pkey ON public.account_plans USING btree (id)` |
| idx_account_plans_account_id | btree | account_id | não | sim |  | `CREATE INDEX idx_account_plans_account_id ON public.account_plans USING btree (account_id)` |
| idx_account_plans_created_by | btree | created_by | não | sim |  | `CREATE INDEX idx_account_plans_created_by ON public.account_plans USING btree (created_by)` |


## Policies (RLS)

### `Account plans owner or admin can read`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(is_admin_or_manager(auth.uid()) OR (created_by = auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = account_plans.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |

### `Account plans owner or admin can update`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(is_admin_or_manager(auth.uid()) OR (created_by = auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = account_plans.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |

### `Owners or admins can insert account plans`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((created_by = auth.uid()) AND (is_admin_or_manager(auth.uid()) OR (created_by = auth.uid())))` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_account_plans_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
