# public.committee_coverage_history

> Tabela public.committee_coverage_history. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NOT NULL, coverage_score numeric NOT NULL DEFAULT 0, tier text NOT NULL DEFAULT 'weak'::text, stakeholder_count integer NOT NULL DEFAULT 0, gaps jsonb NOT NULL DEFAULT '[]'::jsonb, snapshot_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: sale_id → public.sales(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.committee_coverage_history. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.committee_coverage_history. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 3 | `coverage_score` | `numeric` | não | `0` |  | Coluna coverage_score da tabela public.committee_coverage_history. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 4 | `tier` | `text` | não | `'weak'::text` |  | Coluna tier da tabela public.committee_coverage_history. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'weak'::text. |
| 5 | `stakeholder_count` | `integer` | não | `0` |  | Coluna stakeholder_count da tabela public.committee_coverage_history. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 6 | `gaps` | `jsonb` | não | `'[]'::jsonb` |  | Coluna gaps da tabela public.committee_coverage_history. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 7 | `snapshot_at` | `timestamp with time zone` | não | `now()` |  | Coluna snapshot_at da tabela public.committee_coverage_history. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| committee_coverage_history_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| committee_coverage_history_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| committee_coverage_history_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX committee_coverage_history_pkey ON public.committee_coverage_history USING btree (id)` |
| idx_cch_sale_snapshot | btree | sale_id, snapshot_at | não | sim |  | `CREATE INDEX idx_cch_sale_snapshot ON public.committee_coverage_history USING btree (sale_id, snapshot_at DESC)` |


## Policies (RLS)

### `admin manager write coverage history`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `auth read coverage history`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
