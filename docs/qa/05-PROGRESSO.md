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
- [ ] 003 — Escopar o `update_stage` do `execute-workflow` ao dono da venda — onda 1 — Crítica
- [ ] 004 — Exigir aprovador humano no environment `Production` — onda 1 — Crítica · **APROV**
- [ ] 005 — Autenticar `new-device-alert` — onda 1 — Crítica
- [ ] 006 — Fazer `workflow-executor` respeitar o resultado da autenticação — onda 1 — Alta
- [ ] 007 — Autenticar `notify-critical-pattern` e escapar o HTML do e-mail — onda 1 — Alta
- [ ] 008 — Validar a condição da premiação no servidor — onda 1 — Crítica · **APROV**
- [ ] 009 — Trocar o fallback permissivo de `evaluateBonus` por recusa explícita — onda 1 — Crítica
- [ ] 010 — Desbloquear a criação de migrations (versões datadas no futuro) — onda 1 — Média · **APROV**
- [ ] 011 — Ligar o ranking mensal à avaliação de premiação — onda 1 — Alta · **APROV**
- [ ] 012 — Escopar `analyze-call` ao dono da gravação — onda 1 — Alta
- [ ] 013 — Escopar `sequence-record-reply` ao dono da cadência — onda 1 — Alta
- [ ] 014 — Escopar `schedule-optimal-send` à venda do chamador — onda 1 — Média
- [ ] 015 — Escopar `csat-ces-trigger` à conta do chamador — onda 1 — Média
- [ ] 016 — Restringir `rotate-daily-challenges` ao cron e ao administrador — onda 1 — Média
- [ ] 017 — Restringir o recálculo em massa de `lead-scoring` — onda 1 — Média
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
- [ ] 041 — Corrigir o custo de comissão do painel de ROI — onda 2 — Crítica
- [ ] 042 — Unificar "a comissão desta venda" numa única fonte — onda 2 — Crítica · **APROV**
- [ ] 043 — Separar "Arquivado" de "Ganho" — onda 2 — Crítica · **APROV**
- [ ] 044 — Mapear "cotação expirada" para um status que não seja ganho — onda 2 — Crítica · **APROV**
- [ ] 045 — Fazer os outros três pipelines moverem card — onda 2 — Alta · **APROV**
- [ ] 046 — Aplicar as regras de aprovação que a tela promete — onda 2 — Alta · **APROV**
- [ ] 047 — Só marcar "aprovado" depois de a mudança ser aplicada — onda 2 — Alta · **APROV**
- [ ] 048 — Decidir e resolver a entrada de cotações do parceiro — onda 2 — Alta · **APROV**
- [ ] 049 — Fazer o botão "Reprocessar" reprocessar — onda 2 — Alta
- [ ] 050 — Dar policy de escrita a `cadence_alert_templates` — onda 2 — Alta · **APROV**
- [ ] 051 — Dar policy de escrita a `cadence_outcome_rules` — onda 2 — Alta · **APROV**
- [ ] 052 — Resolver a gravação de `integration_logs` — onda 2 — Média
- [ ] 053 — Resolver a gravação de `lead_score_trends` — onda 2 — Média
- [ ] 054 — Permitir marcar follow-up como enviado (e parar de engolir o erro) — onda 2 — Alta · **APROV**
- [ ] 055 — Permitir excluir a conversa do assistente — onda 2 — Média · **APROV**
- [ ] 056 — Tornar transacional a mudança de status de orçamento — onda 2 — Alta · **APROV**
- [ ] 057 — Consertar a atualização otimista do pipeline — onda 2 — Alta
- [ ] 058 — Consertar a atualização otimista de clientes — onda 2 — Alta
- [ ] 059 — Consertar a atualização otimista de produtos — onda 2 — Média
- [ ] 060 — Fazer a previsão de receita falhar visivelmente em vez de mentir — onda 2 — Alta
- [ ] 061 — Tratar o erro das consultas paralelas de premiação — onda 2 — Alta
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
- [ ] 075 — Excluir comissões canceladas do total do vendedor — onda 3 — Baixa
- [ ] 076 — Tirar os números inventados do simulador de ganhos — onda 3 — Média
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
- [ ] 087 — Medir se a deduplicação de webhook está realmente gravando — onda 3 — Média
- [ ] 088 — Religar a deduplicação no caminho de entrada de cotações — onda 3 — Alta
- [ ] 089 — Fazer o cron perceber falha da função que ele chama — onda 3 — Alta · **APROV**
- [ ] 090 — Calibrar a espera do despachante de cron para não travar os trabalhadores — onda 3 — Média · **APROV**
- [ ] 091 — Alertar quando a sincronização do Bitrix24 falhar — onda 3 — Média
- [ ] 092 — Assinar o webhook de Win/Loss com HMAC do corpo — onda 3 — Crítica
- [ ] 093 — Parar de trazer o segredo do webhook para o navegador e passar a gravá-lo — onda 3 — Alta · **APROV**
- [ ] 094 — Tirar as credenciais de canal do navegador antes do primeiro provedor ser conectado — onda 3 — Alta · **APROV**
- [ ] 095 — Dar uma tela à lista de destinos permitidos de webhook — onda 3 — Média
- [ ] 096 — Proteger o teste de conexão de integração contra destino interno — onda 3 — Média
- [ ] 097 — Respeitar o limite de requisições dos terceiros fora do caminho de IA — onda 3 — Média
- [ ] 098 — Validar o formato da resposta do sistema de atendimento — onda 3 — Média
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
- [ ] 108 — Tirar os números fabricados do painel de Segurança — onda 4 — Média
- [ ] 109 — Esconder os botões de teste de gamificação em produção — onda 4 — Média
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
- [ ] 121 — Criar o tratamento padrão de erro de leitura — onda 5 — Alta
- [ ] 122 — Mostrar erro em vez de "nenhuma comissão" — onda 5 — Alta
- [ ] 123 — Mostrar erro em vez de "nenhum registro" na trilha de auditoria — onda 5 — Alta
- [ ] 124 — Mostrar erro em vez de "nenhuma premiação para auditar" — onda 5 — Alta
- [ ] 125 — Mostrar erro nas telas de deduplicação e de chaves de funcionalidade — onda 5 — Média
- [ ] 126 — Mostrar erro na tela de supressão de e-mails — onda 5 — Média
- [ ] 127 — Varrer o repositório por erro de leitura engolido — onda 5 — Média
- [ ] 128 — Impedir que uma seção inválida de painel trave a página inicial — onda 5 — Alta
- [ ] 129 — Tornar a importação de clientes capaz de ler CSV de verdade — onda 5 — Alta · **APROV**
- [ ] 130 — Pedir confirmação explícita do volume antes de importar — onda 5 — Média
- [ ] 131 — Fazer o aviso de XP refletir o que foi creditado — onda 5 — Média
- [ ] 132 — Invalidar o contador de tarefas de follow-up após mutação — onda 5 — Média
- [ ] 133 — Unificar os dois ganchos que marcam etapa de playbook — onda 5 — Média
- [ ] 134 — Unificar as duas versões do funil de prospecção — onda 5 — Baixa · **APROV**
- [ ] 135 — Persistir a preferência de tema do painel — onda 5 — Baixa
- [ ] 136 — Remover o filtro declarado e ignorado em `useClients` — onda 5 — Baixa
- [ ] 137 — Filtrar as assinaturas em tempo real dos painéis — onda 5 — Baixa
- [ ] 138 — Liberar os canais de tempo real da corrida — onda 5 — Média
- [ ] 139 — Acrescentar o usuário às chaves de cache por pessoa — onda 5 — Baixa
- [ ] 140 — Dar justificativa real às supressões da regra de dependências — onda 5 — Média
- [ ] 141 — Corrigir o reenvio da preferência antiga em `useSyncedSetting` — onda 5 — Alta
- [ ] 142 — Avisar quando a conversa do assistente não for gravada — onda 5 — Média
- [ ] 143 — Dar asserções aos testes de fluxo principal — onda 5 — Alta
- [ ] 144 — Tirar o mock que substitui a regra sob teste — onda 5 — Alta
- [ ] 145 — Criar o teste que verifica policy contra o banco, não contra o arquivo — onda 5 — Alta
- [ ] 146 — Criar os testes que faltam para comissão — onda 5 — Alta
- [ ] 147 — Criar o teste de concessão de premiação — onda 5 — Alta
- [ ] 148 — Criar o teste do caminho de importação de clientes — onda 5 — Média
- [ ] 149 — Fazer a guarda de console realmente reprovar o teste — onda 5 — Média
- [ ] 150 — Remover a duplicação de execução dos testes de interface — onda 5 — Baixa
- [ ] 151 — Ligar o destino do registro de erro do front — onda 5 — Alta · **APROV**
- [ ] 152 — Parar de dizer ao usuário que a equipe foi notificada — onda 5 — Alta
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
- [ ] 167 — Remover a consulta de 957 linhas cujo resultado é descartado — onda 6 — Baixa
- [ ] 168 — Medir as consultas lentas em produção antes de otimizar mais — onda 6 — Média
- [ ] 169 — Criar os índices que a medição apontar — onda 6 — Média · **APROV**
- [ ] 170 — Reduzir o peso das assinaturas em tempo real nos painéis mais abertos — onda 6 — Média

