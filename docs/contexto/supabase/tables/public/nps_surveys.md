# public.nps_surveys

> Tabela public.nps_surveys. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NULLABLE, client_name text NOT NULL, salesperson_id uuid NULLABLE, survey_type text NOT NULL DEFAULT 'nps'::text, score integer NULLABLE, comment text NULLABLE, status text NOT NULL DEFAULT 'pending'::text, sent_at timestamp with time zone NULLABLE, responded_at timestamp with time zone NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), score_ces integer NULLABLE. Relacionamentos FK: sale_id → public.sales(id); salesperson_id → public.salespeople(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 7 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.nps_surveys. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | sim |  |  | Coluna sale_id da tabela public.nps_surveys. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sales(id). |
| 3 | `client_name` | `text` | não |  |  | Coluna client_name da tabela public.nps_surveys. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `salesperson_id` | `uuid` | sim |  |  | Coluna salesperson_id da tabela public.nps_surveys. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |
| 5 | `survey_type` | `text` | não | `'nps'::text` |  | Coluna survey_type da tabela public.nps_surveys. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'nps'::text. Validação CHECK: CHECK (survey_type = ANY (ARRAY['nps'::text, 'csat'::text])). |
| 6 | `score` | `integer` | sim |  |  | Coluna score da tabela public.nps_surveys. Tipo PostgreSQL: integer. Aceita NULL. Validação CHECK: CHECK (score >= 0 AND score <= 10). |
| 7 | `comment` | `text` | sim |  |  | Coluna comment da tabela public.nps_surveys. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `status` | `text` | não | `'pending'::text` |  | Coluna status da tabela public.nps_surveys. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pending'::text. Validação CHECK: CHECK (status = ANY (ARRAY['pending'::text, 'sent'::text, 'responded'::text])). |
| 9 | `sent_at` | `timestamp with time zone` | sim |  |  | Coluna sent_at da tabela public.nps_surveys. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 10 | `responded_at` | `timestamp with time zone` | sim |  |  | Coluna responded_at da tabela public.nps_surveys. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.nps_surveys. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 12 | `score_ces` | `integer` | sim |  |  | Coluna score_ces da tabela public.nps_surveys. Tipo PostgreSQL: integer. Aceita NULL. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| nps_surveys_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| nps_surveys_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| nps_surveys_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| nps_surveys_score_check | CHECK | `CHECK (score >= 0 AND score <= 10)` |  |  | sim |
| nps_surveys_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'sent'::text, 'responded'::text]))` |  |  | sim |
| nps_surveys_survey_type_check | CHECK | `CHECK (survey_type = ANY (ARRAY['nps'::text, 'csat'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_nps_surveys_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_nps_surveys_sale_id ON public.nps_surveys USING btree (sale_id)` |
| idx_nps_surveys_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_nps_surveys_salesperson_id ON public.nps_surveys USING btree (salesperson_id)` |
| nps_surveys_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX nps_surveys_pkey ON public.nps_surveys USING btree (id)` |


## Policies (RLS)

### `Salespeople can create their own nps surveys`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(get_current_salesperson_id() = salesperson_id)` |

### `Salespeople can delete their own nps surveys`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((get_current_salesperson_id() = salesperson_id) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Salespeople can update their own nps surveys`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((get_current_salesperson_id() = salesperson_id) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `nps_surveys_delete_admin_manager`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `nps_surveys_insert_owner_or_manager`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |

### `nps_surveys_select_owner_or_manager`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `nps_surveys_update_owner_or_manager`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
