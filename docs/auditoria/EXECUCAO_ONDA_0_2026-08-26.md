# Execução — Onda 0 de estabilização

Data: 2026-08-26
Escopo: correções locais, verificáveis e reversíveis no repositório. Nenhuma migration, alteração de dados, deploy de Edge Function, alteração de segredo ou limpeza de arquivo foi aplicada em banco remoto.

## Decisão de segurança

Esta onda começa pela simulação de cenários de falha e só executa mudanças cujo contrato pôde ser demonstrado pelo código, pelos tipos ou por testes locais. Onde o catálogo do banco destino não pôde ser lido, a mudança foi preparada e marcada como bloqueada para aplicação, nunca inferida.

O detalhamento de cenários está em [SIMULACAO_CENARIOS_ONDA_0_2026-08-26.md](SIMULACAO_CENARIOS_ONDA_0_2026-08-26.md), o inventário de origem em [CATALOGO_BANCO_ORIGEM_2026-08-26.md](CATALOGO_BANCO_ORIGEM_2026-08-26.md) e a reconciliação de migrations em [RECONCILIACAO_MIGRATIONS_2026-08-26.md](RECONCILIACAO_MIGRATIONS_2026-08-26.md).

## Contenções efetivamente implementadas

1. Segredos administrativos deixaram de ser aceitos por scripts sem confirmação explícita de escrita; a URL administrativa remota agora exige HTTPS, exceto loopback local.
2. A varredura de segredo versionado passou a fazer parte dos validadores do repositório. Isso não substitui a rotação dos segredos que já possam ter sido expostos em histórico.
3. Os endpoints que antes podiam declarar sucesso sem confirmação passaram a falhar de forma explícita: WebAuthn está desabilitado até existir backend canônico e `migrate-helper` não executa sem pré-requisitos reais.
4. `send-transactional-email` valida autoria, tamanho e conteúdo; chamadas diretas só podem ser comerciais (`outreach`), passam por supressão/descadastro e limite de taxa. Fluxos internos autenticados mantêm o caso transacional.
5. Jobs administrativos de e-mail e alerta exigem service role interna ou papel administrativo real. O cron legado que envia token anônimo não deve ser reenviado antes da troca de credencial aprovada.
6. CORS passou a comparar origens com semântica segura para curingas, sem transformar padrões em expressões regulares inválidas. As cinco rotas críticas e o retorno inesperado do middleware agora calculam os headers pela origem da requisição.
7. Webhooks de entrada passaram a limitar corpo antes da verificação criptográfica, validar lote inteiro antes de escrever e não confundir entrega com resposta. O webhook multicanal só avança estados de forma monotônica.
8. A sincronização de cotações libera a reserva de deduplicação quando a operação posterior falha, reduzindo bloqueios falsos de repetição. A janela entre provedor e persistência continua registrada para solução transacional de banco.
9. O runner de sequências usa lease condicional por inscrição/passo, só avança depois de uma entrega ou tarefa confirmada e reagenda falhas. Uma confirmação já persistida permite recuperação sem reenvio na queda posterior à persistência.
10. O runner também resolve `contact` por `account_contacts`, evitando que esse tipo de inscrição fique sem telefone/e-mail por omissão; a chave de contexto inclui o tipo para impedir colisão entre tabelas.
11. O retry de e-mails filtra itens vencidos antes do limite do lote, removendo a fome causada por itens agendados para o futuro.
12. O roteamento de carteira e a roleta receberam migrations preparadas com checagem de ownership, concorrência e idempotência; elas não foram aplicadas.
13. A migration de ranking foi revisada para não permitir remoção implícita de dependências de views nem perda de grant público de espectador; sua aplicação continua dependente da reconciliação do banco destino.
14. A interface da roleta deixou de afirmar que o benefício já foi creditado: enquanto o efeito de domínio não existe, ela informa somente que o resultado foi registrado.

## O que foi deliberadamente preservado

- Não houve `DROP`, `DELETE`, renomeação ou edição remota de tabela, coluna, função, view, política, índice, job ou dado.
- Arquivos candidatos a limpeza foram apenas inventariados em [CANDIDATOS_DE_LIMPEZA_2026-08-26.md](CANDIDATOS_DE_LIMPEZA_2026-08-26.md); nenhum foi incluído na mudança sem autorização.
- Não foram alterados os 593 arquivos de migration existentes para "consertar" o histórico, pois há divergência material entre o repositório e a origem.
- O comportamento de clientes historicamente associados a carteira foi preservado. A regra de reativação após redistribuição de carteira inativa requer decisão de negócio explícita.

## Evidências de validação local

Executadas durante a onda (a execução final de fechamento é registrada no commit/PR):

```text
npm run typecheck                         # aprovado
npm run lint                              # aprovado
npm test                                  # 50 arquivos aprovados, 1 ignorado; 458 testes aprovados, 2 ignorados
npm run build                             # aprovado; avisos preexistentes de chunk circular/dynamic import
deno check --no-lock                      # 17 handlers Edge modificados aprovados
deno test direcionado                     # 44 contratos críticos aprovados; 8 testes de request-id/CORS também aprovados
npx playwright test --list                # 483 testes em 46 arquivos descobertos, não executados
```

Os dois testes ignorados dependem de privilégio de banco e não foram mascarados como sucesso. Testes E2E são apenas listados enquanto `supabase start` não consegue compor o banco local devido às chaves de migration duplicadas descritas na reconciliação.

## Bloqueios e autorizações necessárias para a próxima onda

1. Disponibilizar acesso somente-leitura autenticado ao catálogo do banco destino e confirmar qual dos MCPs aponta para origem e destino.
2. Autorizar, após a comparação objeto a objeto, a aplicação das migrations novas/preparadas e a atualização explícita da credencial dos cron jobs.
3. Definir a regra de negócio para uma carteira que fica `inactive` após reatribuição automática: permanece inativa ou volta a `active`.
4. Definir contrato canônico para idempotência de envio de e-mail/mensagem e para deduplicação persistente de webhooks; sem índice/RPC transacional não existe garantia honesta de exactly-once em queda de processo.
5. Confirmar se `leads` possui uma coluna de e-mail no destino. Até isso, sequência de lead sem destinatário confirmado fica `skipped`, sem ser falsamente marcada como enviada.
6. Autorizar separadamente a rotação dos segredos expostos em histórico e, depois, a remoção controlada de qualquer vestígio histórico.
7. Autorizar a remoção do único registro externo acidental de sonda (`notes = '__probe__'`) somente após a identificação inequívoca do projeto e do registro alvo.
8. Criar, após reconciliação, claim/idempotência persistente para `email-bulk-retry`; duas execuções ainda podem alcançar o mesmo rascunho antes de `sent_at`.
9. Definir o efeito de domínio de cada prêmio de roleta (XP, duração de power-up e badge); o giro persistido não deve ser anunciado como prêmio concedido sem esse contrato.
10. Configurar a allowlist real em `ALLOWED_ORIGINS` no ambiente de deploy; sem esse valor, o fallback compatível de CORS continua permissivo.

## Critério para deploy

Não considerar esta onda "em produção" até: catálogo destino reconciliado, migrations replayáveis em ambiente isolado, credenciais de cron corrigidas, contratos pendentes decididos, testes E2E executados contra ambiente de staging e revisão humana do diff.
