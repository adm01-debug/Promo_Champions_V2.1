# public.mql_qualifications

> Informações de qualificação de leads como marketing-qualified leads (MQL).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do registro de qualificação. |
| 2 | `sale_id` | `uuid` | sim |  |  | Negócio associado à qualificação, quando houver. |
| 3 | `qualified_by` | `uuid` | sim |  |  | Vendedor que registrou a qualificação, quando identificado. |
| 4 | `budget_range` | `text` | sim |  |  | Faixa de orçamento informada durante a qualificação. |
| 5 | `authority_level` | `text` | sim |  |  | Nível de autoridade do contato no processo de decisão. |
| 6 | `need_urgency` | `text` | sim |  |  | Urgência da necessidade identificada. |
| 7 | `timeline` | `text` | sim |  |  | Prazo ou cronograma informado para a decisão ou compra. |
| 8 | `pain_points` | `text[]` | sim |  |  | Lista de problemas ou necessidades informados pelo lead. |
| 9 | `competitors` | `text[]` | sim |  |  | Lista de concorrentes considerados pelo lead. |
| 10 | `decision_process` | `text` | sim |  |  | Descrição do processo de decisão informado. |
| 11 | `qualification_status` | `text` | sim | `'pending'::text` |  | Estado da qualificação do lead. |
| 12 | `unqualified_reason` | `text` | sim |  |  | Motivo pelo qual o lead foi considerado não qualificado. |
| 13 | `nurture_reason` | `text` | sim |  |  | Motivo para manter o lead em nutrição. |
| 14 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora de criação do registro. |
| 15 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora da última atualização do registro. |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
