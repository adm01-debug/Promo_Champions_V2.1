# public.lead_scores

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
| 2 | `sale_id` | `uuid` | não |  |  |  |
| 3 | `score` | `integer` | não | `0` |  |  |
| 4 | `factors` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 5 | `calculated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| lead_scores_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| lead_scores_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| lead_scores_sale_id_key | UNIQUE | `UNIQUE (sale_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_lead_scores_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_lead_scores_sale_id ON public.lead_scores USING btree (sale_id)` |
| lead_scores_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX lead_scores_pkey ON public.lead_scores USING btree (id)` |
| lead_scores_sale_id_key | btree | sale_id | sim | sim |  | `CREATE UNIQUE INDEX lead_scores_sale_id_key ON public.lead_scores USING btree (sale_id)` |


## Policies (RLS)

### `Users can delete own lead scores`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = lead_scores.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |
| WITH CHECK |  |

### `Users can insert lead scores for own sales`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = lead_scores.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |

### `Users can read own lead scores or admins all`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = lead_scores.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |
| WITH CHECK |  |

### `Users can update own lead scores`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = lead_scores.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_lead_scores_history | AFTER | INSERT OR UPDATE | ROW | enabled | public.record_lead_score_history |
| update_lead_scores_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
