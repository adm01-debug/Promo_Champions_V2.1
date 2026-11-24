# public.client_renewals

> Acompanhamento de renovação de contratos de clientes.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único da oportunidade de renovação. |
| 2 | `client_id` | `uuid` | não |  |  | Cliente cujo contrato está em renovação. |
| 3 | `contract_end_date` | `date` | não |  |  | Data de término do contrato atual. |
| 4 | `renewal_value` | `numeric(15,2)` | sim |  |  | Valor estimado da renovação, em BRL. |
| 5 | `status` | `text` | sim | `'pending'::text` |  | Estado da renovação conforme utilizado pela aplicação. |
| 6 | `probability` | `integer` | sim | `70` |  | Probabilidade de renovação, conforme escala utilizada pela aplicação. |
| 7 | `risk_level` | `text` | sim | `'low'::text` |  | Nível de risco associado à renovação. |
| 8 | `notes` | `text` | sim |  |  | Observações sobre a renovação. |
| 9 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora de criação do registro. |
| 10 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora da última atualização do registro. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| client_renewals_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| client_renewals_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| client_renewals_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX client_renewals_pkey ON public.client_renewals USING btree (id)` |
| idx_client_renewals_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_client_renewals_client_id ON public.client_renewals USING btree (client_id)` |


## Policies (RLS)

### `Client renewals scoped visibility`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (client_id IN ( SELECT client_portfolio.client_id    FROM client_portfolio   WHERE (client_portfolio.salesperson_id = get_current_salesperson_id()))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_client_renewals_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
