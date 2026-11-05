# public.website_visitor_logs

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
| 2 | `ip_address` | `text` | sim |  |  |  |
| 3 | `company_name` | `text` | sim |  |  |  |
| 4 | `domain` | `text` | sim |  |  |  |
| 5 | `page_viewed` | `text` | sim |  |  |  |
| 6 | `referrer` | `text` | sim |  |  |  |
| 7 | `duration_seconds` | `integer` | sim |  |  |  |
| 8 | `identified_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 9 | `legal_basis` | `text` | não | `'legitimate_interest'::text` |  |  |
| 10 | `consent_record_id` | `uuid` | sim |  |  |  |
| 11 | `retention_expires_at` | `timestamp with time zone` | sim | `(now() + '90 days'::interval)` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| website_visitor_logs_consent_record_id_fkey | FOREIGN KEY | `FOREIGN KEY (consent_record_id) REFERENCES consent_records(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| website_visitor_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
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

_nenhum_
