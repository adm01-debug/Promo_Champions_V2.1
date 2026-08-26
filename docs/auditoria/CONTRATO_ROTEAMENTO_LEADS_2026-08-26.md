# Contrato de Integridade — Roteamento de Leads e Carteira

Status: proposto localmente; a migration `20260830000002_harden_lead_routing.sql` **não foi aplicada em banco remoto**.

## Limites do domínio

Há dois modelos que não devem ser fundidos sem reconciliação explícita:

| Modelo    | Entidade roteada | Fonte de verdade operacional | Auditoria          |
| --------- | ---------------- | ---------------------------- | ------------------ |
| Carteira  | `clients`        | `client_portfolio`           | `lead_routing_log` |
| Lead/deal | `sales`          | `sales.salesperson_id`       | `lead_assignments` |

`lead_assignments` não substitui `client_portfolio`, e uma linha histórica de `client_portfolio` não deve ser apagada ou reinterpretada automaticamente.

## Invariantes implementados

1. Uma atribuição nova de carteira passa por `route_unassigned_client_portfolio`; a inserção da carteira e do log ocorrem na mesma transação.
2. Repetir a mesma solicitação para o mesmo cliente retorna a carteira existente; uma troca para outro vendedor exige fluxo de transferência explícito.
3. As estratégias `round_robin`, `least_loaded` e `top_performer` são escolhidas no banco, com locks transacionais. O navegador não mantém cursor de rodízio em `localStorage`.
4. `auto_assign_lead` bloqueia a venda, atualiza `sales.salesperson_id` somente se ainda estiver nulo e cria no máximo uma nova linha de `lead_assignments` pelo fluxo oficial.
5. A reatribuição de carteira inativa compara o vendedor e `updated_at` observados pelo job e revalida `last_purchase_date` contra o limiar; se a linha mudar ou registrar compra recente entre leitura e escrita, a operação falha sem gerar log parcial.
6. O job `auto-reassign-inactive` aceita somente `POST` autenticado com `service_role`, limita o paralelismo a 20 RPCs e não faz mais `UPDATE` e `INSERT` de log em chamadas separadas.

## Interface e autorização

| RPC                                                                                     | Chamadores ligados                  | Autorização                    | Garantia                                                 |
| --------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------ | -------------------------------------------------------- |
| `route_unassigned_client_portfolio(client, strategy, salesperson?, reason?)`            | `useLeadRouting`, `useAssignClient` | gestor/admin ou `service_role` | exclusão por cliente, idempotência e log atômico         |
| `auto_assign_lead(sale)`                                                                | `useAutoAssignLead`                 | gestor/admin ou `service_role` | lock da venda, escolha serializada e retorno idempotente |
| `reassign_inactive_client_portfolio(portfolio, expected*, target, threshold, strategy)` | `auto-reassign-inactive`            | somente `service_role`         | compare-and-swap da carteira e auditoria no mesmo commit |

A policy legada que permitia `INSERT` direto de qualquer vendedor em sua própria `client_portfolio` é removida pela migration. Os fluxos de **criação e roteamento** identificados no repositório passam pela RPC; a UI ainda possui atualização de status e remoção de carteira por RLS, que não foram reinterpretadas nesta onda. Triggers de banco e `service_role` continuam operando no servidor.

## Cenários simulados localmente

Em PostgreSQL 15 isolado, com esquema mínimo compatível, foram verificados:

- repetição de roteamento manual: uma única carteira e um único log;
- tentativa de trocar o destino manual sem transferência: rejeitada;
- repetição de `auto_assign_lead`: uma única linha em `lead_assignments`;
- reatribuição com fotografia antiga (`updated_at` anterior): rejeitada;
- reatribuição de carteira com compra dentro do limiar: rejeitada;
- chamadas simultâneas para a mesma carteira com destinos diferentes: só a primeira persiste;
- chamadas simultâneas para a mesma venda: ambas retornam o mesmo destino e há uma única atribuição;
- negação para usuário autenticado sem perfil operacional e ausência de execução para `anon` nas RPCs sensíveis.

## Pré-condições para aplicar em qualquer banco

