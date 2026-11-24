# public.buying_signals

> Tabela public.buying_signals. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), company_id uuid NULLABLE, signal_type text NOT NULL, signal_description text NULLABLE, source_url text NULLABLE, significance_score integer NULLABLE, occurred_at timestamp with time zone NULLABLE DEFAULT now(), created_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: company_id → public.enriched_company_intelligence(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.buying_signals. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `company_id` | `uuid` | sim |  |  | Coluna company_id da tabela public.buying_signals. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.enriched_company_intelligence(id). |
| 3 | `signal_type` | `text` | não |  |  | Coluna signal_type da tabela public.buying_signals. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `signal_description` | `text` | sim |  |  | Coluna signal_description da tabela public.buying_signals. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `source_url` | `text` | sim |  |  | Coluna source_url da tabela public.buying_signals. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `significance_score` | `integer` | sim |  |  | Coluna significance_score da tabela public.buying_signals. Tipo PostgreSQL: integer. Aceita NULL. Validação CHECK: CHECK (significance_score >= 1 AND significance_score <= 100). |
| 7 | `occurred_at` | `timestamp with time zone` | sim | `now()` |  | Coluna occurred_at da tabela public.buying_signals. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 8 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.buying_signals. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| buying_signals_company_id_fkey | FOREIGN KEY | `FOREIGN KEY (company_id) REFERENCES enriched_company_intelligence(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| buying_signals_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| buying_signals_significance_score_check | CHECK | `CHECK (significance_score >= 1 AND significance_score <= 100)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| buying_signals_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX buying_signals_pkey ON public.buying_signals USING btree (id)` |
| idx_buying_signals_company_id | btree | company_id | não | sim |  | `CREATE INDEX idx_buying_signals_company_id ON public.buying_signals USING btree (company_id)` |


## Policies (RLS)

### `Admins e Managers podem ver sinais de compra`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
