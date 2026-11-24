# 05 — Progresso

Checklist do plano de `04-PLANO.md`. **O executor marca aqui, etapa por etapa.**

Legenda:
- `[ ]` não começada
- `[x]` concluída — verificação executada e evidência anotada
- `[~]` divergente — o código já não corresponde à evidência da etapa; registre o que encontrou
- `[A]` aguardando o dono — PR aberta, precisa de aprovação humana antes do merge
- `[-]` não aplicável — outra etapa tornou esta desnecessária; diga qual

`APROV` marca as etapas que **terminam com a PR aberta** aguardando o dono
(`Precisa de aprovação humana antes do merge: sim`). São 121 das 255.

Ao concluir, acrescente na própria linha: o número da PR e a evidência em uma frase.
Exemplo:
`- [x] 041 — Corrigir o custo de comissão do painel de ROI — onda 2 — Crítica — PR #640 — /roi com taxa 10% mostra custo = 10% da receita (antes 10x)`

---

## Onda 1 — Segurança e risco de perda de dado
- [ ] 001 — Fechar o cadastro público do Supabase Auth — onda 1 — Crítica · **APROV**
- [ ] 002 — Medir se a cadeia de ataque do `update_stage` está explorável hoje — onda 1 — Crítica
- [x] 003 — Escopar o `update_stage` do `execute-workflow` ao dono da venda — onda 1 — Crítica - PR #637 - update_stage escopado ao dono da venda via RLS
- [ ] 004 — Exigir aprovador humano no environment `Production` — onda 1 — Crítica · **APROV**
- [x] 005 — Autenticar `new-device-alert` — onda 1 — Crítica - PR #638 - new-device-alert exige JWT valido
- [x] 006 — Fazer `workflow-executor` respeitar o resultado da autenticação — onda 1 — Alta - PR #639 - workflow-executor recusa 401 sem auth
- [x] 007 — Autenticar `notify-critical-pattern` e escapar o HTML do e-mail — onda 1 — Alta - PR #640 - notify-critical-pattern autenticado e HTML escapado
- [ ] 008 — Validar a condição da premiação no servidor — onda 1 — Crítica · **APROV**
- [x] 009 — Trocar o fallback permissivo de `evaluateBonus` por recusa explícita — onda 1 — Crítica - PR #641 - evaluateBonus devolve achieved=false em condicao desconhecida
- [ ] 010 — Desbloquear a criação de migrations (versões datadas no futuro) — onda 1 — Média · **APROV**
- [ ] 011 — Ligar o ranking mensal à avaliação de premiação — onda 1 — Alta · **APROV**
- [x] 012 — Escopar `analyze-call` ao dono da gravação — onda 1 — Alta - PR #643 - analyze-call escopado ao dono da gravacao
- [x] 013 — Escopar `sequence-record-reply` ao dono da cadência — onda 1 — Alta - PR #644 - escopado ao dono da cadencia (callerCtx corrigido no #670)
- [x] 014 — Escopar `schedule-optimal-send` à venda do chamador — onda 1 — Média - PR #645 - schedule-optimal-send escopado a venda do chamador
- [x] 015 — Escopar `csat-ces-trigger` à conta do chamador — onda 1 — Média - PR #646 - csat-ces-trigger salva ctx e verifica ownership da account
- [x] 016 — Restringir `rotate-daily-challenges` ao cron e ao administrador — onda 1 — Média - PR #647 - rotacao manual de desafios diarios exige admin
- [x] 017 — Restringir o recálculo em massa de `lead-scoring` — onda 1 — Média - PR #648 - recalculo em massa do lead-scoring exige admin
- [ ] 018 — Remover a policy permissiva de `nps_surveys` e de `commercial_approval_requests` — onda 1 — Crítica · **APROV**
- [ ] 019 — Fechar a leitura irrestrita de `entity_versions` — onda 1 — Crítica · **APROV**
- [ ] 020 — Fechar previsão e saúde de negócio para o time todo — onda 1 — Alta · **APROV**
- [ ] 021 — Fechar atingimento de meta individual — onda 1 — Alta · **APROV**
- [ ] 022 — Fechar avaliação de desempenho individual (coaching) — onda 1 — Alta · **APROV**
- [ ] 023 — Varrer as 110 policies permissivas restantes e decidir caso a caso — onda 1 — Alta
- [ ] 024 — Amarrar a inserção em `intent_audit_logs` ao autor — onda 1 — Média · **APROV**
- [ ] 025 — Revogar o DML do papel anônimo nas tabelas de venda, cliente e dinheiro — onda 1 — Alta · **APROV**
- [ ] 026 — Revogar o DML anônimo nas tabelas de orçamento, pedido e itens — onda 1 — Alta · **APROV**
- [ ] 027 — Revogar o DML anônimo em segredos e configuração sensível — onda 1 — Alta · **APROV**
- [ ] 028 — Reduzir o grant anônimo nas tabelas restantes, por lote — onda 1 — Média · **APROV**
- [ ] 029 — Criar o teste que impede o grant anônimo de voltar — onda 1 — Média · **APROV**
- [ ] 030 — Fazer o relatório público recusar origem fora da lista — onda 1 — Alta · **APROV**
- [ ] 031 — Tornar o limite do relatório público realmente efetivo — onda 1 — Média · **APROV**
- [ ] 032 — Parar de mandar o token do relatório na URL — onda 1 — Média · **APROV**
- [ ] 033 — Tirar a chave de serviço do ambiente do job que roda código da PR — onda 1 — Alta · **APROV**
- [ ] 034 — Decidir o destino da camada de e-mail: configurar ou desligar — onda 1 — Alta · **APROV**
- [ ] 035 — Dar à política de segurança do site uma diretiva de script — onda 1 — Média · **APROV**
- [ ] 036 — Ampliar o detector de segredos e tratar as credenciais já versionadas — onda 1 — Média
- [ ] 037 — Atualizar a rede de segurança do schema e garantir que ela não envelheça — onda 1 — Alta · **APROV**
- [ ] 038 — Fazer o portão de CI exigir sucesso, não ausência de falha — onda 1 — Média · **APROV**
- [ ] 039 — Incluir o gate de migrations e os testes de SQL no portão obrigatório — onda 1 — Alta · **APROV**
- [ ] 040 — Tornar os testes de ponta a ponta alcançáveis — onda 1 — Alta · **APROV**

