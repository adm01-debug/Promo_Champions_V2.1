# public.enriched_company_intelligence

> Tabela public.enriched_company_intelligence. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), company_name text NOT NULL, domain text NULLABLE, headcount_range text NULLABLE, estimated_annual_revenue text NULLABLE, funding_stage text NULLABLE, total_funding text NULLABLE, tech_stack text[] NULLABLE, industry text NULLABLE, hq_location text NULLABLE, linkedin_url text NULLABLE, last_enriched_at timestamp with time zone NULLABLE DEFAULT now(), created_at timestamp with time zone NULLABLE DEFAULT now(), updated_at timestamp with time zone NULLABLE DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.enriched_company_intelligence. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `company_name` | `text` | não |  |  | Coluna company_name da tabela public.enriched_company_intelligence. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `domain` | `text` | sim |  |  | Coluna domain da tabela public.enriched_company_intelligence. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `headcount_range` | `text` | sim |  |  | Coluna headcount_range da tabela public.enriched_company_intelligence. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `estimated_annual_revenue` | `text` | sim |  |  | Coluna estimated_annual_revenue da tabela public.enriched_company_intelligence. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `funding_stage` | `text` | sim |  |  | Coluna funding_stage da tabela public.enriched_company_intelligence. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `total_funding` | `text` | sim |  |  | Coluna total_funding da tabela public.enriched_company_intelligence. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `tech_stack` | `text[]` | sim |  |  | Coluna tech_stack da tabela public.enriched_company_intelligence. Tipo PostgreSQL: text[]. Aceita NULL. |
| 9 | `industry` | `text` | sim |  |  | Coluna industry da tabela public.enriched_company_intelligence. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `hq_location` | `text` | sim |  |  | Coluna hq_location da tabela public.enriched_company_intelligence. Tipo PostgreSQL: text. Aceita NULL. |
| 11 | `linkedin_url` | `text` | sim |  |  | Coluna linkedin_url da tabela public.enriched_company_intelligence. Tipo PostgreSQL: text. Aceita NULL. |
| 12 | `last_enriched_at` | `timestamp with time zone` | sim | `now()` |  | Coluna last_enriched_at da tabela public.enriched_company_intelligence. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 13 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.enriched_company_intelligence. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 14 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Coluna updated_at da tabela public.enriched_company_intelligence. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
