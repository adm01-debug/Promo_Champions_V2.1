# public.deal_outcomes

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | sim |  |  |  |
| 3 | `salesperson_id` | `uuid` | sim |  |  |  |
| 4 | `outcome` | `text` | não |  |  |  |
| 5 | `reason` | `text` | não |  |  |  |
| 6 | `notes` | `text` | sim |  |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| deal_outcomes_outcome_check | CHECK | `CHECK (outcome = ANY (ARRAY['won'::text, 'lost'::text]))` |  |  | sim |
| deal_outcomes_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| deal_outcomes_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| deal_outcomes_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| deal_outcomes_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX deal_outcomes_pkey ON public.deal_outcomes USING btree (id)` |
| idx_deal_outcomes_created | btree | created_at | não | sim |  | `CREATE INDEX idx_deal_outcomes_created ON public.deal_outcomes USING btree (created_at DESC)` |
| idx_deal_outcomes_sale | btree | sale_id | não | sim |  | `CREATE INDEX idx_deal_outcomes_sale ON public.deal_outcomes USING btree (sale_id)` |
| idx_deal_outcomes_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_deal_outcomes_salesperson ON public.deal_outcomes USING btree (salesperson_id)` |


## Policies (RLS)

### `Users can delete own outcomes`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can insert own outcomes`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |

### `Users can read own outcomes or admins all`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can update own outcomes`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