## Onda 2 — Fluxos principais quebrados
- [x] 041 — Corrigir o custo de comissão do painel de ROI — onda 2 — Crítica - PR #642 - /roi com taxa 10% mostra custo = 10% da receita (antes 10x)
- [ ] 042 — Unificar "a comissão desta venda" numa única fonte — onda 2 — Crítica · **APROV**
- [ ] 043 — Separar "Arquivado" de "Ganho" — onda 2 — Crítica · **APROV**
- [ ] 044 — Mapear "cotação expirada" para um status que não seja ganho — onda 2 — Crítica · **APROV**
- [ ] 045 — Fazer os outros três pipelines moverem card — onda 2 — Alta · **APROV**
- [ ] 046 — Aplicar as regras de aprovação que a tela promete — onda 2 — Alta · **APROV**
- [ ] 047 — Só marcar "aprovado" depois de a mudança ser aplicada — onda 2 — Alta · **APROV**
- [ ] 048 — Decidir e resolver a entrada de cotações do parceiro — onda 2 — Alta · **APROV**
- [x] 049 — Fazer o botão "Reprocessar" reprocessar — onda 2 — Alta — PR #649 - useV4Callbacks: Reprocessar desabilitado com attempts>=5 e "Resetar tentativas" zera attempts/next_retry_at
- [ ] 050 — Dar policy de escrita a `cadence_alert_templates` — onda 2 — Alta · **APROV**
- [ ] 051 — Dar policy de escrita a `cadence_outcome_rules` — onda 2 — Alta · **APROV**
- [ ] 052 — Resolver a gravação de `integration_logs` — onda 2 — Média
- [ ] 053 — Resolver a gravação de `lead_score_trends` — onda 2 — Média
- [ ] 054 — Permitir marcar follow-up como enviado (e parar de engolir o erro) — onda 2 — Alta · **APROV**
- [ ] 055 — Permitir excluir a conversa do assistente — onda 2 — Média · **APROV**
- [ ] 056 — Tornar transacional a mudança de status de orçamento — onda 2 — Alta · **APROV**
- [x] 057 — Consertar a atualização otimista do pipeline — onda 2 — Alta — PR #650 - usePipeline: getQueriesData/setQueriesData por prefixo e restauracao por estagio no onError
- [x] 058 — Consertar a atualização otimista de clientes — onda 2 — Alta — PR #691 - useClients: chave sem filtro morto (A-100) e invalidacao por prefixo confirmadas na main
- [ ] 059 — Consertar a atualização otimista de produtos — onda 2 — Média
- [x] 060 — Fazer a previsão de receita falhar visivelmente em vez de mentir — onda 2 — Alta - PR #651 - forecast falha visivelmente quando as metas falham
- [x] 061 — Tratar o erro das consultas paralelas de premiação — onda 2 — Alta — PR #691 - card exibe erro com "Tentar de novo" e sela "dado parcial" quando sequencia/total falham; teste prova 2 falhas sem o fix
- [ ] 062 — Tratar o erro das consultas paralelas de metas, perfil e relatório de vendas — onda 2 — Média

