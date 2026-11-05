# public.person_intelligence

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
| 2 | `email` | `text` | não |  |  |  |
| 3 | `full_name` | `text` | sim |  |  |  |
| 4 | `current_title` | `text` | sim |  |  |  |
| 5 | `previous_titles` | `jsonb` | sim |  |  |  |
| 6 | `linkedin_url` | `text` | sim |  |  |  |
| 7 | `job_change_detected_at` | `timestamp with time zone` | sim |  |  |  |
| 8 | `promotion_detected_at` | `timestamp with time zone` | sim |  |  |  |
| 9 | `last_verified_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 10 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 11 | `updated_at` | `timestamp with time zone` | sim | `now()` |  |  |


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

_nenhum_
