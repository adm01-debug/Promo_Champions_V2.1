# public.committee_extraction_runs

> Tabela public.committee_extraction_runs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), recording_id uuid NULLABLE, sale_id uuid NULLABLE, extracted_count integer NOT NULL DEFAULT 0, created_count integer NOT NULL DEFAULT 0, updated_count integer NOT NULL DEFAULT 0, confidence numeric NOT NULL DEFAULT 0, raw_output jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: recording_id → public.call_recordings(id); sale_id → public.sales(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.committee_extraction_runs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `recording_id` | `uuid` | sim |  |  | Coluna recording_id da tabela public.committee_extraction_runs. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.call_recordings(id). |
| 3 | `sale_id` | `uuid` | sim |  |  | Coluna sale_id da tabela public.committee_extraction_runs. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sales(id). |
| 4 | `extracted_count` | `integer` | não | `0` |  | Coluna extracted_count da tabela public.committee_extraction_runs. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 5 | `created_count` | `integer` | não | `0` |  | Coluna created_count da tabela public.committee_extraction_runs. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 6 | `updated_count` | `integer` | não | `0` |  | Coluna updated_count da tabela public.committee_extraction_runs. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 7 | `confidence` | `numeric` | não | `0` |  | Coluna confidence da tabela public.committee_extraction_runs. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 8 | `raw_output` | `jsonb` | não | `'{}'::jsonb` |  | Coluna raw_output da tabela public.committee_extraction_runs. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.committee_extraction_runs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| committee_extraction_runs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| committee_extraction_runs_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| committee_extraction_runs_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| committee_extraction_runs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX committee_extraction_runs_pkey ON public.committee_extraction_runs USING btree (id)` |
| idx_cer_recording | btree | recording_id | não | sim |  | `CREATE INDEX idx_cer_recording ON public.committee_extraction_runs USING btree (recording_id)` |
| idx_cer_sale | btree | sale_id, created_at | não | sim |  | `CREATE INDEX idx_cer_sale ON public.committee_extraction_runs USING btree (sale_id, created_at DESC)` |


## Policies (RLS)

### `admin manager write extraction runs`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