## Onda 3 — Integridade de dados e regras de negócio
- [ ] 063 — Unificar a data de fechamento de venda em uma definição — onda 3 — Alta · **APROV**
- [ ] 064 — Unificar o fuso horário de corte de período — onda 3 — Alta · **APROV**
- [ ] 065 — Fazer meta ausente ser tratada do mesmo jeito em todas as telas — onda 3 — Média · **APROV**
- [ ] 066 — Impedir que comissão paga volte a pendente — onda 3 — Alta · **APROV**
- [ ] 067 — Tornar o trigger de comissão tolerante a refechamento — onda 3 — Alta · **APROV**
- [ ] 068 — Revisar a comissão quando a venda muda, é cancelada ou excluída — onda 3 — Alta · **APROV**
- [ ] 069 — Fazer receita e meta respeitarem a exclusão lógica — onda 3 — Alta · **APROV**
- [ ] 070 — Fazer premiação respeitar a exclusão lógica — onda 3 — Alta · **APROV**
- [ ] 071 — Fazer a ativação de cliente ignorar venda excluída — onda 3 — Alta · **APROV**
- [ ] 072 — Revogar as funções de gamificação que o vendedor pode chamar sobre si — onda 3 — Alta · **APROV**
- [ ] 073 — Ponderar o markup médio pela receita — onda 3 — Média · **APROV**
- [ ] 074 — Separar valor e percentual no total de premiações — onda 3 — Média · **APROV**
- [x] 075 — Excluir comissões canceladas do total do vendedor — onda 3 — Baixa - PR #652 - total de comissoes nao inclui canceladas
- [x] 076 — Tirar os números inventados do simulador de ganhos — onda 3 — Média - PR #652 - dados inventados removidos do painel de comissoes
- [ ] 077 — Dar um CHECK ao status de cotação — onda 3 — Média · **APROV**
- [ ] 078 — Validar as restrições de valor que entraram sem verificar o histórico — onda 3 — Média · **APROV**
- [ ] 079 — Dar restrições de valor a `commissions` e `quote_items` — onda 3 — Média · **APROV**
- [ ] 080 — Padronizar a escala das colunas de dinheiro da cadeia de orçamento — onda 3 — Alta · **APROV**
- [ ] 081 — Alinhar a escala de dinheiro de vendas, pedidos e comissões — onda 3 — Média · **APROV**
- [ ] 082 — Padronizar `products.price` e `clients.total_value` — onda 3 — Média · **APROV**
- [ ] 083 — Trocar o limiar de alerta de ponto flutuante para decimal — onda 3 — Baixa · **APROV**
- [ ] 084 — Dar chave estrangeira à trilha de conversão de orçamento — onda 3 — Baixa · **APROV**
- [ ] 085 — Remover os índices exatamente duplicados — onda 3 — Média · **APROV**
- [ ] 086 — Remover os gatilhos duplicados de `updated_at` — onda 3 — Média · **APROV**
- [x] 087 — Medir se a deduplicação de webhook está realmente gravando — onda 3 — Média - PR #659 - deduplicacao de webhook no receive-quote-webhook
- [x] 088 — Religar a deduplicação no caminho de entrada de cotações — onda 3 — Alta - PR #659 - webhook repetido nao processa duas vezes
- [ ] 089 — Fazer o cron perceber falha da função que ele chama — onda 3 — Alta · **APROV**
- [ ] 090 — Calibrar a espera do despachante de cron para não travar os trabalhadores — onda 3 — Média · **APROV**
- [x] 091 — Alertar quando a sincronização do Bitrix24 falhar — onda 3 — Média - PR #660 - alerta apos 3 falhas consecutivas do Bitrix24
- [x] 092 — Assinar o webhook de Win/Loss com HMAC do corpo — onda 3 — Crítica — PR #655/#677 - retry.ts:1-14 assina `${ts}.${body}` e envia `t=<ts>,v1=<hex>` em X-Winloss-Signature (L155); #677 corrigiu a regressao que derrubava a main
- [ ] 093 — Parar de trazer o segredo do webhook para o navegador e passar a gravá-lo — onda 3 — Alta · **APROV**
- [ ] 094 — Tirar as credenciais de canal do navegador antes do primeiro provedor ser conectado — onda 3 — Alta · **APROV**
- [ ] 095 — Dar uma tela à lista de destinos permitidos de webhook — onda 3 — Média
- [x] 096 — Proteger o teste de conexão de integração contra destino interno — onda 3 — Média - PR #656 - test-integration-connection bloqueia URLs internas
- [x] 097 — Respeitar o limite de requisições dos terceiros fora do caminho de IA — onda 3 — Média - PR #657 - Retry-After respeitado em 429 no Bitrix24 e V4
- [x] 098 — Validar o formato da resposta do sistema de atendimento — onda 3 — Média — PR #658 - requireArray em Zendesk/Intercom/Freshdesk com erro explicito e log de corte
- [ ] 099 — Unificar a retenção da deduplicação de webhook — onda 3 — Baixa · **APROV**
- [ ] 100 — Fazer a comissão recusar venda sem regra, em vez de pagar 5% — onda 3 — Alta · **APROV**

