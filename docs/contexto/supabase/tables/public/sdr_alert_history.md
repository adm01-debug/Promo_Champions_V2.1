# public.sdr_alert_history

> Histórico de alertas enviados sobre desempenho ou atividade de SDRs.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do alerta. |
| 2 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação do alerta. |
| 3 | `triggered_by` | `text` | sim | `'cron'::text` |  | Processo ou usuário que acionou o alerta. |
| 4 | `sdrs_notified` | `integer` | não | `0` |  | Quantidade de SDRs notificados. |
| 5 | `threshold_used` | `integer` | não | `3` |  | Limiar usado para acionar o alerta. |
| 6 | `sdr_details` | `jsonb` | não | `'[]'::jsonb` |  | Detalhes dos SDRs associados ao alerta, em formato JSON. |
| 7 | `admin_emails` | `text[]` | não | `'{}'::text[]` |  | Lista de endereços de e-mail de administradores notificados. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sdr_alert_history_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sdr_alert_history_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_sdr_alert_history_created_at ON public.sdr_alert_history USING btree (created_at DESC)` |
| sdr_alert_history_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sdr_alert_history_pkey ON public.sdr_alert_history USING btree (id)` |


## Policies (RLS)

### `Only admins can view SDR alert history`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
