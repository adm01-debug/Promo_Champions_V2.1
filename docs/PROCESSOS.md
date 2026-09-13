# Processos — rituais que sobrevivem a uma pessoa

**Origem:** Etapa 50 do plano de 50 etapas.
**Por quê este documento existe:** o CODEOWNERS deste repositório tem um único
handle em toda regra (`@adm01-debug`). O incidente de cron de 30/08–13/09+
(14+ dias de automação parada) não gerou issue nem post-mortem enquanto foi
descoberto. Sem rituais escritos, tudo depende de uma pessoa lembrar de tudo,
o tempo todo — e o histórico deste projeto (ver `docs/execucao/`,
`docs/auditoria/`) mostra que isso já falhou mais de uma vez.

Cada ritual abaixo tem um gatilho claro e um artefato que prova que aconteceu.
Um ritual sem artefato não aconteceu — é intenção, não processo.

## 1. Post-mortem de incidente

**Gatilho:** qualquer incidente P0 (produção parada ou dado corrompido) ou P1
(degradação visível para usuários).
**Prazo:** rascunho em até 5 dias úteis após a resolução.
**Artefato:** `docs/postmortems/<data>_<slug>.md` com: linha do tempo, impacto
por área/feature, causa-raiz (não "quem", "o quê" — ver `.hermes.md`, regra de
não fabricar sucesso), o que funcionou, o que não funcionou, e uma lista de
ações com dono e (quando aplicável) o número da etapa do plano de 50 etapas
que a rastreia.
**Sem culpados nominais.** O objetivo é encontrar a lacuna de sistema, não a
pessoa que a exercitou primeiro.
**Pendente:** o post-mortem do incidente de cron em si (etapa 11 do plano),
que só pode ser escrito depois que os jobs forem restaurados (etapas 1, 2, 7 —
ainda bloqueadas).

## 2. Revisão de segurança

**Gatilho:** trimestral, ou imediatamente após qualquer achado de severidade
alta/crítica (CVE, alerta do Dependabot, achado de auditoria).
**Artefato:** issue com o checklist abaixo, uma por trimestre, fechada com o
resultado de cada item:

- [ ] Rodar o inventário de banco (etapa 3 do plano — snapshot vivo, quando existir) e comparar RLS/grants/policies com o trimestre anterior
- [ ] `npm audit` e `gh api .../dependabot/alerts` — zero crítico/alto sem plano de correção
- [ ] `gitleaks` no histórico completo (não só HEAD) — zero segredo novo
- [ ] Revisar as 13 edge functions com `verify_jwt=false` — todas continuam autenticando no handler?
- [ ] Revisar CODEOWNERS — ainda é um único handle em tudo?

## 3. SLA de revisão de PR

**Regra:** toda PR recebe uma primeira revisão (aprovação, pedido de mudança,
ou label `hold:<motivo>`) em até 2 dias úteis.
**Enforcement:** label `needs-review` aplicada automaticamente a PRs sem
atividade de revisão após 2 dias úteis (a implementar — ver "Não incluído
nesta etapa" abaixo).

## 4. Triagem semanal de PRs

**Gatilho:** toda segunda-feira, 15 minutos.
**Regra:** zero PR aberta há mais de 14 dias sem uma decisão explícita —
`merge`, `hold:<motivo com prazo>`, ou `close`. Em 13/09/2026 havia 28 PRs
abertas; a mais antiga tinha vindo de 04/09 com conflito de merge não
resolvido (#106).

## 5. Revisão mensal de dependências

**Gatilho:** primeira segunda-feira do mês.
**Regra:** PRs Dependabot de patch/minor são agrupadas e mescladas se o CI
passar. PRs de major version ganham label `needs-e2e` e só são mescladas após
teste manual ou E2E completo (etapa 35 do plano) — nunca só porque o CI de
lint/typecheck passou, já que major bumps de toolchain (ex.: vitest 1→5,
etapa 47) podem quebrar coisas que o CI atual não cobre.

## 6. Revisão mensal de SLOs

**Gatilho:** primeira segunda-feira do mês (mesmo dia da revisão de
dependências).
**Regra:** revisar o budget de erro consumido dos 3 SLOs da etapa 28 do plano
(disponibilidade, frescor de dados derivados, taxa de sucesso do
quote-to-sale) e ajustar alertas se o padrão de uso mudou.
**Pendente:** os 3 SLOs em si dependem de observabilidade externa (Sentry,
uptime — etapas 26/27) que exige criar contas de terceiros, fora do que uma
sessão sem acesso a essas contas pode fazer.

## Releases semânticas

**Não incluído nesta etapa.** O repositório já usa conventional commits
(`commitlint.config.js` valida `type(scope): mensagem` em todo commit) — a
matéria-prima para gerar CHANGELOG e tags automaticamente já existe. Configurar
`release-please` (ou equivalente) para consumir isso e publicar
`vX.Y.Z` + CHANGELOG a cada merge em `main` fica como próximo passo,
deliberadamente fora desta PR: envolve criar um GitHub App/token com permissão
de escrita em releases, uma decisão de infraestrutura que quem tem acesso à
organização GitHub deve fazer, não algo para configurar às cegas.

## Como saber que um ritual está funcionando

Cada ritual tem um artefato datado. Se em 90 dias não existir pelo menos:

- 1 issue de revisão de segurança fechada,
- 1 registro de triagem semanal (ou histórico de PRs sem nenhuma > 14 dias),
- 1 revisão mensal de dependências com PRs major explicitamente decididas,

o ritual não pegou — e este documento deve ser revisado, não repetido.