## Onda 4 — Funcionalidades incompletas
- [ ] 101 — Decidir o destino dos botões de exportação de Win/Loss — onda 4 — Média
- [ ] 102 — Decidir o destino dos botões de filtro e exportação da auditoria comercial — onda 4 — Média
- [ ] 103 — Decidir o destino do botão de exportação de auditoria de preço — onda 4 — Média
- [ ] 104 — Decidir o destino dos cinco botões da inteligência de compras — onda 4 — Média · **APROV**
- [ ] 105 — Decidir o destino dos botões do guia de estado vazio — onda 4 — Baixa
- [ ] 106 — Fazer o campo de busca da auditoria de duplicados buscar — onda 4 — Média
- [ ] 107 — Fazer o diálogo "Configurar IA" salvar ou sair da tela — onda 4 — Média · **APROV**
- [x] 108 — Tirar os números fabricados do painel de Segurança — onda 4 — Média - PR #662 - painel de Seguranca sem dados falsos
- [x] 109 — Esconder os botões de teste de gamificação em produção — onda 4 — Média - PR #662 - botoes de teste ocultos no painel de Seguranca
- [ ] 110 — Dar entrada no menu às duas telas de alerta de webhook — onda 4 — Média
- [ ] 111 — Dar entrada no menu às telas de conformidade (LGPD e opt-out) — onda 4 — Alta
- [ ] 112 — Remover a página de teste de retentativa de produção — onda 4 — Média
- [ ] 113 — Varrer as 24 rotas órfãs e decidir cada uma — onda 4 — Média
- [ ] 114 — Fazer a página pública da corrida dizer o que está acontecendo — onda 4 — Média · **APROV**
- [ ] 115 — Restringir o painel de vendedor por papel e validar o identificador — onda 4 — Média · **APROV**
- [ ] 116 — Ligar a recompensa de cadência ao provedor que falta — onda 4 — Média · **APROV**
- [ ] 117 — Marcar quando a probabilidade de fechamento é estimativa local — onda 4 — Média
- [ ] 118 — Fazer o contador de visualizações do relatório público ser atômico — onda 4 — Baixa · **APROV**
- [ ] 119 — Tirar o salário e o LTV fixos do painel de ROI — onda 4 — Média · **APROV**
- [ ] 120 — Decidir o destino de `salesperson_commission_configs` — onda 4 — Média · **APROV**

## Onda 5 — Robustez: erros, estados, concorrência
- [x] 121 — Criar o tratamento padrão de erro de leitura — onda 5 — Alta — PR #663 - QueryErrorState com refetch nas 6 paginas; estado de erro em vez de "sem dados"
- [x] 122 — Mostrar erro em vez de "nenhuma comissão" — onda 5 — Alta — PR #663 - QueryErrorState com refetch nas 6 paginas; estado de erro em vez de "sem dados"
- [x] 123 — Mostrar erro em vez de "nenhum registro" na trilha de auditoria — onda 5 — Alta — PR #663 - QueryErrorState com refetch nas 6 paginas; estado de erro em vez de "sem dados"
- [x] 124 — Mostrar erro em vez de "nenhuma premiação para auditar" — onda 5 — Alta — PR #663 - QueryErrorState com refetch nas 6 paginas; estado de erro em vez de "sem dados"
- [x] 125 — Mostrar erro nas telas de deduplicação e de chaves de funcionalidade — onda 5 — Média — PR #663 - QueryErrorState com refetch nas 6 paginas; estado de erro em vez de "sem dados"
- [x] 126 — Mostrar erro na tela de supressão de e-mails — onda 5 — Média — PR #663 - QueryErrorState com refetch nas 6 paginas; estado de erro em vez de "sem dados"
- [ ] 127 — Varrer o repositório por erro de leitura engolido — onda 5 — Média
- [x] 128 — Impedir que uma seção inválida de painel trave a página inicial — onda 5 — Alta — PR #664 - VALID_DASHBOARD_SECTIONS em lib/dashboardSections valida antes de gravar e limpa valor invalido na leitura
- [ ] 129 — Tornar a importação de clientes capaz de ler CSV de verdade — onda 5 — Alta · **APROV**
- [x] 130 — Pedir confirmação explícita do volume antes de importar — onda 5 — Média — PR #669 - ImportExport pede confirmacao do volume antes de gravar
- [x] 131 — Fazer o aviso de XP refletir o que foi creditado — onda 5 — Média - PR #666 - aviso de XP usa valor do servidor
- [x] 132 — Invalidar o contador de tarefas de follow-up após mutação — onda 5 — Média — PR #665 - todays-cadence-tasks invalidado nas mutacoes e chave com userId
- [x] 133 — Unificar os dois ganchos que marcam etapa de playbook — onda 5 — Média - PR #666 - assinaturas realtime de XP
- [ ] 134 — Unificar as duas versões do funil de prospecção — onda 5 — Baixa · **APROV**
- [ ] 135 — Persistir a preferência de tema do painel — onda 5 — Baixa
- [ ] 136 — Remover o filtro declarado e ignorado em `useClients` — onda 5 — Baixa
- [x] 137 — Filtrar as assinaturas em tempo real dos painéis — onda 5 — Baixa - PR #666 - aviso de XP nao conta duas vezes
- [ ] 138 — Liberar os canais de tempo real da corrida — onda 5 — Média
- [ ] 139 — Acrescentar o usuário às chaves de cache por pessoa — onda 5 — Baixa
- [ ] 140 — Dar justificativa real às supressões da regra de dependências — onda 5 — Média
- [x] 141 — Corrigir o reenvio da preferência antiga em `useSyncedSetting` — onda 5 — Alta - PR #667 - reconcile do useSyncedSetting le valor corrente e trata empate
- [x] 142 — Avisar quando a conversa do assistente não for gravada — onda 5 — Média - PR #668 - aviso na conversa quando a mensagem do assistente nao for salva
- [ ] 143 — Dar asserções aos testes de fluxo principal — onda 5 — Alta
- [ ] 144 — Tirar o mock que substitui a regra sob teste — onda 5 — Alta
- [ ] 145 — Criar o teste que verifica policy contra o banco, não contra o arquivo — onda 5 — Alta
- [ ] 146 — Criar os testes que faltam para comissão — onda 5 — Alta
- [ ] 147 — Criar o teste de concessão de premiação — onda 5 — Alta
- [ ] 148 — Criar o teste do caminho de importação de clientes — onda 5 — Média
- [ ] 149 — Fazer a guarda de console realmente reprovar o teste — onda 5 — Média
- [ ] 150 — Remover a duplicação de execução dos testes de interface — onda 5 — Baixa
- [ ] 151 — Ligar o destino do registro de erro do front — onda 5 — Alta · **APROV**
- [x] 152 — Parar de dizer ao usuário que a equipe foi notificada — onda 5 — Alta — PR #672 - frase "equipe ja foi notificada" removida: grep por "notificada" em src/ sem ocorrencias
- [ ] 153 — Descobrir por que o histórico de execução de rotina não diminui — onda 5 — Média
- [ ] 154 — Fazer o filtro de comissões não descartar linha sem nome — onda 5 — Baixa
- [ ] 155 — Validar valor de venda no servidor, não só no navegador — onda 5 — Baixa · **APROV**
- [ ] 156 — Remover a marca de ordem de bytes das duas migrations — onda 5 — Baixa · **APROV**
- [ ] 157 — Substituir a lista de nomes proibidos de `portfolio_settings` — onda 5 — Baixa · **APROV**
- [ ] 158 — Fazer o `health` informar a versão em produção — onda 5 — Baixa · **APROV**
- [ ] 159 — Registrar a divergência de `call_tracking` ou remover a migration do ledger — onda 5 — Baixa
- [ ] 160 — Alinhar a declaração de funções sem JWT com a realidade — onda 5 — Média · **APROV**
- [ ] 161 — Criar a verificação que impede a superfície pública de divergir de novo — onda 5 — Média · **APROV**

