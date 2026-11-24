# public.cs_tickets

> Tickets de atendimento ao cliente vinculados a clientes e responsáveis.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do ticket de CS. |
| 2 | `client_id` | `uuid` | sim |  |  | Cliente associado ao ticket, quando identificado. |
| 3 | `external_id` | `text` | sim |  |  | Identificador do ticket no sistema externo, quando disponível. |
| 4 | `source` | `text` | sim | `'internal'::text` |  | Origem do ticket. |
| 5 | `subject` | `text` | não |  |  | Assunto do ticket. |
| 6 | `description` | `text` | sim |  |  | Descrição da solicitação ou problema. |
| 7 | `status` | `text` | sim | `'open'::text` |  | Estado atual do ticket. |
| 8 | `priority` | `text` | sim | `'medium'::text` |  | Prioridade atual do ticket. |
| 9 | `assigned_to` | `uuid` | sim |  |  | Usuário responsável pelo atendimento, quando atribuído. |
| 10 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora de criação do ticket. |
| 11 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora da última atualização do ticket. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cs_tickets_assigned_to_fkey | FOREIGN KEY | `FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| cs_tickets_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| cs_tickets_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cs_tickets_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cs_tickets_pkey ON public.cs_tickets USING btree (id)` |
| idx_cs_tickets_assigned_to | btree | assigned_to | não | sim |  | `CREATE INDEX idx_cs_tickets_assigned_to ON public.cs_tickets USING btree (assigned_to)` |
| idx_cs_tickets_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_cs_tickets_client_id ON public.cs_tickets USING btree (client_id)` |


## Policies (RLS)

### `CS tickets scoped visibility`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (assigned_to = get_current_salesperson_id()) OR (client_id IN ( SELECT client_portfolio.client_id    FROM client_portfolio   WHERE (client_portfolio.salesperson_id = get_current_salesperson_id()))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_cs_tickets_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
