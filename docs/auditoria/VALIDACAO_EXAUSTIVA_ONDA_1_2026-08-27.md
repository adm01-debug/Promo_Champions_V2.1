# Validação exaustiva — onda 1

Data: 27/08/2026
Escopo: revalidação independente do commit `bb484782e`, somente leitura, no worktree do próprio commit. Foram coordenadas cinco frentes especializadas: aplicação, Edge Functions, banco/migrations, segurança/RLS e E2E/acessibilidade. Não houve DDL, DML, deploy, chamada mutável remota ou edição de código durante a validação.

## Conclusão

O commit corrigiu os problemas declarados de acessibilidade e isolamento de Playwright, mas não deve receber aceite pleno. Há uma falha de renderização em preview de produção que deixa `/auth` com `#root` vazio; por isso o axe público não é evidência funcional conclusiva e o E2E de recuperação não consegue alcançar o modal. Permanecem também riscos de idempotência, RLS e SSRF já registrados na onda anterior.

## Matriz de evidências

| Frente | Execução | Resultado |
| --- | --- | --- |
| Aplicação | `typecheck`, lint, build, 10 testes Vitest focais e coleta de 5 specs de autenticação | Aprovado; build preserva avisos de chunks circulares e importação mista de `AbcPieChart` |
| Edge Functions | 52 contratos críticos, bundle de 8 fluxos e simulações de replay/correlação | 52 aprovados e 1 guard-rail falho; 8/8 bundles críticos aprovados |
| Bundle Edge integral | 170 funções | 122 aprovadas; 14 falhas de import e 34 somente de tipo, sem atribuição ao commit |
| Banco/migrations | contratos de leaderboard e reatribuição; inspeção de policies, locks e índices | contratos aprovados; replay de banco limpo continua bloqueado por histórico de migrations |
| Segurança/RLS | 33 contratos de autenticação/webhooks, `deno check`, CORS e fuzzing de request ID | controles recentes aprovados; riscos residuais listados abaixo |
| E2E/a11y | preview dedicado, axe público e reset com `PLAYWRIGHT_BASE_URL` | 2/2 rotas públicas passaram formalmente, porém resultado inconclusivo por DOM raiz vazio; 8 rotas autenticadas puladas sem sessão |

## Correções confirmadas no commit

- `AuthFormCard` usa contraste `text-white/60` no divisor e nome acessível alternável para o botão de senha.
- `PLAYWRIGHT_BASE_URL` substitui a URL fixa quando configurada, preservando fallback local.
- O teste de recuperação passou a refletir o fechamento do modal após a resposta bem-sucedida do hook.
- `migrate-helper` está contido com 410 e não lê/devolve variáveis de ambiente.
- WebAuthn permanece intencionalmente indisponível com 503 até que a validação criptográfica seja reimplementada.
- `dispatch-webhook` valida JWT e papel administrativo antes do uso de `service_role`.
- A roleta usa autenticação, bloqueio de linha, idempotência por requisição e bloqueio de escrita direta.

## Simulações e gaps relevantes

### P0 — preview de produção com tela branca

O preview dedicado, construído com variáveis públicas fictícias para impedir acesso remoto, respondeu HTTP mas renderizou `/auth` com `#root` vazio. O axe atual engole falha do seletor-âncora e, por isso, pode aprovar DOM vazio. O fluxo E2E de reset comprovou o uso da porta isolada, mas falhou antes de abrir o modal pelo mesmo motivo. A hipótese é erro suprimido no bootstrap de `main.tsx`; ela ainda exige diagnóstico com captura de erro/fallback antes de qualquer correção.

### P1 — notificações e idempotência

- `campaign-health-alert` insere diretamente em `notifications`, contornando o guard-rail de particionamento/validação; o teste correspondente falha. `detect-client-churn-alerts` tem a mesma violação preexistente.
- Alertas de campanha fazem leitura de cooldown seguida de inserção, com índice não único. Duas execuções concorrentes podem gravar duplicatas.
- `inbound-email-webhook` não tem unicidade persistente para `(provider, message_id)` e persiste sequencialmente. Retry após falha parcial pode repetir evento, opt-out e pausa de cadência.

### P1 — RLS do portfólio

A migration recente remove a policy de INSERT de `client_portfolio`, mas preserva `Users can update own client_portfolio`. Um vendedor ainda pode atualizar diretamente sua carteira por PostgREST, fora da RPC, auditoria e controle de concorrência. Qualquer ajuste requer nova migration/policy e autorização explícita para alterar o banco.

### P1 — histórico de migrations

O replay local continua bloqueado por versões duplicadas (incluindo `20250102`, `20251228`, `20260530` e três séries `20260104`) e por migrations SQL fora do padrão de nome da CLI. Não foi executado reset/start para evitar escrita; não é seguro renomear histórico já aplicado sem plano de compatibilidade.

### P2 — riscos residuais

- Rate limit considera `Bearer ey...` como autenticado sem validar JWT e depende de cabeçalhos de IP encaminhados pela plataforma.
- `dispatch-webhook` não tem allowlist de hosts nem bloqueio explícito de faixas privadas/link-local; administradores podem configurar destino indevido.
- Não há cobertura de componente para `AuthFormCard`/campo de senha, nem integração de banco para roleta, roteamento e portfólio sob concorrência/RLS.
- O formatador ainda acusa `src/components/ui/password-input.tsx`; sem comparação de histórico nesta frente, a origem é indeterminada.

## Limites e reconciliação de escopo

Dois agentes receberam inicialmente a raiz `main`, que não continha o commit em validação. Seus alertas sobre WebAuthn funcional, migrate-helper ativo e ausência das correções foram descartados como evidência do commit e a análise foi repetida explicitamente no worktree `chat-h774001`.

O arquivo não rastreado `deno.lock` foi encontrado ao final e foi preservado; não foi classificado nem removido nesta validação.

## Próxima sequência segura

1. Diagnosticar a tela branca de preview com captura de exceção e fallback de bootstrap; só depois tornar o axe estrito ao selector-âncora e repetir E2E.
2. Corrigir o inserter de notificações em `campaign-health-alert` e adicionar contrato para lote inválido.
3. Submeter para autorização explícita a criação de idempotência persistente de e-mails/alertas e a revisão da policy de `client_portfolio`.
4. Elaborar plano de normalização de migrations em banco descartável, sem reescrever versões já aplicadas.
5. Adicionar testes de concorrência, retries e RLS para roleta, roteamento, portfólio e e-mails inbound.
