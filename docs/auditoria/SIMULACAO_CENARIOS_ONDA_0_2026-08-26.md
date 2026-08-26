# Simulação de cenários — Onda 0

**Data:** 26 de agosto de 2026
**Escopo:** código, migrations, Edge Functions e catálogos acessíveis por leitura.
**Alterações remotas executadas:** nenhuma planejada. Durante a validação de um
script legado, uma única atividade marcada como `__probe__` foi inserida por
engano antes da interrupção do processo. Ela não foi removida: exclusão exige
autorização explícita e identificação confirmada do projeto/registro.

## Objetivo e limites

Esta etapa antecede qualquer correção que possa afetar dados ou integrações. Foram simulados, por inspeção estrutural e execução local não destrutiva, fluxos de concorrência, autorização, exposição de segredos, falha parcial, divergência de schema e regressão de interface.

O catálogo completo do banco de origem pôde ser consultado em modo somente leitura. O conector disponível para o destino não expõe catálogo SQL de leitura; portanto, nenhuma migration, política, função, trigger, job ou dado do destino será aplicado, apagado ou modificado nesta onda.

## Premissas que precisam ser confirmadas antes de qualquer deploy de banco

1. O repositório aponta `supabase/config.toml` para `rapjswienfhkobhlamxb`, enquanto o diretório temporário local aponta para `usyxfpqlsspldubptrdl`.
2. O ledger do banco de origem tem mais migrations aplicadas do que as versionadas no repositório. Reaplicar o diretório atual sem reconciliação pode produzir perda funcional ou falha de deploy.
3. Uma tabela vazia não é lixo: sem um mapa de domínio, uso por função/trigger e owner, ela será tratada como estrutura potencialmente necessária.

## Cenários simulados e resultado

| ID | Cenário | Resultado observado | Severidade | Ação segura |
| --- | --- | --- | --- | --- |
| S-01 | Duas abas giram a roleta ao mesmo tempo | escolha do prêmio e débito são feitos no cliente, em duas operações independentes | P0 | migrar para RPC transacional com bloqueio e idempotência |
| S-02 | Cliente adulterado escolhe prêmio maior | o navegador envia tipo e valor do prêmio diretamente ao banco | P0 | servidor passa a sortear e validar o prêmio |
| S-03 | Falha entre registrar prêmio e reduzir saldo | prêmio pode ser criado sem consumir giro | P0 | operação única no banco |
| S-04 | Acesso à Edge Function de migração | função possuía chave embutida, CORS amplo e resposta de credenciais | P0 | retirar do deploy e falhar de forma segura |
| S-05 | Segredo versionado em scripts operacionais | scripts contêm chaves privilegiadas literais | P0 | exigir variáveis de ambiente e rotacionar chaves expostas |
| S-06 | Login por passkey forjado | WebAuthn apenas confere presença de campos/challenge; não verifica assinatura, origem, RP ID, flags ou contador | P0 | desabilitar até implementação criptográfica completa |
| S-07 | Reenvio de callback/webhook | há endpoints com autenticação de origem insuficiente e escrita com service role | P0 | validar assinatura, timestamp, deduplicação e RBAC antes do deploy |
| S-08 | BOLA em envio de orçamento | fluxo de envio não comprova ownership completo do recurso | P0 | validar proprietário/tenant no servidor |
| S-09 | Usuário injeta conversão arbitrária | função de conversão aceita identificadores e payload sem escopo suficiente | P0 | restringir por função de domínio e contexto autenticado |
| S-10 | Rastreamento de pedidos sem dados reais | hook fabrica registros para completar a tela | P0 | mostrar somente origem real e estado vazio honesto |
| S-11 | Assinatura digital aparentemente concluída | hook altera status sem provedor, arquivo, callback ou trilha verificável | P0 | impedir sucesso enganoso até haver integração real |
| S-12 | Alta cardinalidade em `.in()` | quatro consultas excedem o limite operacional da API em lotes grandes | P1 | usar `chunkedIn` e cobrir com teste |
| S-13 | Migrations repetidas | uso de `CREATE POLICY IF NOT EXISTS`, sintaxe inválida no PostgreSQL | P1 | corrigir antes de qualquer replay |
| S-14 | RLS muito permissivo | políticas históricas permitem escrita direta em objetos de gamificação | P0 | revogar escrita direta quando a RPC estiver validada |
| S-15 | Job de manutenção | job usa `VACUUM` em contexto transacional | P1 | mover para mecanismo fora de transação |
| S-16 | Storage do destino incompleto | código referencia buckets ausentes no snapshot de destino | P1 | confirmar se o destino é canônico antes de criar buckets |
| S-17 | Funções `security definer` | snapshot contém funções expostas ou sem `search_path` fixo | P0 | inventariar e testar em staging antes de alterar privilégios |
| S-18 | Dashboard com métricas artificiais | fontes de analytics misturam amostras e dados reais | P1 | separar modo demo do modo produção |
| S-19 | Roteamento de leads concorrente | implementações client-side/localStorage não são transacionais | P0 | consolidar em uma RPC com lock e auditoria |
| S-20 | Fluxo E2E sem credenciais | parte dos testes pula ou cai quando o ambiente Supabase não está definido | P1 | isolar teste unitário de integração e declarar pré-requisitos |
| S-21 | Limpeza de repositório | há artefatos potencialmente gerados, mas nenhum candidato foi removido | Controle | apresentar inventário e pedir autorização antes de excluir |
| S-22 | Replay local do schema | `supabase start` falhou no início: três migrations usam o mesmo prefixo `20250102`; há ainda nomes fora do padrão aceito pela CLI | P0 | reconciliar o ledger e renomear somente após comparar origem/destino e histórico aplicado |
| S-23 | Controle de execução administrativa | um script legado com chave literal conseguiu gravar um registro de probe antes da contenção | P0 | remover credenciais versionadas, exigir variáveis e confirmação explícita; rotacionar a chave exposta |
| S-24 | CORS de rotas críticas | cinco rotas de envio/agendamento ainda retornavam `Access-Control-Allow-Origin: *`, ignorando a allowlist dinâmica | P1 | calcular CORS por requisição nas rotas críticas e testar a política compartilhada |
| S-25 | Sequência para contato de conta | o schema aceita `contact`, mas o runner só buscava cliente e lead; a sequência era reprogramada sem destinatário | P1 | carregar `account_contacts` e indexar contexto por tipo + identificador |
| S-26 | Fila de retry de e-mail | os 500 primeiros rascunhos podiam estar agendados para o futuro e impedir o processamento dos já vencidos | P1 | filtrar por `next_retry_at` antes de ordenar e limitar; manter a guarda de retry por corrida |
| S-27 | Retry de e-mail simultâneo | duas execuções podem enfileirar o mesmo rascunho antes de marcar `sent_at` | P0 | não publicar o job como exatamente-uma-vez sem claim/idempotência transacional autorizada |
| S-28 | Efeito do prêmio da roleta | a RPC registra o giro, mas não há contrato que credite XP, power-up ou badge exibidos pela interface | P1 | definir e autorizar o mapeamento de prêmio para efeitos de domínio antes de alegar concessão |
| S-29 | Migration de leaderboard | `DROP VIEW ... CASCADE` poderia remover dependências e perder o grant público da tela de espectador | P1 | usar `CREATE OR REPLACE`, preservar o contrato da view e conceder o grant explicitamente |

