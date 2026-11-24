# public.qbr_reports

> Tabela public.qbr_reports. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), period_label text NOT NULL, period_start date NOT NULL, period_end date NOT NULL, salesperson_id uuid NULLABLE, metrics jsonb NOT NULL DEFAULT '{}'::jsonb, ai_narrative text NULLABLE, recommendations jsonb NOT NULL DEFAULT '[]'::jsonb, generated_by uuid NULLABLE, generated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: salesperson_id → public.salespeople(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.qbr_reports. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `period_label` | `text` | não |  |  | Coluna period_label da tabela public.qbr_reports. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `period_start` | `date` | não |  |  | Coluna period_start da tabela public.qbr_reports. Tipo PostgreSQL: date. Não aceita NULL. |
| 4 | `period_end` | `date` | não |  |  | Coluna period_end da tabela public.qbr_reports. Tipo PostgreSQL: date. Não aceita NULL. |
| 5 | `salesperson_id` | `uuid` | sim |  |  | Coluna salesperson_id da tabela public.qbr_reports. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |
| 6 | `metrics` | `jsonb` | não | `'{}'::jsonb` |  | Coluna metrics da tabela public.qbr_reports. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 7 | `ai_narrative` | `text` | sim |  |  | Coluna ai_narrative da tabela public.qbr_reports. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `recommendations` | `jsonb` | não | `'[]'::jsonb` |  | Coluna recommendations da tabela public.qbr_reports. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 9 | `generated_by` | `uuid` | sim |  |  | Coluna generated_by da tabela public.qbr_reports. Tipo PostgreSQL: uuid. Aceita NULL. |
| 10 | `generated_at` | `timestamp with time zone` | não | `now()` |  | Coluna generated_at da tabela public.qbr_reports. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| qbr_reports_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| qbr_reports_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_qbr_period | btree | period_start | não | sim |  | `CREATE INDEX idx_qbr_period ON public.qbr_reports USING btree (period_start DESC)` |
| idx_qbr_sp | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_qbr_sp ON public.qbr_reports USING btree (salesperson_id)` |
| qbr_reports_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX qbr_reports_pkey ON public.qbr_reports USING btree (id)` |


## Policies (RLS)

### `qbr_delete_admin`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `qbr_insert_admin`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `qbr_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (salesperson_id = get_current_salesperson_id()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
