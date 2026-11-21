# Changelog

## [1.6.1](https://github.com/adm01-debug/Promo_Champions_V2.1/compare/promo-champions-v2-v1.6.0...promo-champions-v2-v1.6.1) (2026-11-21)


### Correções

* adiciona --yes no deploy de edge functions para CI ([#578](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/578)) ([9f4dba8](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/9f4dba8ad6cbbabe90ccf867e9226e4aa06e768f))
* **ci:** deploy de edge functions por allowlist (100) em vez de todas (171) ([#581](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/581)) ([d7af709](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d7af70945f69f96835b541f311c5d58e6a29a579))
* curva de evolução omite o dia atual em TZ a oeste de UTC ([#586](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/586)) ([7bf29f5](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/7bf29f54a0362eb82ecce8abe1fb05ce273b6757))
* **db:** dropa policies permissive de sales/activities (USING true) ([#582](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/582)) ([9017094](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/90170947dd61c137feaf860c2ecb28add9bfaa84))
* **db:** gerador de probes materializa DDL dinamico DO..EXECUTE ([#583](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/583)) ([de515ef](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/de515efb235710c321983479cd420779556f2333))
* endurece anti prompt injection no personal-assistant-stream (A5) ([#594](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/594)) ([2ac2520](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2ac2520d7eb4db50ad93d78dc76703bb757c24d0))
* grava path do PDF de quote em bucket privado ([#590](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/590)) ([76bcae8](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/76bcae837dac1265ad6a22bd5d357aca715c0bd1))
* restringe export-winloss-pdf ao escopo do usuario (A3) ([#591](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/591)) ([be50d67](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/be50d67a3a33585e5c422477a1e27cfc21d0744b))
* retry com backoff nos envios agendados e CHECK de status quebrado (T15) ([#596](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/596)) ([f26c873](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f26c87381ce97773d14255b80d1c590eadae8a0c))
* testes de CORS alinhados ao SEC-07 (allowlist, nunca *) ([#597](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/597)) ([d5e7079](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d5e70798da27cb0816b32805550665bb900019b3))

## [1.6.0](https://github.com/adm01-debug/Promo_Champions_V2.1/compare/promo-champions-v2-v1.5.0...promo-champions-v2-v1.6.0) (2026-11-18)


### Funcionalidades

* dependency review nos PRs ([#576](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/576)) ([cc8d2d2](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/cc8d2d2cfad73fef4442b875bf8442f739fc8968))

## [1.5.0](https://github.com/adm01-debug/Promo_Champions_V2.1/compare/promo-champions-v2-v1.4.0...promo-champions-v2-v1.5.0) (2026-11-18)


### Funcionalidades

* **bi:** ações recomendadas na curva ABC a partir da classificação real ([#545](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/545)) ([133abff](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/133abff3e734a9418ff8a797cca523f459ce45fd))
* **bi:** painel de mudança de classe ABC com dado real ([#568](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/568)) ([de87a0c](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/de87a0c6326a36d33c3da59f163e61ef399d1019))
* **db:** auditoria nas duas tabelas de webhook ([#551](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/551)) ([2a3a8ca](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2a3a8ca1d012ec66efc58a54f6524a0876ecc345))
* **db:** bloqueia SSRF e limita taxa nos webhooks de saída ([#530](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/530)) ([007a6c4](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/007a6c454429caa68faddb8d724a8cd30c3b6da2))
* **email:** clique e abertura de e-mail alimentam o score de engajamento ([#558](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/558)) ([beed109](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/beed1098a97bbae374e0160a49cdaffc9f43540b))
* **email:** resposta de e-mail passa a gravar sinal de engajamento ([#561](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/561)) ([d2460a9](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d2460a9602cf2e69efe03afe6ebbe44da9fbf422))
* **engagement:** entrada para o recálculo em lote do engajamento de contato ([#557](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/557)) ([ba21ed9](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/ba21ed98ab64e88a6e112a4d5b22aae6def69e3e))
* **pipeline:** histórico do negócio direto do card, para negócio em aberto ([#573](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/573)) ([8a0bc94](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/8a0bc946dd3d428b530e563c96ae5b113b395f6a))
* **sequências:** melhor horário de envio por contato na inscrição da sequência ([#574](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/574)) ([58dbc25](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/58dbc2530cc3cbbbd9b6868f9982749fcc42d156))
* **tarefas:** vendedor vê e submete as tarefas que o gestor atribuiu ([#571](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/571)) ([5afc278](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/5afc27862f26e55de43afcd1a0afaa0d28a73853))
* **xp:** extrato de XP do vendedor, lendo a tabela que já era gravada ([#572](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/572)) ([eedadeb](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/eedadebcabd86dec4fbe5560479222c1939c287f))


### Correções

* **bi:** agrupa curva ABC por cliente real, nao por client_name ([#541](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/541)) ([1bcb694](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/1bcb6947fe563b431ff713ac0fc300f2ec097853))
* **bi:** remove promessa de retorno que a curva ABC nao sustenta ([#547](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/547)) ([f94042e](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f94042e2dfe0bb42f1e4a81082bc202658a2ac86))
* **cadências:** 500 em process-cadence-tasks — cria cadence_tasks.updated_at ([#553](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/553)) ([62ddfbe](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/62ddfbe10c2e9270e67f153e5ccb48d9c355f31f))
* **ci:** gate passa a rodar os 17 testes do gerador de probes ([#569](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/569)) ([9591c26](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/9591c26bd38a366b6c534671bfea8670e63da87b))
* **db:** 403 ao gravar error_logs — INSERT só existia para anon ([#554](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/554)) ([0b645fb](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/0b645fb99174959cc6ee541d3708cc0f5940d066))
* **db:** 403 na tela de Webhooks — remove policy morta que lê auth.users ([#552](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/552)) ([c4f4e3b](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/c4f4e3bc664658d711bb977fab30c5c9c1f9bc98))
* **db:** aperta os grants das tabelas de webhook que eu criei ([#533](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/533)) ([f49fcbc](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f49fcbcedd3d8da43a34a6c97c89e144c70d47af))
* **db:** cadastra no papel admin as permissões que ele já exerce ([#526](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/526)) ([a32e9b7](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/a32e9b76e5773f7e82fd7da134c45febbe4611ef))
* **db:** completa o conserto da sazonalidade, agora o cast de EXTRACT ([#527](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/527)) ([dd0137c](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/dd0137cc0c6d20a6f1afe5d95841adec65ab1acd))
* **db:** conserta as duas funções de sazonalidade quebradas em produção ([#525](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/525)) ([68ffc4f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/68ffc4fd7cdffe52ad05a1169990db453cd8998e))
* **db:** cria _internal_secrets antes de usa-la na migration de 15/07 ([#542](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/542)) ([cf25752](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/cf25752e788d245a1422ec6b7106c170f769b003))
* **db:** match_reply_to_enrollment consultava sales.email, coluna inexistente ([#562](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/562)) ([f0d43dc](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f0d43dce82a9e9126832a384bf890dd5c4e8bbd9))
* **db:** reconcilia 11 objetos de producao sem arquivo de migration ([#538](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/538)) ([d6521a4](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d6521a48fe4bdd9e4d7574857469ce5ff52f4ce1))
* **db:** registra no ledger as 594 migrations ja aplicadas no schema ([#543](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/543)) ([a45b9ed](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/a45b9ed7c4353f17e30a541f15781f59fdc1e4a4))
* **db:** remove do ledger as 241 versoes de migration sem arquivo local ([#540](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/540)) ([31ed35d](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/31ed35da36b9a0800509f3056a57f0f77d8617b0))
* **db:** resgata as constraints de integridade que faltavam de verdade ([#529](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/529)) ([56e7a51](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/56e7a51f72457d689fb1b4f71d0a834a67bd8916))
* índice do contexto carimba a data absoluta da coleta ([#566](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/566)) ([25f5950](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/25f5950373652e625bc85c24262a6fda1a0d39e4))
* match_reply_to_enrollment reconhece contato de conta ([#565](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/565)) ([8fc1c8c](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/8fc1c8c53c1b3fb7dc5be831f185cc9eca71f1d8))
* sinal de resposta independe da busca de inscrição ([#563](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/563)) ([6417fc3](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/6417fc362d9f7738bb8c525b290407ec10e8c8a1))
* SLA de revisão deixa de cobrar PR de bot ([#567](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/567)) ([54a8628](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/54a86288aa65db7f5f8b501e1140d6da392ea05d))

## [1.4.0](https://github.com/adm01-debug/Promo_Champions_V2.1/compare/promo-champions-v2-v1.3.0...promo-champions-v2-v1.4.0) (2026-11-14)


### Funcionalidades

* editar e arquivar materiais no Sales Enablement ([#433](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/433)) ([7ab97e0](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/7ab97e01e7ad92e0cc7181504c2c4ca40c4db6bc))
* editar e cancelar batalhas de vendas ([#431](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/431)) ([b68acd2](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/b68acd2b2d4e0743c20de4080699758f3a902d40))
* editar e desativar desafios semanais ([#432](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/432)) ([1f60080](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/1f60080cc6cbace9f740ad8e82dc13f35e7f147b))
* editar e excluir contas no Account-Based Selling ([#426](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/426)) ([21eae42](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/21eae42a81259886458779fa5f31c1fee0f656bc))
* editar e excluir filas do Power Dialer ([#435](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/435)) ([4e0bb00](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/4e0bb0027dbd429dec86b045e78a959f9c6de156))
* editar e excluir produto do fornecedor no comparador de preços ([#437](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/437)) ([7bc13e2](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/7bc13e25a6e36e3b7610cd9e136c44abe6f45d7f))
* editar e excluir workflows no Automation Builder ([#430](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/430)) ([9d3c316](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/9d3c316eac7a49bede04e12dd209182463ea6cd7))
* editar e remover signatários na assinatura digital ([#428](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/428)) ([5d2f222](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/5d2f222306a05820320574ab510ba90c68fffc58))
* editar, ativar/desativar e excluir fluxos de aprovação ([#436](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/436)) ([2c36718](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2c36718033f0e336dc9794c8703e25404ce8ac0a))


### Correções

* aba Market Intel da /arena mostra concorrentes reais em vez de matriz fixa ([#455](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/455)) ([fb51238](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/fb51238cd7206081390a4e746203490a73a0b39e))
* apontar APP_URL para o domínio de produção na Vercel ([#439](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/439)) ([05eca38](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/05eca381531e708c5e13a648c2df4ede971aed41))
* Call Rápida e Email Rápido gravam no vendedor do formulário, não no primeiro da lista ([#481](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/481)) ([d03b42e](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d03b42e6a8bffb08ba23c180163c389f5126246d))
* campo Vendedor do registro de atividade vem com o vendedor logado ([#471](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/471)) ([9bf39de](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/9bf39de0f9235b0f8ea11c3ea1431f2aefad80c0))
* card do pipeline não inventa saúde 50 nem recomendação para deal sem score ([#483](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/483)) ([31447ff](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/31447ff16118284d0f0ae6fbf57fb80695041ac4))
* corrigir vendedor e outcome nas ações do execute-workflow ([#476](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/476)) ([ceaddbf](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/ceaddbf823ddb236d773808817f2d6dfd6968e26))
* desabilita entrada na liga enquanto não há ligas cadastradas ([#443](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/443)) ([824a372](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/824a372bc23c834856139a846b492f53794085ec))
* Elite Analytics de cadências mostra taxa real e remove score e números fictícios ([#454](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/454)) ([bb623b7](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/bb623b7e109b47d0b691d8617715cfb3365ca73f))
* enviar completed_by ao marcar item do playbook no pipeline ([#470](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/470)) ([d21dcd1](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d21dcd1524d25b725cdd7a2c7698f8d56bbfe1e8))
* enviar user_id ao criar preferência de notificação ([#474](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/474)) ([3044064](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/3044064dc780f9970210b07a9842a2b099e1998a))
* etapa do playbook grava o vendedor certo em completed_by ([#479](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/479)) ([39cb90c](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/39cb90c0e438e48f3f91fccdc672d06466fb647f))
* grava pesquisa NPS no vendedor logado ([#473](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/473)) ([e399094](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/e3990945df3e11a6b365b273c6a86fa9890bb61e))
* grava vendedor logado como dono ao criar conta no ABM ([#475](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/475)) ([52ad2f4](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/52ad2f4057c69d1331632e65fd2084c5b298cd51))
* **hooks:** plano de conta ABM envia created_by ao criar ([#467](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/467)) ([56b4d2b](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/56b4d2b8f1f7436f95dd704f0995b77a9bfbb31c))
* liga a recuperação de clientes da Arena às vendas críticas reais ([#447](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/447)) ([914a813](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/914a813e48b105f843757a0601a8b695f10ca869))
* metas de atividades sem indicadores e ações fictícias ([#444](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/444)) ([749babe](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/749babe33860a05d65554bbe34b343c4497c586f))
* permite gestor inscrever participantes ao criar batalha ([#478](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/478)) ([b97dd91](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/b97dd9195cec7f1d835fbfa2a0cc393fe39bc637))
* pipeline sem saúde/decisores inventados e status nas colunas certas ([#457](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/457)) ([84c7cad](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/84c7cad953200eb24b7843eead3a951178245b20))
* plano de conta do ABM deixa de duplicar (um plano por conta, visível ao dono) ([#482](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/482)) ([2c56590](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2c565905a7675354240cd13515ed7fb45908cc8a))
* preencher vendedor logado ao criar venda ([#468](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/468)) ([6a1d1c3](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/6a1d1c31c85ea6b3325414440ce164ada4e24dab))
* qbr-scheduler grava QBR como meeting/pending e não engole erro ([#477](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/477)) ([3cf041b](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/3cf041b47cadb2cdcacb8219e13098980a6e397e))
* regras de contato gravam via upsert e avisam erro de verdade ([#456](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/456)) ([37fafa5](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/37fafa508d94551113726549602fa90af2471898))
* relatório de cadências passa a usar dados reais do banco ([#449](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/449)) ([c82f9b3](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/c82f9b3b30246e242373527597b7643a91514694))
* remove ações e previsões falsas do Cliente 360 ([#441](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/441)) ([0915aab](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/0915aab8564fff8dde969d42c0deae6ddf5a93da))
* remove presença fictícia do pipeline e liga vendas ganhas reais ([#453](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/453)) ([01cd315](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/01cd31563d69a0bada1666fff1e8567fc2ca6d46))
* remover dados e automações fictícios da análise ABC ([#446](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/446)) ([64382cb](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/64382cb9494868b4cd84ec7ea42ccb2748cf828a))
* remover fila de aprovação fictícia das cadências ([#440](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/440)) ([3f027d1](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/3f027d173dc40a2ac638f0c6a5705ac5cd2a2b04))
* remover tendências fixas dos KPIs de conversas ([#451](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/451)) ([389ba61](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/389ba6185a8f6423e46cb5dd2f7469dd95f8e5b3))
* restringe DELETE de accounts a gestor na RLS ([#460](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/460)) ([12b6200](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/12b6200f5043af677b628267190fc54b6e798917))
* simulador de cenarios usa receita ganha real e remove plano falso ([#450](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/450)) ([d0da8ad](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d0da8ade8235cff4a22097ae07eced7d3e311600))
* tarefa sem responsável passa a ficar com o vendedor logado ([#469](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/469)) ([f2155e8](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f2155e8e9d09b6a7f7984b4b4cdd15a7e98f7e3a))
* troca valores fixos de inteligência por dados reais ou estado vazio ([#442](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/442)) ([2ed73dc](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2ed73dc88a7ef1a5b0c8d7aae8ccd322bd4d5455))
* troca vendedores fictícios do analytics por dados reais ([#438](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/438)) ([3c77d1d](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/3c77d1d82401cbe24fa191eac096d4ad2cbcc397))

## [1.3.0](https://github.com/adm01-debug/Promo_Champions_V2.1/compare/promo-champions-v2-v1.2.0...promo-champions-v2-v1.3.0) (2026-11-12)


### Funcionalidades

* editar e excluir stakeholders da conta ABM ([#427](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/427)) ([d51e633](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d51e6339eee5046bdca46c1a378552fa2c704ecc))

## [1.2.0](https://github.com/adm01-debug/Promo_Champions_V2.1/compare/promo-champions-v2-v1.1.0...promo-champions-v2-v1.2.0) (2026-11-12)


### Funcionalidades

* migra recharts 2-&gt;3 (v3.10.1) typecheck/lint verdes ([#422](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/422)) ([e6a7784](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/e6a77847b0a63cef8ae4867a0c3483e12d6a373f))
* migra tailwind 3-&gt;4 (v4.3.5) ([#423](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/423)) ([f5e1a4f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f5e1a4f86dc5992550e6d4c10823032400a9aabf))
* workflow auto-corrige deno.lock em PRs do Dependabot ([#368](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/368)) ([d95348f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d95348f78b81a6ab56b37e50b69cabf2ed6d3cd5))


### Correções

* corrige relatório de impacto do graphify ([#390](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/390)) ([b80e879](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/b80e8790c3041637c5156967c4953d87916675de))
* corrige restore incondicional no hook de grafo e typo no count de workflows ([042d3e7](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/042d3e7f7116a11fe5abb5f3ebe7967a1bdd89c1))
* corrigir migrations_no_repo para contar apenas .sql do repo (~669) ([09ee2d8](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/09ee2d8ed3457591c9dd24e34bbca799c9cc2b99))
* corrigir timeout da seção grants no snapshot do banco ([#417](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/417)) ([31f6e2b](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/31f6e2b2c4f96d7be7570979f680b4a87876e28a))
* k6-smoke mira funções não deployadas e health sem chave ([#388](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/388)) ([7535bb0](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/7535bb0ff75a1a606f66d4bf4584a5e49748615d))
* probe de tabela filtra table_type='BASE TABLE' ([#381](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/381)) ([fa27151](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/fa271519296988d072d3357c9a9a52234a841563))
* protege a saída do snapshot e o trabalho local na publicação do contexto ([37bccd8](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/37bccd899e8d973619d0b2f21b265958fdb06cc6))
* surfaçar migrations_no_repo em banco.json.resumo ([#413](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/413)) ([4f31f1f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/4f31f1f07f797f738175f7d3d60ef9ce1713e4cf))

## [1.1.0](https://github.com/adm01-debug/Promo_Champions_V2.1/compare/promo-champions-v2-v1.0.0...promo-champions-v2-v1.1.0) (2026-11-07)


### Funcionalidades

* automações de contexto, inventário e types-sync para agentes de IA ([#362](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/362)) ([ef80740](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/ef8074050be40b374e6bc628c978ad4b56d9edac))
* supressão de DROP + filtro cmd em policies no gerador de probes de migrations ([#375](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/375)) ([82ee984](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/82ee984faa28944f2993f07a98b9e193f20ceb63))


### Correções

* bump eslint-plugin-react-refresh 0.5.7, jsdom 30.1.3, lint-staged 17.6.0 + regenera deno.lock ([6c6df6f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/6c6df6fb055c01c1e83d8b43078c1594de2217e3)), closes [#298](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/298) [#358](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/358) [#360](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/360)
* check-migrations — reset lastIndex e strippedContent no RLS check ([#364](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/364)) ([5abf273](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/5abf2731d842eaa52daa9cd24e92a4cb8d2c0a44))
* confere contagem do ledger apenas quando banco esta no topo do repo ([#382](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/382)) ([195e4fd](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/195e4fd7845c08a9d2a9ba9003114f3a9d4fed8d))
* **config:** CI Failure Alert só dispara em conclusões na main + RELATORIO_CI/PENDENCIAS ([#336](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/336)) ([e461580](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/e46158001dc72c167613e139fd6e08d586208d10))
* corrige 3 workflows autônomos com falha repetida ([#363](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/363)) ([aba5965](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/aba5965f5e64ef48c856e383bee4d9ab288ced4d))
* corrige typo LEDGER_TOLERA8CIA -&gt; LEDGER_TOLERANCIA em conferirOrigem ([#379](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/379)) ([13d4b86](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/13d4b861d468b5d7ab313d76f9c174cad1253942))
* **crm:** remediacao r3 de integracoes (bitrix24-sync, whatsapp-inbound, reply log) ([#343](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/343)) ([2d9f938](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2d9f9384ef7917ef6882f8e5a5ace7c18508e987))
* **db:** canonizar vocabulário de sales.status em RPCs e edge functions ([#335](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/335)) ([5d22ecd](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/5d22ecd3b7cb62671172b69afa046090784f801e))
* **db:** corrigir achados R3 da canonização de sales.status ([#341](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/341)) ([4b7905f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/4b7905f9619796b69ef2e3d7f361d2fe25e3bea9))
* **db:** remediacao r3 lgpd/gamificacao — cobertura da anonimizacao, telefone canonico, guarda de payload e xp com posse ([#342](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/342)) ([8d6274f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/8d6274f42869e6cd1a46d5b5de87566f5a2ecd82))
* **db:** restringe RPCs de agent_runs, retoma aprovações e valida JWT/embed ([#334](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/334)) ([1e3a191](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/1e3a191b26504af202a587703385466c16611108))
* **db:** trava escrita direta em agent_runs/actions e idempotencia da retomada ([#340](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/340)) ([839645f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/839645f2409495213588d8174d9f3c5534eaa0b0))
* desabilita gate e2e em PRs ([#374](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/374)) ([4606224](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/460622417d808c24b22775783abdc023cf5a6789))
* **gamification:** endurecer RPCs de XP/corrida, sync de desafios e anonimizacao LGPD ([#306](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/306)) ([d8fcd7b](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d8fcd7bddd9634ef7154dff6a9d9b6b92e1f5e2d))
* parsers de linha toleram CRLF em checkouts Windows ([#384](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/384)) ([f6010c9](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f6010c9683f79fd87ba92218ad30c17d645af48c))
* r3 — briefing jsonb coagido na borda, realtime sem remount morto, alerta de deploy por tag ([#339](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/339)) ([2aa90b9](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2aa90b96fec954d1bb1ab3d04bd563964a8b164d))
* release-please com continue-on-error para não reprovar status da main ([aeb70d7](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/aeb70d7271001e6e5c2ae03b17b1cbe41e82cdf2))
* remover check contagens_ok em conferirOrigem (drift Lovable) ([#370](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/370)) ([ae24e8f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/ae24e8f0c47542918f761470f2d47427e12f5af9))
* **services:** integrações — JID com device, reply de protocolo/reação e lease+paginação no bitrix24-sync ([#333](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/333)) ([afb1f35](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/afb1f35e2bfbd7ab15b46d850acabdc136d6e446))
* **ui:** tópicos realtime únicos por mount, embed salespeople e guard recommended_actions ([#332](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/332)) ([98ce4dd](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/98ce4dd183ce2c1dcb2bc0241fb1fd1211133678))

## 2026-09-03 — Auditoria 20 dimensões: Quick Wins + Sprint 1 (PR #90)

### 🔒 Segurança
- Repositório tornado privado (expunha código completo + PII de funcionários) e flag de template removida; ruleset `main-protection` ativo (PR obrigatório + checks required + sem force-push); Dependabot security updates ligado
- `twilio-call-status` e `twilio-call-twiml` agora verificam `X-Twilio-Signature` (token do tenant e/ou `TWILIO_AUTH_TOKEN`, fail-closed) — o twiml era um oráculo público de telefone de agente via `?owner_id`
- Wrapper `withRequestId` deixou de vazar `err.message` no corpo das respostas 500 (170 functions); `ranking-api`, `report-embed-public`, `twilio-click-to-call` e `calculate-deal-health` com erros opacos + detalhe só no log estruturado
- CORS: 132 functions migradas do `corsHeaders` estático (`*`) para `getCorsHeaders(req)` — allowlist SEC-07 ativa ao configurar `ALLOWED_ORIGINS` (sem a env, comportamento inalterado)
- `twilio-click-to-call`: normalização E.164 (BR) do destino + rate limit 10/min; rate limit também em `ranking-api` (60/min), `multichannel-status-webhook` (300/min) e webhooks de voz (240/min)
- `ranking-api`: validação de `name`/`email`/`role` no `user/create` e aceite de `Authorization: Bearer <token>`
- Migration `20260902221500`: RLS + REVOKE nas 8 tabelas descobertas sem RLS (inclui `security_events` e `user_permissions_cache`) e `SET search_path` em 3 SECURITY DEFINER regredidas (aplicação no banco pendente)
- QR do TOTP gerado localmente (lib `qrcode`) — o segredo não sai mais para `api.qrserver.com`; `MFASetup` exposto em `/seguranca` (enrollment funcional)
- Token de embed aceito via header `X-Embed-Token` (query mantida por compat)

### ⚡ Performance
- `manualChunks`: preload-helper do Vite fixado em `vendor-core` e subgrafo markdown unificado — `vendor-pdf` (591 KB) e `vendor-markdown` saíram do caminho crítico do entry
- Ícones do mapa self-hosted em `public/map/` (fim de `raw.githubusercontent.com`/cdnjs em runtime)
- Janela explícita (`.limit`) em `useQuotes`, `useTasks` e `useInventoryLevels` (truncamento silencioso do PostgREST)

### 🔧 CI/Tooling
- Pipelines consolidados em `pr-checks.yml` (lint+types+secrets-scan+audit, testes com gate de coverage, `deno lint` das functions, e2e chromium+webkit, notificação de falha); `lint.yml`, `enterprise-quality.yml` e `generate-audit-pdf.yml` removidos
- Falsos verdes eliminados: secrets ausentes em `schedule`/`push`/PR interna agora falham em vez de skipar
- Lockfile único (`package-lock.json`); `bun.lock`/`bun.lockb` removidos; `lint-staged` declarado; `deno.json` migrado ao formato Deno 2 com lint zerado (31 findings corrigidos)
- Dependabot: `ignore` de majors do vitest até o upgrade coordenado
- Limpeza: relatório de qualidade fabricado, `quality-gate.sh`, `.eslintrc.json` legado, `migrate-helper/`, `deployed.txt`/`local.txt`, 5 variantes `remove-demos*` e `bundle-stats/` commitado removidos

### 🧪 Testes
- Novo `webhook-auth_twilio_any_test.ts` (6 casos — assinatura HMAC real, multi-token/multi-URL, GET, tamper); suíte `_shared` 115/115; contrato `withRequestId` 169/169 sem drift

## 2026-05-30 — Audit & Hardening Sprint

### 🔒 Security
- Added Row Level Security (RLS) policies for all tables
- Added missing foreign key indexes to prevent sequential scans
- PWA service worker now uses NetworkFirst for API calls
- Production guards suppress console.log and catch unhandled rejections

### 🐛 Bug Fixes
- **activityService**: `clientId` filter now applied + input validation
- **biService**: Fixed race condition (moved streak query into Promise.all)
- **bi-helpers**: Corrected ABC Pareto classification algorithm
- **LevelBadge**: Fixed LevelUpNotification showing wrong title/emoji
- **use-toast**: Fixed useEffect dependency causing listener churn
- **AudioContext**: Memoized context value to prevent unnecessary re-renders
- **AuthContext**: Wrapped callbacks in `useCallback` for stability
- **button / ripple-button**: Fixed haptic feedback lost in `asChild` mode
- **alert**: Fixed forwardRef element type mismatch
- **breadcrumb**: Fixed typo in BreadcrumbEllipsis displayName
- **types/activity**: Replaced hardcoded fields with generic Record<>

### 🧪 Testing
- Implemented real regression tests (was empty stubs)
- Added vitest coverage thresholds (70% lines, 60% branches)
- Playwright configured with retries and parallel workers

### 🛠 Developer Experience
- Added ErrorBoundary component for graceful error handling
- Added useAbortController and useMountedRef hooks
- ESLint now warns on `no-explicit-any` and `no-console`
- tsconfig tightened with `noImplicitAny`, `noUncheckedIndexedAccess`
- commitlint configured with project-specific scopes
- Lighthouse CI thresholds made realistic
- Added style guide, a11y checklist, and component guidelines
- Updated README with full setup instructions

### ⚡ Performance
- RLS policies and FK indexes added for database performance
- Context memoization prevents unnecessary re-renders
- Code splitting via manual chunks in vite config
- PWA runtime caching configured for Supabase API
