# public.experiment_assignments

> Tabela public.experiment_assignments. Estrutura registrada no catálogo do PostgreSQL: user_id uuid NOT NULL, experiment_id uuid NOT NULL, variant_id uuid NOT NULL, assigned_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: experiment_id → public.experiments(id); user_id → auth.users(id); variant_id → public.experiment_variants(id).

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
| 1 | `user_id` | `uuid` | não |  |  | Coluna user_id da tabela public.experiment_assignments. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Referência FK: auth.users(id). |
| 2 | `experiment_id` | `uuid` | não |  |  | Coluna experiment_id da tabela public.experiment_assignments. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Referência FK: public.experiments(id). |
| 3 | `variant_id` | `uuid` | não |  |  | Coluna variant_id da tabela public.experiment_assignments. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.experiment_variants(id). |
| 4 | `assigned_at` | `timestamp with time zone` | sim | `now()` |  | Coluna assigned_at da tabela public.experiment_assignments. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| experiment_assignments_experiment_id_fkey | FOREIGN KEY | `FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| experiment_assignments_pkey | PRIMARY KEY | `PRIMARY KEY (user_id, experiment_id)` |  |  | sim |
| experiment_assignments_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| experiment_assignments_variant_id_fkey | FOREIGN KEY | `FOREIGN KEY (variant_id) REFERENCES experiment_variants(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| experiment_assignments_pkey | btree | user_id, experiment_id | sim | sim |  | `CREATE UNIQUE INDEX experiment_assignments_pkey ON public.experiment_assignments USING btree (user_id, experiment_id)` |
| idx_experiment_assignments_experiment_id_fk | btree | experiment_id | não | sim |  | `CREATE INDEX idx_experiment_assignments_experiment_id_fk ON public.experiment_assignments USING btree (experiment_id)` |
| idx_experiment_assignments_variant_id_fk | btree | variant_id | não | sim |  | `CREATE INDEX idx_experiment_assignments_variant_id_fk ON public.experiment_assignments USING btree (variant_id)` |


## Policies (RLS)

### `Admins and managers can manage experiment_assignments`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Users can read their own experiment assignments`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((auth.uid() = user_id) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
