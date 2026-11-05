# public.expansion_opportunities

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
| 2 | `account_id` | `uuid` | não |  |  |  |
| 3 | `playbook_id` | `uuid` | sim |  |  |  |
| 4 | `type` | `expansion_type` | não | `'upsell'::expansion_type` |  |  |
| 5 | `estimated_value` | `numeric(14,2)` | não | `0` |  |  |
| 6 | `status` | `expansion_opp_status` | não | `'identified'::expansion_opp_status` |  |  |
| 7 | `confidence_score` | `integer` | não | `50` |  |  |
| 8 | `notes` | `text` | sim |  |  |  |
| 9 | `owner_salesperson_id` | `uuid` | sim |  |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


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

_nenhum_
