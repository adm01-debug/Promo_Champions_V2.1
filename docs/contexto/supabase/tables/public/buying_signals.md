# public.buying_signals

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
| 2 | `company_id` | `uuid` | sim |  |  |  |
| 3 | `signal_type` | `text` | não |  |  |  |
| 4 | `signal_description` | `text` | sim |  |  |  |
| 5 | `source_url` | `text` | sim |  |  |  |
| 6 | `significance_score` | `integer` | sim |  |  |  |
| 7 | `occurred_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 8 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


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
