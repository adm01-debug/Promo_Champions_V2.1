# public.person_intelligence

> Tabela public.person_intelligence. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), email text NOT NULL, full_name text NULLABLE, current_title text NULLABLE, previous_titles jsonb NULLABLE, linkedin_url text NULLABLE, job_change_detected_at timestamp with time zone NULLABLE, promotion_detected_at timestamp with time zone NULLABLE, last_verified_at timestamp with time zone NULLABLE DEFAULT now(), created_at timestamp with time zone NULLABLE DEFAULT now(), updated_at timestamp with time zone NULLABLE DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.person_intelligence. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `email` | `text` | não |  |  | Coluna email da tabela public.person_intelligence. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `full_name` | `text` | sim |  |  | Coluna full_name da tabela public.person_intelligence. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `current_title` | `text` | sim |  |  | Coluna current_title da tabela public.person_intelligence. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `previous_titles` | `jsonb` | sim |  |  | Coluna previous_titles da tabela public.person_intelligence. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 6 | `linkedin_url` | `text` | sim |  |  | Coluna linkedin_url da tabela public.person_intelligence. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `job_change_detected_at` | `timestamp with time zone` | sim |  |  | Coluna job_change_detected_at da tabela public.person_intelligence. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 8 | `promotion_detected_at` | `timestamp with time zone` | sim |  |  | Coluna promotion_detected_at da tabela public.person_intelligence. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 9 | `last_verified_at` | `timestamp with time zone` | sim | `now()` |  | Coluna last_verified_at da tabela public.person_intelligence. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 10 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.person_intelligence. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 11 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Coluna updated_at da tabela public.person_intelligence. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| person_intelligence_email_key | UNIQUE | `UNIQUE (email)` |  |  | sim |
| person_intelligence_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| person_intelligence_email_key | btree | email | sim | sim |  | `CREATE UNIQUE INDEX person_intelligence_email_key ON public.person_intelligence USING btree (email)` |
| person_intelligence_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX person_intelligence_pkey ON public.person_intelligence USING btree (id)` |


## Policies (RLS)

### `Admins e Managers podem ver inteligência de pessoas`

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
| update_person_intelligence_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
