# public.account_contacts

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
| 3 | `name` | `text` | não |  |  |  |
| 4 | `email` | `text` | sim |  |  |  |
| 5 | `phone` | `text` | sim |  |  |  |
| 6 | `job_title` | `text` | sim |  |  |  |
| 7 | `department` | `text` | sim |  |  |  |
| 8 | `buying_role` | `text` | não | `'user'::text` |  |  |
| 9 | `influence_level` | `integer` | não | `3` |  |  |
| 10 | `sentiment` | `text` | não | `'neutral'::text` |  |  |
| 11 | `linkedin_url` | `text` | sim |  |  |  |
| 12 | `last_contacted_at` | `timestamp with time zone` | sim |  |  |  |
| 13 | `notes` | `text` | sim |  |  |  |
| 14 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 15 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 16 | `sale_id` | `uuid` | sim |  |  |  |
| 17 | `seniority` | `text` | sim |  |  |  |
| 18 | `is_primary` | `boolean` | sim | `false` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| account_contacts_account_id_fkey | FOREIGN KEY | `FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| account_contacts_buying_role_check | CHECK | `CHECK (buying_role = ANY (ARRAY['decision_maker'::text, 'champion'::text, 'influencer'::text, 'blocker'::text, 'user'::text, 'technical'::text]))` |  |  | sim |
| account_contacts_influence_level_check | CHECK | `CHECK (influence_level >= 1 AND influence_level <= 5)` |  |  | sim |
| account_contacts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| account_contacts_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| account_contacts_seniority_check | CHECK | `CHECK (seniority = ANY (ARRAY['c_level'::text, 'vp'::text, 'director'::text, 'manager'::text, 'ic'::text]))` |  |  | sim |
| account_contacts_sentiment_check | CHECK | `CHECK (sentiment = ANY (ARRAY['positive'::text, 'neutral'::text, 'negative'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.account_activities | account_activities_contact_id_fkey | contact_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| account_contacts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX account_contacts_pkey ON public.account_contacts USING btree (id)` |
| idx_account_contacts_account | btree | account_id | não | sim |  | `CREATE INDEX idx_account_contacts_account ON public.account_contacts USING btree (account_id)` |
| idx_account_contacts_role | btree | buying_role | não | sim |  | `CREATE INDEX idx_account_contacts_role ON public.account_contacts USING btree (buying_role)` |
| idx_account_contacts_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_account_contacts_sale_id ON public.account_contacts USING btree (sale_id)` |


## Policies (RLS)

### `Manage contacts of accessible accounts`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = account_contacts.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| WITH CHECK | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = account_contacts.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |

### `View contacts of accessible accounts`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = account_contacts.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_account_contacts_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
