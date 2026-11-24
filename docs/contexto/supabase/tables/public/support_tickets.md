# public.support_tickets

> Tickets de suporte associados a contas empresariais.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do ticket. |
| 2 | `account_id` | `uuid` | não |  |  | Conta empresarial associada ao ticket. |
| 3 | `external_id` | `text` | sim |  |  | Identificador do ticket no sistema externo, quando disponível. |
| 4 | `source` | `text` | não | `'internal'::text` |  | Sistema ou origem do ticket. |
| 5 | `subject` | `text` | não |  |  | Assunto do ticket. |
| 6 | `description` | `text` | sim |  |  | Descrição do problema ou solicitação. |
| 7 | `status` | `support_ticket_status` | não | `'open'::support_ticket_status` |  | Estado do ticket conforme o tipo support_ticket_status. |
| 8 | `priority` | `support_ticket_priority` | não | `'normal'::support_ticket_priority` |  | Prioridade do ticket conforme o tipo support_ticket_priority. |
| 9 | `sentiment` | `text` | sim |  |  | Sentimento associado ao ticket, quando disponível. |
| 10 | `requester_email` | `text` | sim |  |  | E-mail de quem abriu o ticket, quando informado. |
| 11 | `assignee_email` | `text` | sim |  |  | E-mail do responsável pelo ticket, quando atribuído. |
| 12 | `tags` | `text[]` | sim |  |  | Marcadores associados ao ticket. |
| 13 | `metadata` | `jsonb` | não | `'{}'::jsonb` |  | Metadados adicionais do ticket em formato JSON. |
| 14 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação do ticket. |
| 15 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Data e hora da última atualização do ticket. |
| 16 | `resolved_at` | `timestamp with time zone` | sim |  |  | Data e hora de resolução do ticket. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| support_tickets_account_id_fkey | FOREIGN KEY | `FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| support_tickets_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_support_tickets_account | btree | account_id | não | sim |  | `CREATE INDEX idx_support_tickets_account ON public.support_tickets USING btree (account_id)` |
| idx_support_tickets_status | btree | status | não | sim |  | `CREATE INDEX idx_support_tickets_status ON public.support_tickets USING btree (status)` |
| support_tickets_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX support_tickets_pkey ON public.support_tickets USING btree (id)` |
| uniq_support_tickets_external | btree | source, external_id | sim | sim | `(external_id IS NOT NULL)` | `CREATE UNIQUE INDEX uniq_support_tickets_external ON public.support_tickets USING btree (source, external_id) WHERE (external_id IS NOT NULL)` |


## Policies (RLS)

### `cs_st_delete`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `cs_st_insert`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = support_tickets.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |

### `cs_st_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = support_tickets.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |

### `cs_st_update`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_support_tickets_uat | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
