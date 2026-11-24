# public.deal_probability_scores

> Tabela public.deal_probability_scores. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NOT NULL, raw_probability numeric NOT NULL DEFAULT 0, calibrated_probability numeric NOT NULL DEFAULT 0, confidence numeric NOT NULL DEFAULT 0, factors jsonb NOT NULL DEFAULT '{}'::jsonb, calculated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: sale_id → public.sales(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.deal_probability_scores. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.deal_probability_scores. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 3 | `raw_probability` | `numeric` | não | `0` |  | Coluna raw_probability da tabela public.deal_probability_scores. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 4 | `calibrated_probability` | `numeric` | não | `0` |  | Coluna calibrated_probability da tabela public.deal_probability_scores. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 5 | `confidence` | `numeric` | não | `0` |  | Coluna confidence da tabela public.deal_probability_scores. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. Validação CHECK: CHECK (confidence >= 0::numeric AND confidence <= 1::numeric). |
| 6 | `factors` | `jsonb` | não | `'{}'::jsonb` |  | Coluna factors da tabela public.deal_probability_scores. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 7 | `calculated_at` | `timestamp with time zone` | não | `now()` |  | Coluna calculated_at da tabela public.deal_probability_scores. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| deal_probability_scores_confidence_check | CHECK | `CHECK (confidence >= 0::numeric AND confidence <= 1::numeric)` |  |  | sim |
| deal_probability_scores_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| deal_probability_scores_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| deal_probability_scores_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX deal_probability_scores_pkey ON public.deal_probability_scores USING btree (id)` |
| idx_dps_calculated_at | btree | calculated_at | não | sim |  | `CREATE INDEX idx_dps_calculated_at ON public.deal_probability_scores USING btree (calculated_at DESC)` |
| idx_dps_sale_calculated | btree | sale_id, calculated_at | não | sim |  | `CREATE INDEX idx_dps_sale_calculated ON public.deal_probability_scores USING btree (sale_id, calculated_at DESC)` |


## Policies (RLS)

### `Admin/manager write deal scores`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated read deal scores`

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