## Onda 7 — Experiência de uso e consistência
- [ ] 171 — Filtrar o menu pelo papel do usuário — onda 7 — Alta
- [ ] 172 — Corrigir o modo de visualização do menu lido do navegador — onda 7 — Média
- [ ] 173 — Alinhar o rótulo "Administração" com quem realmente pode entrar — onda 7 — Média · **APROV**
- [ ] 174 — Dar acesso à administração no celular — onda 7 — Alta
- [ ] 175 — Pedir confirmação antes de excluir chave de funcionalidade — onda 7 — Alta
- [ ] 176 — Corrigir os dois botões destrutivos da auditoria de premiações — onda 7 — Alta
- [ ] 177 — Varrer as demais ações destrutivas sem confirmação — onda 7 — Média
- [ ] 178 — Corrigir a rota de assinatura digital no menu do Closer — onda 7 — Baixa
- [ ] 179 — Unificar as duas listas de pré-carregamento de rota — onda 7 — Baixa
- [ ] 180 — Remover o componente órfão e o módulo usado só por teste — onda 7 — Baixa
- [ ] 181 — Fechar o grant de `anon` nas views de telemetria — onda 7 — Média · **APROV**
- [ ] 182 — Igualar a defesa das tabelas de negação explícita — onda 7 — Baixa
- [ ] 183 — Corrigir o remetente da escalação de alerta — onda 7 — Média · **APROV**
- [ ] 184 — Dar reenvio ao webhook genérico de saída — onda 7 — Média · **APROV**
- [ ] 185 — Incluir timestamp na assinatura dos webhooks de saída — onda 7 — Média
- [ ] 186 — Corrigir o documento de integrações que descreve outro banco — onda 7 — Média
- [ ] 187 — Varrer a documentação de estado por medições feitas fora do banco oficial — onda 7 — Média
- [ ] 188 — Registrar quais crons da máquina de vendas estão realmente ativos — onda 7 — Baixa
- [ ] 189 — Reagendar os crons da máquina de vendas que estiverem faltando — onda 7 — Média · **APROV**
- [ ] 190 — Padronizar o formato de resposta de erro das funções — onda 7 — Baixa

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
- [ ] 213 — Escopar as funções que autenticam e descartam — busca semântica e busca visual — onda 8 — Média
- [ ] 214 — Escopar as funções que autenticam e descartam — inteligência preditiva e análise comportamental — onda 8 — Média
- [ ] 215 — Escopar as funções que autenticam e descartam — enriquecimento de lead — onda 8 — Média
- [ ] 216 — Escopar as funções que autenticam e descartam — OAuth do Bitrix24 e simulação de carga — onda 8 — Média
- [ ] 217 — Pôr barreira de identidade antes dos endpoints de IA pagos — onda 8 — Média
- [ ] 218 — Medir o consumo de IA antes e depois do fechamento dos endpoints — onda 8 — Baixa
- [ ] 219 — Validar a lista de colunas no `external-db-bridge` — onda 8 — Média
- [ ] 220 — Redistribuir o esforço de teste de backend — onda 8 — Média
- [ ] 221 — Incluir os testes de backend no comando de integração contínua local — onda 8 — Baixa
- [ ] 222 — Devolver o teto de complexidade ao valor anterior — onda 8 — Média
- [ ] 223 — Tirar o `continue-on-error` do job de release — onda 8 — Baixa · **APROV**
- [ ] 224 — Fazer o auto-merge do Dependabot respeitar os checks que importam — onda 8 — Média · **APROV**
- [ ] 225 — Rodar a varredura de acessibilidade e registrar a linha de base — onda 8 — Média
- [ ] 226 — Corrigir as violações de acessibilidade nos fluxos de dinheiro — onda 8 — Média
- [ ] 227 — Definir o piso de acessibilidade que o CI vai exigir — onda 8 — Baixa · **APROV**
- [ ] 228 — Unificar as duas tabelas de nível do vendedor — onda 8 — Média · **APROV**
- [ ] 229 — Corrigir o alerta de inventário que marca funções vivas como sem deploy — onda 8 — Alta
- [ ] 230 — Alinhar a premissa de limite de edge functions na documentação de agentes — onda 8 — Média
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
- [ ] 245 — Fazer o verificador de tipos estritos falhar quando não conseguir rodar — onda 8 — Alta
- [ ] 246 — Corrigir o filtro de status do LTV por segmento — onda 8 — Média · **APROV**
- [ ] 247 — Levar as escritas de sistema para a máquina de estados — onda 8 — Média · **APROV**
- [ ] 248 — Resolver a contradição do `ranking-api` — onda 8 — Média · **APROV**
- [ ] 249 — Fazer o Deploy Pipeline falhar quando não deployar — onda 8 — Média · **APROV**
- [ ] 250 — Completar o `.env.example` com as variáveis que o sistema realmente lê — onda 8 — Média
- [ ] 251 — Tornar explícita a ordem de precedência de papéis — onda 8 — Baixa
- [ ] 252 — Decidir sobre o bucket público de fotos de perfil — onda 8 — Baixa · **APROV**
- [ ] 253 — Fazer o guard-rail de `service_role` ser verificado — onda 8 — Baixa · **APROV**
- [ ] 254 — Reduzir o risco do workflow com `pull_request_target` — onda 8 — Baixa · **APROV**
- [ ] 255 — Garantir a remoção dos mapas de código-fonte do pacote publicado — onda 8 — Baixa

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