O inventário detalhado dessa divergência, incluindo as seis colisões de prefixo,
as seis migrations sem prefixo reconhecível e a diferença de 2.351 versões
entre origem e repositório, está em
[`RECONCILIACAO_MIGRATIONS_2026-08-26.md`](./RECONCILIACAO_MIGRATIONS_2026-08-26.md).

## Barreiras obrigatórias de saída da onda

1. Nenhum segredo privilegiado permanece no código versionado; as chaves já expostas precisam ser rotacionadas fora do repositório.
2. A Edge Function de migração e o login WebAuthn inseguro não podem ser publicados em sua forma atual.
3. A roleta só pode voltar a operar depois da migration transacional ser validada em ambiente de staging com concorrência.
4. Migrations só podem ser aplicadas após confirmar, por catálogo de leitura, qual projeto é origem, qual é destino e qual ledger é canônico. O cruzamento atual encontrou somente 21 nomes coincidentes entre 358 referências literais do código e 587 relações do alegado origem.
5. Exclusões de tabelas, colunas, policies, arquivos ou dados continuam dependentes de autorização explícita do responsável.
6. O replay local precisa passar sem migrations duplicadas ou ignoradas antes de ser usado como evidência de deploy.
7. O registro `__probe__` só pode ser removido após confirmação explícita do responsável sobre o projeto e o escopo da exclusão.
8. O retry em massa de e-mail não pode receber SLA de exatamente-uma-vez até existir claim/idempotência persistente aprovada para o schema canônico.
9. A roleta não pode afirmar que concedeu XP, badge ou power-up enquanto o efeito de domínio não for mapeado e testado.

## Evidência de validação local

Uma instância PostgreSQL 17 efêmera foi criada apenas para validar a migration
da roleta com tabelas e funções mínimas. A migration compilou após os papéis
Supabase de teste serem declarados. O cenário de duas transações com a mesma
chave idempotente foi executado com uma retenção deliberada de lock: a segunda
chamada aguardou aproximadamente 1,9 s, retornou o mesmo prêmio, deixou o
saldo em zero e gerou somente uma linha de histórico. Nenhum banco remoto foi
usado nessa validação.

## Próxima onda

A onda seguinte corrige contenções locais verificáveis: remoção de segredos do código, desativação segura de superfícies críticas, correção de consultas paginadas e eliminação de dados fictícios. Toda mudança de schema será entregue como migration preparada, acompanhada de teste e sem aplicação remota enquanto as barreiras acima não forem satisfeitas.