## Onda 6 — Performance e escala
- [ ] 162 — Corrigir o truncamento do relatório de atividades da equipe — onda 6 — Alta · **APROV**
- [ ] 163 — Auditar as 101 consultas sem limite e classificar por risco — onda 6 — Média
- [ ] 164 — Agregar no banco os indicadores de BI de vendas — onda 6 — Média · **APROV**
- [ ] 165 — Agregar no banco as métricas de closer e de vendedor — onda 6 — Média · **APROV**
- [ ] 166 — Agregar no banco as análises de cliente — onda 6 — Média
- [x] 167 — Remover a consulta de 957 linhas cujo resultado é descartado — onda 6 — Baixa — PR #673 - consulta descartada _allTeamSales removida de useSalespersonCoaching
- [ ] 168 — Medir as consultas lentas em produção antes de otimizar mais — onda 6 — Média
- [ ] 169 — Criar os índices que a medição apontar — onda 6 — Média · **APROV**
- [ ] 170 — Reduzir o peso das assinaturas em tempo real nos painéis mais abertos — onda 6 — Média

## Onda 7 — Experiência de uso e consistência
- [x] 171 — Filtrar o menu pelo papel do usuário — onda 7 — Alta — PR #675 - routeAccess derivado do roteador; menu e paleta filtrados
- [x] 172 — Corrigir o modo de visualização do menu lido do navegador — onda 7 — Média — PR #675 - modo salvo validado contra o papel e removido quando invalido
- [ ] 173 — Alinhar o rótulo "Administração" com quem realmente pode entrar — onda 7 — Média · **APROV**
- [x] 174 — Dar acesso à administração no celular — onda 7 — Alta — PR #675 - MobileDrawer renderiza adminOnlyItems em grupo colapsavel
- [x] 175 — Pedir confirmação antes de excluir chave de funcionalidade — onda 7 — Alta — PR #676 - AlertDialog com nome da chave e desativar como opcao reversivel
- [x] 176 — Corrigir os dois botões destrutivos da auditoria de premiações — onda 7 — Alta — PR #676 - icone Trash2, aria-label e AlertDialog nomeando vendedor e premio
- [ ] 177 — Varrer as demais ações destrutivas sem confirmação — onda 7 — Média
- [x] 178 — Corrigir a rota de assinatura digital no menu do Closer — onda 7 — Baixa — PR #678 - /assinatura-digital segue managerOnlyRoutes e o filtro por papel tira o item do menu do Closer; teste em routeAccess.test.ts
- [x] 179 — Unificar as duas listas de pré-carregamento de rota — onda 7 — Baixa — PR #678 - NavLink consome routePrefetchMap; lista interna removida e as 12 rotas exclusivas do NavLink levadas para o mapa
- [x] 180 — Remover o componente órfão e o módulo usado só por teste — onda 7 — Baixa — PR #678 - level-up-celebration.tsx removido; orderTracking/stages.ts mantido (decisão do dono pendente)
- [ ] 181 — Fechar o grant de `anon` nas views de telemetria — onda 7 — Média · **APROV**
- [ ] 182 — Igualar a defesa das tabelas de negação explícita — onda 7 — Baixa
- [ ] 183 — Corrigir o remetente da escalação de alerta — onda 7 — Média · **APROV**
- [ ] 184 — Dar reenvio ao webhook genérico de saída — onda 7 — Média · **APROV**
- [ ] 185 — Incluir timestamp na assinatura dos webhooks de saída — onda 7 — Média
- [ ] 186 — Corrigir o documento de integrações que descreve outro banco — onda 7 — Média
- [ ] 187 — Varrer a documentação de estado por medições feitas fora do banco oficial — onda 7 — Média
- [ ] 188 — Registrar quais crons da máquina de vendas estão realmente ativos — onda 7 — Baixa
- [ ] 189 — Reagendar os crons da máquina de vendas que estiverem faltando — onda 7 — Média · **APROV**
- [x] 190 — Padronizar o formato de resposta de erro das funções — onda 7 — Baixa — PR #688 - regra registrada no `AGENTS.md` §7: função nova ou tocada usa `_shared/http-envelope.ts`, webhook de saída só troca de formato com contrato conferido; gate `check-claude-md-integrity.mjs` exit 0 (134849 bytes, 8 seções)

