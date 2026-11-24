# public.monthly_sales_summary

> Tabela public.monthly_sales_summary. Estrutura registrada no catálogo do PostgreSQL: month text NOT NULL, revenue numeric NULLABLE DEFAULT 0, deals integer NULLABLE DEFAULT 0, won_deals integer NULLABLE DEFAULT 0, updated_at timestamp with time zone NULLABLE DEFAULT now(), lost_deals integer NOT NULL DEFAULT 0.

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
| 1 | `month` | `text` | não |  |  | Coluna month da tabela public.monthly_sales_summary. Tipo PostgreSQL: text. Participa da chave primária. Não aceita NULL. |
| 2 | `revenue` | `numeric` | sim | `0` |  | Coluna revenue da tabela public.monthly_sales_summary. Tipo PostgreSQL: numeric. Aceita NULL. Valor padrão: 0. |
| 3 | `deals` | `integer` | sim | `0` |  | Coluna deals da tabela public.monthly_sales_summary. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 0. |
| 4 | `won_deals` | `integer` | sim | `0` |  | Coluna won_deals da tabela public.monthly_sales_summary. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 0. |
| 5 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Coluna updated_at da tabela public.monthly_sales_summary. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 6 | `lost_deals` | `integer` | não | `0` |  | Coluna lost_deals da tabela public.monthly_sales_summary. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| monthly_sales_summary_pkey | PRIMARY KEY | `PRIMARY KEY (month)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| monthly_sales_summary_pkey | btree | month | sim | sim |  | `CREATE UNIQUE INDEX monthly_sales_summary_pkey ON public.monthly_sales_summary USING btree (month)` |


## Policies (RLS)

### `Managers e admins podem ver monthly_sales_summary`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
