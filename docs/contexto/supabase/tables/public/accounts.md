# public.accounts

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
| 2 | `name` | `text` | não |  |  |  |
| 3 | `parent_account_id` | `uuid` | sim |  |  |  |
| 4 | `industry` | `text` | sim |  |  |  |
| 5 | `tier` | `text` | não | `'smb'::text` |  |  |
| 6 | `annual_revenue` | `numeric(15,2)` | sim |  |  |  |
| 7 | `employee_count` | `integer` | sim |  |  |  |
| 8 | `website` | `text` | sim |  |  |  |
| 9 | `country` | `text` | sim |  |  |  |
| 10 | `account_score` | `integer` | não | `0` |  |  |
| 11 | `health_status` | `text` | não | `'unknown'::text` |  |  |
| 12 | `owner_id` | `uuid` | sim |  |  |  |
| 13 | `notes` | `text` | sim |  |  |  |
| 14 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 15 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 16 | `domain` | `text` | sim |  |  |  |
| 17 | `size_bucket` | `text` | sim |  |  |  |
| 18 | `coverage` | `numeric` | sim | `0` |  |  |
| 19 | `engaged_contacts` | `integer` | sim | `0` |  |  |
| 20 | `champion_count` | `integer` | sim | `0` |  |  |
| 21 | `decision_maker_count` | `integer` | sim | `0` |  |  |
| 22 | `last_aggregated_at` | `timestamp with time zone` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| accounts_account_score_check | CHECK | `CHECK (account_score >= 0 AND account_score <= 100)` |  |  | sim |
| accounts_health_status_check | CHECK | `CHECK (health_status = ANY (ARRAY['healthy'::text, 'at_risk'::text, 'critical'::text, 'unknown'::text]))` |  |  | sim |
| accounts_owner_id_fkey | FOREIGN KEY | `FOREIGN KEY (owner_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| accounts_parent_account_id_fkey | FOREIGN KEY | `FOREIGN KEY (parent_account_id) REFERENCES accounts(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| accounts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| accounts_size_bucket_check | CHECK | `CHECK (size_bucket = ANY (ARRAY['smb'::text, 'mid'::text, 'enterprise'::text]))` |  |  | sim |
| accounts_tier_check | CHECK | `CHECK (tier = ANY (ARRAY['strategic'::text, 'enterprise'::text, 'mid_market'::text, 'smb'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.account_activities | account_activities_account_id_fkey | account_id | CASCADE |
| public.account_contacts | account_contacts_account_id_fkey | account_id | CASCADE |
| public.account_plans | account_plans_account_id_fkey | account_id | CASCADE |
| public.accounts | accounts_parent_account_id_fkey | parent_account_id | SET NULL |
| public.csat_ces_surveys | csat_ces_surveys_account_id_fkey | account_id | CASCADE |
| public.expansion_opportunities | expansion_opportunities_account_id_fkey | account_id | CASCADE |
| public.onboarding_journeys | onboarding_journeys_account_id_fkey | account_id | CASCADE |
| public.product_usage_events | product_usage_events_account_id_fkey | account_id | CASCADE |
| public.product_usage_summary | product_usage_summary_account_id_fkey | account_id | CASCADE |
| public.qbr_schedule | qbr_schedule_account_id_fkey | account_id | CASCADE |
| public.renewals | renewals_account_id_fkey | account_id | CASCADE |
| public.sales | sales_account_id_fkey | account_id | SET NULL |
| public.support_tickets | support_tickets_account_id_fkey | account_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| accounts_name_lower_uniq | btree |  | sim | sim |  | `CREATE UNIQUE INDEX accounts_name_lower_uniq ON public.accounts USING btree (lower(name))` |
| accounts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX accounts_pkey ON public.accounts USING btree (id)` |
| idx_accounts_owner | btree | owner_id | não | sim |  | `CREATE INDEX idx_accounts_owner ON public.accounts USING btree (owner_id)` |
| idx_accounts_parent | btree | parent_account_id | não | sim |  | `CREATE INDEX idx_accounts_parent ON public.accounts USING btree (parent_account_id)` |
| idx_accounts_tier | btree | tier | não | sim |  | `CREATE INDEX idx_accounts_tier ON public.accounts USING btree (tier)` |


## Policies (RLS)

### `Owners and managers can manage accounts`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(is_admin_or_manager(auth.uid()) OR (owner_id = get_current_salesperson_id()))` |
| WITH CHECK | `(is_admin_or_manager(auth.uid()) OR (owner_id = get_current_salesperson_id()))` |

### `Owners and managers can view accounts`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(is_admin_or_manager(auth.uid()) OR (owner_id = get_current_salesperson_id()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_accounts_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