## Onda 8 — Higiene, CI e observabilidade
- [ ] 191 — Revogar o grant anônimo — lote de gamificação e corrida — onda 8 — Média · **APROV**
- [ ] 192 — Revogar o grant anônimo — lote de cadências e sequências — onda 8 — Média · **APROV**
- [ ] 193 — Revogar o grant anônimo — lote de relatórios e BI — onda 8 — Média · **APROV**
- [ ] 194 — Revogar o grant anônimo — lote de coaching e avaliação — onda 8 — Média · **APROV**
- [ ] 195 — Revogar o grant anônimo — lote de integrações e webhooks — onda 8 — Média · **APROV**
- [ ] 196 — Revogar o grant anônimo — lote de administração e configuração — onda 8 — Média · **APROV**
- [ ] 197 — Revogar o grant anônimo — lote de atividades, agenda e notificações — onda 8 — Média · **APROV**
- [ ] 198 — Revogar o grant anônimo — lote de as tabelas restantes — onda 8 — Média · **APROV**
- [ ] 199 — Remover gatilhos duplicados de `updated_at` — as 25 tabelas de maior volume de escrita — onda 8 — Média · **APROV**
- [ ] 200 — Remover gatilhos duplicados de `updated_at` — as 30 seguintes — onda 8 — Média · **APROV**
- [ ] 201 — Remover gatilhos duplicados de `updated_at` — as 30 seguintes — onda 8 — Média · **APROV**
- [ ] 202 — Remover gatilhos duplicados de `updated_at` — as restantes — onda 8 — Média · **APROV**
- [ ] 203 — Remover índices exatamente duplicados — primeiros 5 grupos — onda 8 — Média · **APROV**
- [ ] 204 — Remover índices exatamente duplicados — grupos 6 a 10 — onda 8 — Média · **APROV**
- [ ] 205 — Remover índices exatamente duplicados — grupos 11 a 14 — onda 8 — Média · **APROV**
- [ ] 206 — Classificar as 31 tabelas órfãs — onda 8 — Baixa
- [ ] 207 — Remover as policies e gatilhos das tabelas órfãs confirmadas — onda 8 — Baixa · **APROV**
- [ ] 208 — Remover as tabelas órfãs aprovadas pelo dono — onda 8 — Baixa · **APROV**
- [ ] 209 — Revisar supressões da regra de dependências — os 10 ganchos que escrevem no banco — onda 8 — Média
- [ ] 210 — Revisar supressões da regra de dependências — os 15 de leitura de dado de negócio — onda 8 — Média
- [ ] 211 — Revisar supressões da regra de dependências — os 15 de interface e gamificação — onda 8 — Média
- [ ] 212 — Revisar supressões da regra de dependências — os restantes — onda 8 — Média
- [x] 213 — Escopar as funções que autenticam e descartam — busca semântica e busca visual — onda 8 — Média — PR #696 - `semantic-index-entity` passou a ler a entidade de origem com o client do chamador (RLS decide): cliente de outro vendedor deu 404 e a leitura no stub apareceu como `as=user`, contra `as=svc` na main; `semantic-search` e `visual-search` autenticam antes do limite e chaveiam o bucket pelo `userId`, então 33 chamadas com o mesmo JWT e `X-Forwarded-For` trocado deram 3× 429, contra 0× na main
- [x] 214 — Escopar as funções que autenticam e descartam — inteligência preditiva e análise comportamental — onda 8 — Média — PR #697 - as três autenticam antes do limite e chaveiam o bucket pelo `userId`: 26 chamadas com o mesmo JWT e `X-Forwarded-For` trocado deram 7× 429, contra 0× na main; `predictive-intelligence` e `revenue-forecast-ai` passaram a ler com o client do chamador e o stub registrou `sales`/`clients`/`lead_scores`/`stage_probabilities`/`revenue_forecast_view` como `as=user`, contra `as=svc` na main
- [x] 215 — Escopar as funções que autenticam e descartam — enriquecimento de lead — onda 8 — Média — PR #128 - `enrich-lead` não lê nem grava registro algum desde #128 (`996c70197`): autentica, descarta a identidade e devolve 503 `enrichment_provider_not_configured`, então não há escopo a aplicar; verificado na leitura do arquivo
- [x] 216 — Escopar as funções que autenticam e descartam — OAuth do Bitrix24 e simulação de carga — onda 8 — Média — PR #695 - status do Bitrix24 e `simulate-load` passaram a exigir admin/gestor (`is_admin_or_manager`); JWT de usuário comum deu 403 e admin 200/400, contra 200 na main nos dois casos; 401 sem credencial e o caminho interno service_role intactos
- [x] 217 — Pôr barreira de identidade antes dos endpoints de IA pagos — onda 8 — Média — PR #693 - `getUserClient(req)` roda antes do gateway nas 4 funções e devolve 401 para Bearer ausente, anon ou service_role; POST sem header e com chave publishable deram 401 nas quatro e com JWT chegaram na lógica (na main o mesmo POST dava 400, prova de detecção); rate limit mantido como segunda camada, chaveado por `userId`
- [ ] 218 — Medir o consumo de IA antes e depois do fechamento dos endpoints — onda 8 — Baixa
- [x] 219 — Validar a lista de colunas no `external-db-bridge` — onda 8 — Média — PR #694 - `columns` do corpo passou a ser validado contra allowlist explícita por tabela (206 colunas de `types.ts`); `*, outra_tabela(*)`, `senha_hash` e `id, outra_tabela(id)` deram 400 e pararam antes do banco externo (3 de 5 requisições chegaram lá; na main as 5 chegavam), default sem `columns` intacto
- [ ] 220 — Redistribuir o esforço de teste de backend — onda 8 — Média
- [ ] 221 — Incluir os testes de backend no comando de integração contínua local — onda 8 — Baixa
- [x] 222 — Devolver o teto de complexidade ao valor anterior — onda 8 — Média — PR #698 - medido `npm run lint:complexity` = 131 warnings (112 de complexidade e 19 de tamanho de arquivo) em 121 arquivos; o teto do `package.json` já era 131, ou seja igual ao medido e sem folga; devolver a 126 exigiria refatorar 5 funções em uso (nenhum ofensor é código morto — `BICloser`, `Index`, `BISDR`, `RaceArena` e `PredictiveIntelligenceDashboard` estão em rotas ativas), proibido pelo próprio plano, então o teto ficou e a dívida foi registrada no `docs/TECH_DEBT.md` com a data da medição
- [ ] 223 — Tirar o `continue-on-error` do job de release — onda 8 — Baixa · **APROV**
- [ ] 224 — Fazer o auto-merge do Dependabot respeitar os checks que importam — onda 8 — Média · **APROV**
- [ ] 225 — Rodar a varredura de acessibilidade e registrar a linha de base — onda 8 — Média
- [ ] 226 — Corrigir as violações de acessibilidade nos fluxos de dinheiro — onda 8 — Média
- [ ] 227 — Definir o piso de acessibilidade que o CI vai exigir — onda 8 — Baixa · **APROV**
- [ ] 228 — Unificar as duas tabelas de nível do vendedor — onda 8 — Média · **APROV**
- [x] 229 — Corrigir o alerta de inventário que marca funções vivas como sem deploy — onda 8 — Alta — PR #690 - causa real era a página cheia: `GET /functions` devolveu 100 (teto) para 171 pastas, e 171−100 era o "71 sem deploy"; `compararEdges` agora marca `publicadas_truncadas` e devolve `no_repo_sem_deploy: null`, e o relatório emite `edge_lista_truncada` em vez de `edge_sem_deploy`/`edge_limite_do_plano`; simular o código antigo com os dados reais reproduz os dois alertas do `banco.json`, o corrigido não; 18/18 no teste unitário e `not ok 10` com o código da main
- [x] 230 — Alinhar a premissa de limite de edge functions na documentação de agentes — onda 8 — Média — PR #699 - medido no repo: 173 diretórios em `supabase/functions/`, 172 com `index.ts` (só `_shared/` não tem); o `AGENTS.md` §7 declarava 171 e "plano limita a 100 deployadas", que nunca foi verificado (Management API responde 401) — a frase passou a declarar o medido, o critério de contagem e o não verificado, e a linha seguinte foi alinhada para 172
- [ ] 231 — Corrigir a matriz de RLS da documentação — onda 8 — Alta
- [ ] 232 — Criar o procedimento que mantém a matriz de RLS verdadeira — onda 8 — Média
- [ ] 233 — Atualizar a documentação da API com a realidade dos endpoints — onda 8 — Média
- [ ] 234 — Registrar no runbook o que fazer quando um alerta de cron disparar — onda 8 — Média
- [ ] 235 — Criar o teste de RLS por papel para as tabelas de desempenho — onda 8 — Alta
- [ ] 236 — Criar o teste de RLS por papel para a cadeia de dinheiro — onda 8 — Alta
- [ ] 237 — Criar o teste do fluxo de aprovação com quórum — onda 8 — Média
- [ ] 238 — Criar o teste do mapeamento de status de cotação externa — onda 8 — Alta
- [ ] 239 — Criar o teste do ciclo de reabertura de venda — onda 8 — Alta
- [ ] 240 — Verificar e registrar o fechamento da Onda 1 — onda 8 — Alta
- [ ] 241 — Verificar e registrar o fechamento da Onda 2 — onda 8 — Alta
- [ ] 242 — Verificar e registrar o fechamento da Onda 3 — onda 8 — Alta
- [ ] 243 — Verificar e registrar o fechamento das Ondas 4 a 8 — onda 8 — Média
- [ ] 244 — Tornar o portão de cobertura honesto sobre o que protege — onda 8 — Alta · **APROV**
- [x] 245 — Fazer o verificador de tipos estritos falhar quando não conseguir rodar — onda 8 — Alta — PR #682 - config ausente, ENOENT/ENOBUFS, status nulo e status != 0 sem erro reconhecido saem com exit 1; os 4 caminhos foram forcados e provados
- [ ] 246 — Corrigir o filtro de status do LTV por segmento — onda 8 — Média · **APROV**
- [ ] 247 — Levar as escritas de sistema para a máquina de estados — onda 8 — Média · **APROV**
- [ ] 248 — Resolver a contradição do `ranking-api` — onda 8 — Média · **APROV**
- [ ] 249 — Fazer o Deploy Pipeline falhar quando não deployar — onda 8 — Média · **APROV**
- [x] 250 — Completar o `.env.example` com as variáveis que o sistema realmente lê — onda 8 — Média — PR #683 - inventário dos 3 destinos (Vite, GitHub Secrets, Supabase Secrets) cobre as 84 variáveis lidas; VITE_APP_URL, VITE_CANONICAL_URL e VITE_SUPABASE_TEST_MODE incluídas; nenhum valor sensível
- [x] 251 — Tornar explícita a ordem de precedência de papéis — onda 8 — Baixa — PR #684 - `pickHighestRole` com precedência explícita (admin > manager > salesperson) substitui `.order('role').limit(1)`; 10 testes novos provam que a escolha não depende do alfabeto e que sem o fix 6 falham
- [ ] 252 — Decidir sobre o bucket público de fotos de perfil — onda 8 — Baixa · **APROV**
- [ ] 253 — Fazer o guard-rail de `service_role` ser verificado — onda 8 — Baixa · **APROV**
- [ ] 254 — Reduzir o risco do workflow com `pull_request_target` — onda 8 — Baixa · **APROV**
- [x] 255 — Garantir a remoção dos mapas de código-fonte do pacote publicado — onda 8 — Baixa — PR #685 - plugin `remove-sourcemaps-after-upload` (`closeBundle`, `enforce:'post'`) apaga `dist/assets/*.map` com ou sem `SENTRY_AUTH_TOKEN`; build real provou 466 mapas antes e 0 depois, com o entry JS intacto

