# Varredura por acao destrutiva sem confirmacao (etapa 177)

**Etapa:** 177 · **Onda 7** · **Camada:** Frontend · **Data:** 2026-11-24 · **Commit base:** `be7b39be2`

## Por que este documento existe

As etapas 175 e 176 fecharam os dois primeiros casos por leitura dirigida: a exclusao de chave de
funcionalidade (PR #676) e os dois botoes da auditoria de premiacoes (PR #676). A varredura das demais
acoes destrutivas nunca tinha sido feita. O objetivo aqui e **levantar**, nao corrigir: o plano proibe
troca em massa de dialogo, porque descartar um filtro pessoal nao tem o mesmo peso de apagar uma conversa
de cliente ou revogar um link publico.

## Metodo (reproduzivel)

1. Todas as chamadas de mutacao do front:

   ```bash
   grep -rn '\.mutate(\|mutateAsync(' src/ --include=*.tsx --include=*.ts | grep -v '\.test\.'
   ```

   66 linhas. As 20 que sao `cancel`/`reset`/`upsert` ficam fora - o dado continua la.

2. Filtro do irreversivel (`delete|remove|revoke|purge` na mesma linha) e leitura a mao de cada hit:

   ```bash
   grep -rn '\.mutate(\|mutateAsync(' src/ --include=*.tsx --include=*.ts | grep -v '\.test\.' \
     | grep -iE 'delete|remove|revoke|purge'
   ```

   **46 chamadas em 40 arquivos**.

3. Classificacao do mecanismo de confirmacao por arquivo (`DeleteConfirmDialog`, `AlertDialog`,
   `confirm()` nativo, nenhum) e leitura do trecho para descartar delegacao ao componente filho.

### O que o metodo NAO conta como falha

- `cancel`/`reset`/`upsert`: reversivel, nao apaga.
- Exclusao delegada a um filho que confirma:
  `src/components/competitive/VictoryFeed.tsx:108` -> `FeedCommentOwnerActions.tsx:110` (`DeleteConfirmDialog`);
  `src/pages/VictoryFeedPage.tsx:262` usa o mesmo componente;
  `src/pages/AdminAuditoriaPremiacoes.tsx:599` -> `src/components/admin/AwardActions.tsx:145-160`
  (`AlertDialog` nomeando vendedor e premio);
  `src/components/security/IPWhitelistManager.tsx:236` -> `src/components/security/IPWhitelistTable.tsx:80-118`
  (`AlertDialog` com o IP no corpo, achado ao ler o filho depois da classificacao automatica).
- Preferencia de notificacao (`NotificationCenter.tsx:432`, `Notificacoes.tsx:332`): o interruptor volta
  em dois cliques, nao e perda de dado.

## Resultado

| Mecanismo | Chamadas | Veredito |
| --- | --- | --- |
| `DeleteConfirmDialog` de `src/components/shared/DeleteConfirmDialog.tsx` | 5 | ok |
| `AlertDialog` nomeando o registro | 10 | ok |
| `confirm()` nativo do navegador | 6 | funciona, mas nao e acessivel e, num caso, nao nomeia o registro |
| Nenhum no arquivo que chama o `mutate` | 25 | 18 casos reais (5 P1, 13 P2), 4 delegam para filho que confirma, 3 sao reversiveis |

## P1 - irreversivel, impacto alto, sem confirmacao (5 chamadas em 4 arquivos)

| Arquivo:linha | Acao | Por que P1 |
| --- | --- | --- |
| `src/components/settings/FeatureFlagsAdmin.tsx:123` | exclui a flag de funcionalidade | desliga funcionalidade para todos os usuarios do tenant, e o componente esta em producao (`src/pages/Configuracoes.tsx:20`); a pagina `src/pages/FeatureFlagsAdmin.tsx:324` ja tem `AlertDialog`, esta nao |
| `src/components/reporting/EmbedTokenManagerDialog.tsx:153` | revoga token de relatorio compartilhado | quebra um link ja entregue a terceiro, sem volta; o token nao pode ser reemitido igual |
| `src/components/reporting/EmbedTokenManagerDialog.tsx:162` | exclui o token | mesmo efeito do anterior, apagando o historico da revogacao |
| `src/pages/AdminSupressaoEmails.tsx:117` | remove e-mail da lista de supressao | quem pediu descadastro volta a receber disparo - exposicao de LGPD |
| `src/components/assistant/DealChatHistory.tsx:125` | apaga conversa de cliente | dado do cliente, sem copia; alimenta o assistente e o historico de contexto |

## P2 - irreversivel, impacto medio, sem confirmacao (13 chamadas em 12 arquivos)

| Arquivo:linha | Acao |
| --- | --- |
| `src/components/admin/task-console/SquadManager.tsx:155` | exclui squad e desvincula os membros |
| `src/components/admin/task-console/SquadManager.tsx:200` | remove membro do squad |
| `src/components/admin/task-console/TaskCatalogManager.tsx:237` | exclui item do catalogo de tarefas |
| `src/components/analytics/ObjectionsLibrary.tsx:484` | exclui objecao da biblioteca |
| `src/components/cadences/EditCadenceDialog.tsx:295` | exclui passo da cadencia |
| `src/components/cadences/EnrollmentRulesDialog.tsx:303` | exclui regra de inscricao |
| `src/components/deal-intelligence/BuyingCommitteeCard.tsx:72` | remove membro do comite de compras |
| `src/components/multichannel/TemplateManager.tsx:219` | exclui template de mensagem |
| `src/components/playbooks/PlaybookCard.tsx:146` -> `PlaybookItemRow.tsx:129` | exclui item do playbook no clique do icone |
| `src/components/sequences/SequenceBuilder.tsx:83` | exclui passo da sequencia |
| `src/components/settings/FollowUpTerritoryRules.tsx:235` | exclui regra de territorio |
| `src/pages/Agenda.tsx:316` | exclui evento da agenda |
| `src/pages/Cadencias.tsx:331` | exclui cadencia inteira |

## P3 - reversivel, sem confirmacao (deixar como esta)

| Arquivo:linha | Acao | Por que P3 |
| --- | --- | --- |
| `src/components/filters/SavedFiltersBar.tsx:62` | exclui filtro salvo | preferencia pessoal, recriavel |
| `src/components/notifications/NotificationCenter.tsx:432` | descarta notificacao | so remove da lista |
| `src/pages/Notificacoes.tsx:332` | remove preferencia de notificacao | o interruptor volta |

## `confirm()` nativo a trocar por `DeleteConfirmDialog` (6)

Funcionam, mas o `confirm()` do navegador nao e alcancavel por leitor de tela com rotulo proprio e
congela a aba. Em `CommissionRules.tsx:66` ele nem nomeia a regra que vai apagar.

| Arquivo:linha | Nomeia o registro? |
| --- | --- |
| `src/pages/CommissionRules.tsx:66` | **nao** |
| `src/pages/WebhooksPage.tsx:378` | nao (o `confirm` esta na linha 377) |
| `src/components/admin/connections/ConnectionsOverviewTable.tsx:167` | sim |
| `src/components/admin/connections/WebhooksTab.tsx:84` | sim |
| `src/pages/ScheduledReports.tsx:139` | sim |
| `src/pages/CustomReports.tsx:163` | sim |

## Ja protegido (21 chamadas)

**Com `DeleteConfirmDialog` (5):** `ActivityItemRow.tsx:88`, `PortfolioTable.tsx:131`, `Clientes.tsx:115`,
`Produtos.tsx:122`, `Times.tsx:26`.

**Com `AlertDialog` nomeando o registro (10):** `CadenceTemplateManager.tsx:133`, `GeoBlockingManager.tsx:410`,
`AccountBasedSelling.tsx:205` e `:268`, `ApprovalWorkflowsPage.tsx:243`, `AssinaturaDigital.tsx:160` e `:517`,
`AutomationBuilder.tsx:179`, `pages/FeatureFlagsAdmin.tsx:324`, `PowerDialer.tsx:61`.

## Etapas propostas (nao abertas ainda)

| Proposta | Escopo | Prioridade |
| --- | --- | --- |
| 256 | bloquear as 5 chamadas P1 com `DeleteConfirmDialog`, com o nome do registro e o efeito no corpo | Alta |
| 257 | bloquear as 13 chamadas P2, mesma padronizacao | Media |
| 258 | trocar os 6 `confirm()` nativo por `DeleteConfirmDialog` | Media |

### Proposta 258 - concluida (PR de codigo)

Os 6 `confirm()` nativos foram substituidos por `DeleteConfirmDialog` com o nome do registro no titulo/descricao:

| Arquivo | Antes | Depois |
| --- | --- | --- |
| `src/pages/CommissionRules.tsx` | `confirm('Tem certeza que deseja excluir esta regra?')` | `DeleteConfirmDialog` com `ruleToDelete` |
| `src/pages/WebhooksPage.tsx` | `window.confirm('Remover webhook?')` | `DeleteConfirmDialog` com `webhookToDelete` |
| `src/pages/ScheduledReports.tsx` | `confirm(\`Remover agendamento "${r.name}"?\`)` | `DeleteConfirmDialog` com `scheduleToDelete` |
| `src/pages/CustomReports.tsx` | `confirm(\`Remover "${r.name}"?\`)` | `DeleteConfirmDialog` com `reportToDelete` |
| `src/components/admin/connections/WebhooksTab.tsx` | `confirm(\`Remover "${w.name}"?\`)` | `DeleteConfirmDialog` com `webhookToDelete` |
| `src/components/admin/connections/ConnectionsOverviewTable.tsx` | `confirm(\`Remover "${c.label}"?\`)` | `DeleteConfirmDialog` com `connToDelete` |

Ganho: a confirmacao passou a ser um dialogo acessivel (foco, `Escape`, `role=alertdialog`) em vez do `confirm()`
do navegador, e cada texto diz o que sai do ar - nao apenas "tem certeza?".

Testes: `WebhooksTab.test.tsx` (3 casos) e `ConnectionsOverviewTable.test.tsx` (2 casos) cobrem
"nao remove antes de confirmar", "remove ao confirmar" e "cancelar mantem".

As P3 ficam como estao, por decisao do plano: nao se pede confirmacao para o que se desfaz em dois cliques.

## Como validar depois de corrigir

1. `grep -rn 'confirm(' src/ --include=*.tsx` deve devolver vazio fora de testes.
2. Cada um dos 18 casos corrigidos deve ter o dialogo no mesmo arquivo que chama o `mutate`, ou no filho imediato que recebe o `onX`.
3. `npm run lint`, `npm run typecheck` e `vitest run` verdes antes de abrir a PR.
