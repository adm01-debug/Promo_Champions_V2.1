# public.expansion_opportunities

> Tabela public.expansion_opportunities. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), account_id uuid NOT NULL, playbook_id uuid NULLABLE, type expansion_type NOT NULL DEFAULT 'upsell'::expansion_type, estimated_value numeric(14,2) NOT NULL DEFAULT 0, status expansion_opp_status NOT NULL DEFAULT 'identified'::expansion_opp_status, confidence_score integer NOT NULL DEFAULT 50, notes text NULLABLE, owner_salesperson_id uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: account_id → public.accounts(id); owner_salesperson_id → public.salespeople(id); playbook_id → public.expansion_playbooks(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.expansion_opportunities. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `account_id` | `uuid` | não |  |  | Coluna account_id da tabela public.expansion_opportunities. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.accounts(id). |
| 3 | `playbook_id` | `uuid` | sim |  |  | Coluna playbook_id da tabela public.expansion_opportunities. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.expansion_playbooks(id). |
| 4 | `type` | `expansion_type` | não | `'upsell'::expansion_type` |  | Coluna type da tabela public.expansion_opportunities. Tipo PostgreSQL: expansion_type. Não aceita NULL. Valor padrão: 'upsell'::expansion_type. Valores do enum: 'upsell', 'cross_sell', 'expansion'. |
| 5 | `estimated_value` | `numeric(14,2)` | não | `0` |  | Coluna estimated_value da tabela public.expansion_opportunities. Tipo PostgreSQL: numeric(14,2). Não aceita NULL. Valor padrão: 0. |
| 6 | `status` | `expansion_opp_status` | não | `'identified'::expansion_opp_status` |  | Coluna status da tabela public.expansion_opportunities. Tipo PostgreSQL: expansion_opp_status. Não aceita NULL. Valor padrão: 'identified'::expansion_opp_status. Valores do enum: 'identified', 'qualified', 'proposed', 'won', 'lost'. |
| 7 | `confidence_score` | `integer` | não | `50` |  | Coluna confidence_score da tabela public.expansion_opportunities. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 50. |
| 8 | `notes` | `text` | sim |  |  | Coluna notes da tabela public.expansion_opportunities. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `owner_salesperson_id` | `uuid` | sim |  |  | Coluna owner_salesperson_id da tabela public.expansion_opportunities. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.expansion_opportunities. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.expansion_opportunities. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| expansion_opportunities_account_id_fkey | FOREIGN KEY | `FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| expansion_opportunities_owner_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (owner_salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| expansion_opportunities_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| expansion_opportunities_playbook_id_fkey | FOREIGN KEY | `FOREIGN KEY (playbook_id) REFERENCES expansion_playbooks(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| expansion_opportunities_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX expansion_opportunities_pkey ON public.expansion_opportunities USING btree (id)` |
| idx_expansion_opp_account | btree | account_id | não | sim |  | `CREATE INDEX idx_expansion_opp_account ON public.expansion_opportunities USING btree (account_id)` |
| idx_expansion_opp_status | btree | status | não | sim |  | `CREATE INDEX idx_expansion_opp_status ON public.expansion_opportunities USING btree (status)` |
| idx_expansion_opportunities_owner_salesperson_id | btree | owner_salesperson_id | não | sim |  | `CREATE INDEX idx_expansion_opportunities_owner_salesperson_id ON public.expansion_opportunities USING btree (owner_salesperson_id)` |
| idx_expansion_opportunities_playbook_id | btree | playbook_id | não | sim |  | `CREATE INDEX idx_expansion_opportunities_playbook_id ON public.expansion_opportunities USING btree (playbook_id)` |


## Policies (RLS)

### `cs_eo_modify`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()))` |
| WITH CHECK | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()))` |

### `cs_eo_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = expansion_opportunities.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_exp_opps_uat | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