---

## Achados novos (não planejados)

Problema encontrado durante a execução **não é corrigido na hora** (regra 4 das instruções
do executor). Anote aqui, com arquivo:linha, e siga a etapa em curso.

| Data | Etapa em curso | Achado | Evidência (arquivo:linha) |
|---|---|---|---|
| | | | |

## Divergências encontradas

Etapa cuja evidência não corresponde mais ao código atual (regra 2). Registre e vá para a
próxima etapa independente.

| Data | Etapa | O que o plano dizia | O que você encontrou |
|---|---|---|---|
| | | | |

## Verificações de fechamento de onda

As etapas 240 a 243 pedem o registro consolidado por onda. Use esta seção para elas.

### Onda 1 (etapa 240)
_não executada_

### Onda 2 (etapa 241)
_não executada_

### Onda 3 (etapa 242)
_não executada_

### Ondas 4 a 8 (etapa 243)
_não executada_

## Medições pedidas pelo plano

Etapas que **só medem** e cujo resultado decide as seguintes. Registre a saída aqui.

| Etapa | O que medir | Resultado | Data |
|---|---|---|---|
| 002 | `automation_workflows` ativos com ação `update_stage` (decide a urgência de 003) | | |
| 087 | `quote_sync_inbound_log` × `webhook_inbound_dedupe` (decide se 088 existe) | | |
| 153 | corpo de `fn_cleanup_stale_logs` (decide o caminho de A-21/A-150) | | |
| 163 | classificação das 101 consultas sem limite | | |
| 168 | 30 consultas mais custosas (`pg_stat_statements`) | | |
| 188 | `cron.job` × os 12 jobs da migration da máquina de vendas | | |
| 206 | classificação das 31 tabelas órfãs | | |
| 218 | consumo de IA antes/depois do fechamento dos endpoints | | |
| 225 | linha de base de acessibilidade (`npm run a11y:report`) | | |
