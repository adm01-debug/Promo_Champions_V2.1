# public.onboarding_journeys

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
| 2 | `account_id` | `uuid` | não |  |  |  |
| 3 | `template_key` | `text` | não | `'standard'::text` |  |  |
| 4 | `status` | `onboarding_status` | não | `'not_started'::onboarding_status` |  |  |
| 5 | `current_step` | `integer` | não | `0` |  |  |
| 6 | `total_steps` | `integer` | não | `0` |  |  |
| 7 | `owner_salesperson_id` | `uuid` | sim |  |  |  |
| 8 | `started_at` | `timestamp with time zone` | sim |  |  |  |
| 9 | `completed_at` | `timestamp with time zone` | sim |  |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| onboarding_journeys_account_id_fkey | FOREIGN KEY | `FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| onboarding_journeys_owner_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (owner_salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| onboarding_journeys_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.onboarding_steps | onboarding_steps_journey_id_fkey | journey_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_onboarding_account | btree | account_id | não | sim |  | `CREATE INDEX idx_onboarding_account ON public.onboarding_journeys USING btree (account_id)` |
| idx_onboarding_journeys_owner_salesperson_id | btree | owner_salesperson_id | não | sim |  | `CREATE INDEX idx_onboarding_journeys_owner_salesperson_id ON public.onboarding_journeys USING btree (owner_salesperson_id)` |
| idx_onboarding_status | btree | status | não | sim |  | `CREATE INDEX idx_onboarding_status ON public.onboarding_journeys USING btree (status)` |
| onboarding_journeys_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX onboarding_journeys_pkey ON public.onboarding_journeys USING btree (id)` |


## Policies (RLS)

### `cs_oj_modify`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()))` |
| WITH CHECK | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()))` |

### `cs_oj_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = onboarding_journeys.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_onb_journeys_uat | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
