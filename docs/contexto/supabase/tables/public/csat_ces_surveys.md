# public.csat_ces_surveys

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
| 2 | `account_id` | `uuid` | sim |  |  |  |
| 3 | `contact_email` | `text` | sim |  |  |  |
| 4 | `survey_type` | `cs_survey_type` | não | `'csat'::cs_survey_type` |  |  |
| 5 | `score` | `integer` | sim |  |  |  |
| 6 | `comment` | `text` | sim |  |  |  |
| 7 | `trigger_event` | `text` | sim |  |  |  |
| 8 | `sent_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `responded_at` | `timestamp with time zone` | sim |  |  |  |
| 10 | `metadata` | `jsonb` | não | `'{}'::jsonb` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| csat_ces_surveys_account_id_fkey | FOREIGN KEY | `FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| csat_ces_surveys_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| csat_ces_surveys_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX csat_ces_surveys_pkey ON public.csat_ces_surveys USING btree (id)` |
| idx_csatces_account | btree | account_id | não | sim |  | `CREATE INDEX idx_csatces_account ON public.csat_ces_surveys USING btree (account_id)` |
| idx_csatces_type | btree | survey_type | não | sim |  | `CREATE INDEX idx_csatces_type ON public.csat_ces_surveys USING btree (survey_type)` |


## Policies (RLS)

### `cs_sv_modify`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `cs_sv_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = csat_ces_surveys.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
