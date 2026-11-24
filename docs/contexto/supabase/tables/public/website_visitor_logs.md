# public.website_visitor_logs

> Tabela public.website_visitor_logs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), ip_address text NULLABLE, company_name text NULLABLE, domain text NULLABLE, page_viewed text NULLABLE, referrer text NULLABLE, duration_seconds integer NULLABLE, identified_at timestamp with time zone NULLABLE DEFAULT now(), legal_basis text NOT NULL DEFAULT 'legitimate_interest'::text, consent_record_id uuid NULLABLE, retention_expires_at timestamp with time zone NULLABLE DEFAULT (now() + '90 days'::interval). Relacionamentos FK: consent_record_id → public.consent_records(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.website_visitor_logs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `ip_address` | `text` | sim |  |  | Coluna ip_address da tabela public.website_visitor_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 3 | `company_name` | `text` | sim |  |  | Coluna company_name da tabela public.website_visitor_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `domain` | `text` | sim |  |  | Coluna domain da tabela public.website_visitor_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `page_viewed` | `text` | sim |  |  | Coluna page_viewed da tabela public.website_visitor_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `referrer` | `text` | sim |  |  | Coluna referrer da tabela public.website_visitor_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `duration_seconds` | `integer` | sim |  |  | Coluna duration_seconds da tabela public.website_visitor_logs. Tipo PostgreSQL: integer. Aceita NULL. |
| 8 | `identified_at` | `timestamp with time zone` | sim | `now()` |  | Coluna identified_at da tabela public.website_visitor_logs. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 9 | `legal_basis` | `text` | não | `'legitimate_interest'::text` |  | Coluna legal_basis da tabela public.website_visitor_logs. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'legitimate_interest'::text. |
| 10 | `consent_record_id` | `uuid` | sim |  |  | Coluna consent_record_id da tabela public.website_visitor_logs. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.consent_records(id). |
| 11 | `retention_expires_at` | `timestamp with time zone` | sim | `(now() + '90 days'::interval)` |  | Coluna retention_expires_at da tabela public.website_visitor_logs. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: (now() + '90 days'::interval). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| website_visitor_logs_consent_record_id_fkey | FOREIGN KEY | `FOREIGN KEY (consent_record_id) REFERENCES consent_records(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| website_visitor_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_website_visitor_logs_consent_record_id | btree | consent_record_id | não | sim |  | `CREATE INDEX idx_website_visitor_logs_consent_record_id ON public.website_visitor_logs USING btree (consent_record_id)` |
| idx_website_visitor_logs_domain_identified | btree | domain, identified_at | não | sim |  | `CREATE INDEX idx_website_visitor_logs_domain_identified ON public.website_visitor_logs USING btree (domain, identified_at DESC)` |
| idx_website_visitor_logs_retention | btree | retention_expires_at | não | sim | `(consent_record_id IS NULL)` | `CREATE INDEX idx_website_visitor_logs_retention ON public.website_visitor_logs USING btree (retention_expires_at) WHERE (consent_record_id IS NULL)` |
| website_visitor_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX website_visitor_logs_pkey ON public.website_visitor_logs USING btree (id)` |


## Policies (RLS)

### `Admins e Managers podem ver logs de visitantes`

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
| trg_website_visitor_log_consent | BEFORE | INSERT | ROW | enabled | public.fn_website_visitor_log_consent |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
