# public.salesperson_commission_configs

> Tabela public.salesperson_commission_configs. Estrutura registrada no catálogo do PostgreSQL: salesperson_id uuid NOT NULL, month date NOT NULL, rate numeric NOT NULL, created_at timestamp with time zone NULLABLE DEFAULT now(), updated_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: salesperson_id → public.salespeople(id).

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
| 1 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.salesperson_commission_configs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Referência FK: public.salespeople(id). |
| 2 | `month` | `date` | não |  |  | Coluna month da tabela public.salesperson_commission_configs. Tipo PostgreSQL: date. Participa da chave primária. Não aceita NULL. |
| 3 | `rate` | `numeric` | não |  |  | Coluna rate da tabela public.salesperson_commission_configs. Tipo PostgreSQL: numeric. Não aceita NULL. |
| 4 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.salesperson_commission_configs. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 5 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Coluna updated_at da tabela public.salesperson_commission_configs. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| salesperson_commission_configs_pkey | PRIMARY KEY | `PRIMARY KEY (salesperson_id, month)` |  |  | sim |
| salesperson_commission_configs_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_salesperson_commission_configs_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_salesperson_commission_configs_salesperson_id ON public.salesperson_commission_configs USING btree (salesperson_id)` |
| salesperson_commission_configs_pkey | btree | salesperson_id, month | sim | sim |  | `CREATE UNIQUE INDEX salesperson_commission_configs_pkey ON public.salesperson_commission_configs USING btree (salesperson_id, month)` |


## Policies (RLS)

### `Admins can manage commission configs`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Salespeople can view their own commission config`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(get_current_salesperson_id() = salesperson_id)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
