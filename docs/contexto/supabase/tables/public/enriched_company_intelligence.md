# public.enriched_company_intelligence

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
| 2 | `company_name` | `text` | não |  |  |  |
| 3 | `domain` | `text` | sim |  |  |  |
| 4 | `headcount_range` | `text` | sim |  |  |  |
| 5 | `estimated_annual_revenue` | `text` | sim |  |  |  |
| 6 | `funding_stage` | `text` | sim |  |  |  |
| 7 | `total_funding` | `text` | sim |  |  |  |
| 8 | `tech_stack` | `text[]` | sim |  |  |  |
| 9 | `industry` | `text` | sim |  |  |  |
| 10 | `hq_location` | `text` | sim |  |  |  |
| 11 | `linkedin_url` | `text` | sim |  |  |  |
| 12 | `last_enriched_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 13 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 14 | `updated_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| enriched_company_intelligence_company_name_key | UNIQUE | `UNIQUE (company_name)` |  |  | sim |
| enriched_company_intelligence_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.buying_signals | buying_signals_company_id_fkey | company_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| enriched_company_intelligence_company_name_key | btree | company_name | sim | sim |  | `CREATE UNIQUE INDEX enriched_company_intelligence_company_name_key ON public.enriched_company_intelligence USING btree (company_name)` |
| enriched_company_intelligence_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX enriched_company_intelligence_pkey ON public.enriched_company_intelligence USING btree (id)` |


## Policies (RLS)

### `Admins e Managers podem ver inteligência de empresas`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_enriched_company_intelligence_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
