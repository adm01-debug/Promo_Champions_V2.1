# public.experiment_variants

> Tabela public.experiment_variants. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT uuid_generate_v4(), experiment_id uuid NOT NULL, name text NOT NULL, weight integer NOT NULL DEFAULT 50, config jsonb NULLABLE. Relacionamentos FK: experiment_id → public.experiments(id).

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
| 1 | `id` | `uuid` | não | `uuid_generate_v4()` |  | Coluna id da tabela public.experiment_variants. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: uuid_generate_v4(). |
| 2 | `experiment_id` | `uuid` | não |  |  | Coluna experiment_id da tabela public.experiment_variants. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.experiments(id). |
| 3 | `name` | `text` | não |  |  | Coluna name da tabela public.experiment_variants. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `weight` | `integer` | não | `50` |  | Coluna weight da tabela public.experiment_variants. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 50. |
| 5 | `config` | `jsonb` | sim |  |  | Coluna config da tabela public.experiment_variants. Tipo PostgreSQL: jsonb. Aceita NULL. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| experiment_variants_experiment_id_fkey | FOREIGN KEY | `FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| experiment_variants_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.experiment_assignments | experiment_assignments_variant_id_fkey | variant_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| experiment_variants_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX experiment_variants_pkey ON public.experiment_variants USING btree (id)` |
| idx_experiment_variants_experiment_id_fk | btree | experiment_id | não | sim |  | `CREATE INDEX idx_experiment_variants_experiment_id_fk ON public.experiment_variants USING btree (experiment_id)` |


## Policies (RLS)

### `Admins and managers can manage experiment_variants`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated users can read experiment_variants`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() IS NOT NULL)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
