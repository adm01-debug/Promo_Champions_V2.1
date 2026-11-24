# public.win_loss_patterns

> Tabela public.win_loss_patterns. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), pattern_type text NOT NULL, label text NOT NULL, outcome text NULLABLE, frequency integer NOT NULL DEFAULT 0, win_rate numeric NOT NULL DEFAULT 0, avg_cycle_days numeric NOT NULL DEFAULT 0, avg_amount numeric NOT NULL DEFAULT 0, confidence numeric NOT NULL DEFAULT 0, computed_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.win_loss_patterns. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `pattern_type` | `text` | não |  |  | Coluna pattern_type da tabela public.win_loss_patterns. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (pattern_type = ANY (ARRAY['win_factor'::text, 'loss_factor'::text, 'stuck_stage'::text, 'competitor'::text, 'icp_match'::text])). |
| 3 | `label` | `text` | não |  |  | Coluna label da tabela public.win_loss_patterns. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `outcome` | `text` | sim |  |  | Coluna outcome da tabela public.win_loss_patterns. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `frequency` | `integer` | não | `0` |  | Coluna frequency da tabela public.win_loss_patterns. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 6 | `win_rate` | `numeric` | não | `0` |  | Coluna win_rate da tabela public.win_loss_patterns. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `avg_cycle_days` | `numeric` | não | `0` |  | Coluna avg_cycle_days da tabela public.win_loss_patterns. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 8 | `avg_amount` | `numeric` | não | `0` |  | Coluna avg_amount da tabela public.win_loss_patterns. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 9 | `confidence` | `numeric` | não | `0` |  | Coluna confidence da tabela public.win_loss_patterns. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 10 | `computed_at` | `timestamp with time zone` | não | `now()` |  | Coluna computed_at da tabela public.win_loss_patterns. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| win_loss_patterns_pattern_type_check | CHECK | `CHECK (pattern_type = ANY (ARRAY['win_factor'::text, 'loss_factor'::text, 'stuck_stage'::text, 'competitor'::text, 'icp_match'::text]))` |  |  | sim |
| win_loss_patterns_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_wlp_freq | btree | frequency | não | sim |  | `CREATE INDEX idx_wlp_freq ON public.win_loss_patterns USING btree (frequency DESC)` |
| idx_wlp_pattern_type | btree | pattern_type, frequency | não | sim |  | `CREATE INDEX idx_wlp_pattern_type ON public.win_loss_patterns USING btree (pattern_type, frequency DESC)` |
| idx_wlp_type | btree | pattern_type | não | sim |  | `CREATE INDEX idx_wlp_type ON public.win_loss_patterns USING btree (pattern_type)` |
| uq_wlp_type_label | btree | pattern_type, label | sim | sim |  | `CREATE UNIQUE INDEX uq_wlp_type_label ON public.win_loss_patterns USING btree (pattern_type, label)` |
| win_loss_patterns_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX win_loss_patterns_pkey ON public.win_loss_patterns USING btree (id)` |


## Policies (RLS)

### `wlp read auth`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `wlp write admin/manager`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_notify_critical_winloss | AFTER | INSERT | ROW | enabled | private.notify_critical_winloss_pattern |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
