# As 3 telas que a reescrita de `main` descartou — 17/11/2026

Resposta medida para a pergunta "a reescrita órfã de 13/11 perdeu funcionalidade?".
Vale para `ABCMatrixShift`, `Client360PredictiveCards` e `ABCActionableAutomations`.

## Resposta curta

**Não perdeu funcionalidade: perdeu fabricação.** As três telas existiam e eram
montadas na árvore anterior, mas duas delas eram alimentadas por arrays
**hardcoded** no hook, com nomes de cliente que não existem no banco e percentuais
inventados. Duas foram recuperadas e refeitas sobre dado real: `ABCActionableAutomations`
(PR #545) e `ABCMatrixShift` (PR #568). A terceira, `Client360PredictiveCards`, foi
substituída na `main` por `Client360HealthNbaSection`, que faz o mesmo sobre dado real.

## Como os arquivos foram encontrados

`main` hoje tem 7 branches. Comparando cada uma por conteúdo:

```
branch                         caminhos que main não tem
automation/inventario-estado   2
contexto                       1154  (todos docs/contexto/, gerados por bot)
automation/types-sync          0     (contribui 1 arquivo: types.ts, gerado)
computador_local               0     (contribui 0 — é commit de main)
release-please--...            0     (contribui 4: CHANGELOG, package.json, lock, manifest)
claude/chore-dump-schema-...   0     (a PR #548)
```

Os **2 caminhos** exclusivos de `automation/inventario-estado`:

```
src/components/analytics/ABCMatrixShift.tsx
src/components/clients/Client360PredictiveCards.tsx
```

Não são trabalho novo de um agente numa branch de feature: aparecem em **26 tags**
(`snapshot/261117/automation-inventario-estado` + 25 `archive/`), o que os
identifica como conteúdo da **main pré-reescrita** que a reescrita de 13/11 não
levou adiante.

## Eram montadas? Sim

Na árvore anterior (`snapshot/261117/automation-inventario-estado`):

- `src/components/analytics/ABCAnalysis.tsx:197` → `<ABCMatrixShift shifts={data?.matrixShifts || []} />`
- `src/components/analytics/ABCAnalysis.tsx:215` → `<ABCActionableAutomations automations={data?.automations || []} />`
- `src/components/clients/Client360View.tsx` → importava `Client360PredictiveCards`

Em `main` hoje `ABCMatrixShift` **voltou a ser montado** (PR #568, 17/11) em
`src/components/analytics/ABCAnalysis.tsx`, via `ABCMatrixShiftSection`. De
`Client360PredictiveCards` não há referência em código — só menções em documentação.

## O que alimentava essas montagens

`src/hooks/bi/useABCAnalysis.ts` da árvore anterior (216 linhas, hoje 158):

```ts
const matrixShifts: MatrixShift[] = [
  {
    name: 'Cliente VIP S/A',
    from: 'B',
    to: 'A',
    change: 25,
    reason: 'Aumento de recorrência',
  },
  {
    name: 'Distribuidora Beta',
    from: 'A',
    to: 'B',
    change: -12,
    reason: 'Redução de pedidos semanais',
  },
  {
    name: 'Tech Solutions',
    from: 'C',
    to: 'B',
    change: 40,
    reason: 'Novo contrato assinado',
  },
];

const automations: Automation[] = [
  { title: 'Escudo de Retenção Classe A', impact: '+15% Retenção' },
  { title: 'Upgrade Velocity B->A', impact: '+22% Receita' },
  { title: 'Reativação Neural', impact: '+8% Recuperação' },
];
```

Nenhum desses três clientes existe em `public.clients`. Os percentuais (25, -12,
40, +15%, +22%, +8%) não saem de nenhuma consulta. O bloco de insights acima
afirmava "85% de chance de aceitar upgrade para Pacote Elite" — igualmente fixo.

Ou seja: a tela mostrava ao dono nomes de cliente inventados e números inventados
como se fossem leitura do sistema dele.

## Veredicto por arquivo

### `ABCActionableAutomations` — recuperada e refeita (PR #545)

A única das três reconstruída sobre dado real. O `impact: '+15% Retenção'` fixo
deu lugar a `buildAbcAutomations()`, função pura que avalia a receita que
`useABCAnalysis` devolve. Verificada no bundle servido em produção
(`ABCAnalysis-BUXr9qdd.js`) e contra o banco: classes A/B/C com 9/22/14 clientes
e 79,3%/15,7%/5,0% da receita; 3 cards renderizam e o de dependência de produto é
corretamente suprimido (líder em 13,2%, abaixo do limiar de 50%).

A PR #547 depois removeu dela uma afirmação que **eu** havia embarcado
("subir de B para A rende mais que buscar cliente novo") e que o dado não
sustentava — achada por Devin e Codex.

### `ABCMatrixShift` — remontado sobre dado real (PR #568, 17/11)

Componente de apresentação **limpo**: 92 linhas, recebe `shifts: MatrixShift[]`
por prop, sem número fixo e sem fonte de dado própria. O problema nunca foi o
componente: era o hook que o alimentava.

**Correção do veredicto abaixo.** A conclusão original — "não há dado para
calcular deslocamento de classe" — vinha de ancorar a janela em `now()`. A venda
ganha mais recente da base é de 2026-10-06, então qualquer janela contada a
partir de hoje chega vazia. Ancorando as duas janelas na **venda mais recente da
própria base** (`ABC_WINDOW_DAYS = 365` em `src/hooks/bi/useABCAnalysis.ts`), o
de-para de classe existe e o painel renderiza. O hook passou a devolver
`clientsRecentWindow`, `clientsPreviousWindow` e `windowLabel`; o cálculo puro
está em `buildAbcMatrixShifts()` com 7 testes em
`src/components/analytics/ABCMatrixShift.test.ts`.

A medição que levou ao veredicto original segue válida como retrato da base:

```
  1 compra(s):  41 cliente(s)  max_produtos=1  2026-08-02 .. 2026-08-29
506 compra(s):   1 cliente(s)  max_produtos=7  2024-01-02 .. 2026-08-09
```

41 dos 42 clientes só aparecem em agosto/2026 — mas isso não impede a
comparação, porque a janela é ancorada no dado e não no calendário de hoje.
O componente foi reaproveitado **como estava**, sem uma linha de mudança: o que
mudou foi o hook, que agora calcula em vez de inventar.

### `Client360PredictiveCards` — preservada, não remontada

116 linhas, **inteiramente hardcoded**, e não é só o dado:

- `"Linha Industrial X"` — produto que não existe
- `"92% Probabilidade"`, `"Próximos 12 dias"` — números fixos no JSX
- botões cujo único efeito é `toast.success('Oportunidade adicionada ao pipeline!')`
  e `toast.success('Lembrete agendado!')` — **sem handler e sem persistência**
- um card intitulado `"10/10 Quality Assurance"` listando "Glassmorphism UI",
  "Neural Predictions" e "Glass Micro-interactions" como "Active": o componente
  se elogiando na tela do usuário

Diferente do `ABCMatrixShift`, aqui não há camada aproveitável: a fabricação está
no próprio componente, não no hook. Remontá-lo seria colocar de volta botões que
mentem para quem clica.

**Já coberto na `main` por outro componente.** A função de negócio que esta tela
prometia — prever a próxima compra, sugerir a ação e agendar o follow-up — existe
e grava no banco: `src/components/clients/Client360HealthNbaSection.tsx`, montado
em `src/components/clients/Client360View.tsx:88`. Ele lê
`data.predictedNextPurchaseDays`, `data.churnRisk` e `data.nba` do
`useClient360`, e o botão chama `createTask.mutate()`, criando tarefa real em
`public.tasks` com o vendedor resolvido por `get_current_salesperson_id` — no
lugar do `toast.success('Lembrete agendado!')` que não persistia nada.

Ou seja: o arquivo descartado não levou função nenhuma com ele. Remontá-lo
exigiria, além de dado de recompra que não existe, uma reescrita do componente
(o atual não aceita dado por prop) — e duplicaria o que já funciona.

## Nada foi perdido

Os dois arquivos não remontados seguem alcançáveis:

```
snapshot/261117/automation-inventario-estado  ->  660347cb5   (ponta exata da branch)
+ 25 tags archive/ da main pré-reescrita
```

Recuperar qualquer um deles é um comando:

```bash
git show snapshot/261117/automation-inventario-estado:src/components/analytics/ABCMatrixShift.tsx
```

Eles **não** foram trazidos para `main` como arquivo solto de propósito:
componente não montado é código morto, e AGENTS.md §3 define funcionalidade pronta
como integrada ponta a ponta. Ficam preservados na tag até existir dado que os
justifique.

## Correção de um alarme meu

Durante esta sessão eu afirmei que o workflow `inventario-estado-semanal.yml`
(segunda, 10:23 UTC) apagaria os dois arquivos na próxima execução, por resetar a
branch a partir de `main`. A parte do workflow está certa, mas a conclusão estava
**errada**: as 26 tags já preservavam o conteúdo antes disso. Não havia risco de
perda.
