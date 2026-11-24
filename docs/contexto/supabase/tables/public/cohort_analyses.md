# public.cohort_analyses

> Tabela public.cohort_analyses. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), owner_id uuid NOT NULL, name text NOT NULL, description text NULLABLE, cohort_field text NOT NULL DEFAULT 'created_at'::text, metric_field text NOT NULL DEFAULT 'amount'::text, period_type text NOT NULL DEFAULT 'month'::text, config jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.cohort_analyses. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `owner_id` | `uuid` | não |  |  | Coluna owner_id da tabela public.cohort_analyses. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `name` | `text` | não |  |  | Coluna name da tabela public.cohort_analyses. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `description` | `text` | sim |  |  | Coluna description da tabela public.cohort_analyses. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `cohort_field` | `text` | não | `'created_at'::text` |  | Coluna cohort_field da tabela public.cohort_analyses. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'created_at'::text. |
| 6 | `metric_field` | `text` | não | `'amount'::text` |  | Coluna metric_field da tabela public.cohort_analyses. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'amount'::text. |
| 7 | `period_type` | `text` | não | `'month'::text` |  | Coluna period_type da tabela public.cohort_analyses. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'month'::text. Validação CHECK: CHECK (period_type = ANY (ARRAY['week'::text, 'month'::text, 'quarter'::text])). |
| 8 | `config` | `jsonb` | não | `'{}'::jsonb` |  | Coluna config da tabela public.cohort_analyses. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.cohort_analyses. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.cohort_analyses. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cohort_analyses_period_type_check | CHECK | `CHECK (period_type = ANY (ARRAY['week'::text, 'month'::text, 'quarter'::text]))` |  |  | sim |
| cohort_analyses_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cohort_analyses_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cohort_analyses_pkey ON public.cohort_analyses USING btree (id)` |
| idx_cohort_analyses_owner | btree | owner_id | não | sim |  | `CREATE INDEX idx_cohort_analyses_owner ON public.cohort_analyses USING btree (owner_id)` |


## Policies (RLS)

### `owner_full_access_cohorts`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_cohort_analyses_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