Executar apenas consultas de leitura e revisar o resultado antes da aplicação:

```sql
-- Carteiras históricas que já possuem mais de um vendedor.
SELECT client_id, count(*) AS linhas, array_agg(salesperson_id ORDER BY assigned_at DESC) AS vendedores
FROM public.client_portfolio
GROUP BY client_id
HAVING count(*) > 1;

-- Deals já atribuídos com zero ou mais de um registro de auditoria.
SELECT s.id AS sale_id, s.salesperson_id, count(la.id) AS linhas_de_auditoria
FROM public.sales AS s
LEFT JOIN public.lead_assignments AS la ON la.sale_id = s.id
GROUP BY s.id, s.salesperson_id
HAVING count(la.id) <> 1 OR (s.salesperson_id IS NULL AND count(la.id) > 0);

-- Regras que ganharão precedência por prioridade sem filtro de valor/fonte.
SELECT id, name, priority, strategy, filter_min_value, filter_source,
       filter_state, filter_role
FROM public.lead_routing_rules
WHERE is_active IS TRUE
ORDER BY priority, created_at, id;

-- Confere se o nome da policy legada e os privilégios de RPC correspondem ao
-- histórico de migrations antes de remover qualquer via direta de escrita.
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('client_portfolio', 'lead_routing_log', 'lead_assignments')
ORDER BY tablename, policyname;

SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS argumentos,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_executa,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS autenticado_executa
FROM pg_proc AS p
JOIN pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'auto_assign_lead',
    'route_unassigned_client_portfolio',
    'reassign_inactive_client_portfolio'
  )
ORDER BY p.proname;
```

## Pendências que exigem decisão ou reconciliação

- A regra seed **Top Performer Premium** possui prioridade 1, mas não possui `filter_min_value`; pelo comportamento atual ela pode capturar todos os deals. A migration não altera dados/configuração de regra.
- `filter_state`, `filter_role` e filtros de cargo/produto expostos na interface de regras não têm mapeamento inequívoco para as colunas atuais de `sales`/`clients`. Não devem ser fingidos como implementados.
- O quick action `route-pending-leads` referencia a Edge Function `smart-lead-router`, ausente do repositório. É necessário definir o contrato de status, origem do lead e regras antes de criar esse processamento em lote.
- `useLeadAssignment` permanece apenas como consulta/prévia de vendedores; seu cursor global foi removido. As opções `weighted` e `territory` não possuem RPC de persistência e não devem ser conectadas a escrita de lead sem contrato de negócio e de banco.
- `lead_assignments` não tem unicidade em `sale_id` e sua policy histórica permite gestão direta por admin/manager. A RPC oficial é idempotente, mas uma escrita privilegiada crua ainda pode criar auditoria duplicada; adicionar índice único ou remover essa via exige primeiro reconciliar dados e confirmar o fluxo administrativo desejado.
- A policy de `lead_routing_log` ainda permite inserção administrativa direta. Ela não muda a posse de carteira, mas permite uma trilha de auditoria forjada; endurecê-la requer inventário prévio de integrações administrativas.
- Linhas históricas múltiplas em `client_portfolio` podem ser histórico legítimo ou dupla posse real. Esta entrega as preserva e bloqueia novas duplicações apenas nos fluxos oficiais.
- Por segurança, **qualquer** linha de `client_portfolio` para o cliente — inclusive `inactive` ou histórica — faz a RPC retornar a carteira existente e faz `useUnassignedClients` considerar o cliente atribuído. A entrega não pressupõe que `inactive` signifique disponibilidade para nova carteira; reabrir, transferir ou excluir essa linha depende de um contrato explícito de ciclo de vida e de reconciliação dos dados legados.
- A reatribuição automática preserva `status = 'inactive'`, como fazia o fluxo anterior. Sem uma decisão de negócio sobre reativar a carteira para o novo vendedor, a migration não muda esse estado; um job recorrente pode torná-la elegível de novo após o cooldown.
- O repositório não contém agendamento ativo que invoque `auto-reassign-inactive`; confirmar o job no banco/infra de destino antes de considerar a automação ativa.
