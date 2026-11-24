# public.territories

> Territórios comerciais e seus responsáveis e resultados acumulados.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do território. |
| 2 | `name` | `text` | não |  |  | Nome do território. |
| 3 | `current_owner_id` | `uuid` | sim |  |  | Vendedor atualmente responsável pelo território, quando atribuído. |
| 4 | `total_revenue` | `numeric` | sim | `0` |  | Receita total acumulada no território, em BRL. |
| 5 | `total_deals` | `integer` | sim | `0` |  | Quantidade total de negócios contabilizados no território. |
| 6 | `conquered_at` | `timestamp with time zone` | sim |  |  | Data e hora em que o território foi conquistado, quando registrada. |
| 7 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora da última atualização do território. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| territories_current_owner_id_fkey | FOREIGN KEY | `FOREIGN KEY (current_owner_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| territories_name_key | UNIQUE | `UNIQUE (name)` |  |  | sim |
| territories_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.sales | sales_territory_id_fkey | territory_id | SET NULL |
| public.territory_history | territory_history_territory_id_fkey | territory_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_territories_current_owner_id | btree | current_owner_id | não | sim |  | `CREATE INDEX idx_territories_current_owner_id ON public.territories USING btree (current_owner_id)` |
| territories_name_key | btree | name | sim | sim |  | `CREATE UNIQUE INDEX territories_name_key ON public.territories USING btree (name)` |
| territories_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX territories_pkey ON public.territories USING btree (id)` |


## Policies (RLS)

### `Anyone can view territories`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
