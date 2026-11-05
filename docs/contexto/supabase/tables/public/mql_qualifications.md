# public.mql_qualifications

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | sim |  |  |  |
| 3 | `qualified_by` | `uuid` | sim |  |  |  |
| 4 | `budget_range` | `text` | sim |  |  |  |
| 5 | `authority_level` | `text` | sim |  |  |  |
| 6 | `need_urgency` | `text` | sim |  |  |  |
| 7 | `timeline` | `text` | sim |  |  |  |
| 8 | `pain_points` | `text[]` | sim |  |  |  |
| 9 | `competitors` | `text[]` | sim |  |  |  |
| 10 | `decision_process` | `text` | sim |  |  |  |
| 11 | `qualification_status` | `text` | sim | `'pending'::text` |  |  |
| 12 | `unqualified_reason` | `text` | sim |  |  |  |
| 13 | `nurture_reason` | `text` | sim |  |  |  |
| 14 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 15 | `updated_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| mql_qualifications_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| mql_qualifications_qualified_by_fkey | FOREIGN KEY | `FOREIGN KEY (qualified_by) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| mql_qualifications_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_mql_qualifications_qualified_by | btree | qualified_by | não | sim |  | `CREATE INDEX idx_mql_qualifications_qualified_by ON public.mql_qualifications USING btree (qualified_by)` |
| idx_mql_qualifications_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_mql_qualifications_sale_id ON public.mql_qualifications USING btree (sale_id)` |
| mql_qualifications_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX mql_qualifications_pkey ON public.mql_qualifications USING btree (id)` |


## Policies (RLS)

### `Users can manage own qualifications`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((auth.uid() = qualified_by) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK | `((auth.uid() = qualified_by) OR is_admin_or_manager(auth.uid()))` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_mql_qualifications_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

_nenhum_
