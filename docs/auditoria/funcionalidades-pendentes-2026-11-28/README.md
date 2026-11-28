# Funcionalidades planejadas × implementadas — auditoria de 28/11/2026

Esta pasta lista tudo o que a documentação de `docs/` promete e que o sistema não entrega por inteiro. Cada item traz o que os docs afirmam, de onde veio a afirmação, o que falta e a evidência no código ou no banco.

## Base da verificação

- **Código:** `main` no commit `90170947d` (19/11/2026).
- **Banco:** snapshot do banco de produção `usyxfpqlsspldubptrdl` da branch `contexto`, coletado em 20/11/2026.
- **Deploy:** só as 100 edge functions da allowlist em `.github/workflows/deploy.yml` rodam em produção.
- **Critério de pronto:** o da seção 3 do `AGENTS.md`, ligado de ponta a ponta, sem mock, stub, dado fixo ou ação que só mostra aviso.

## Método

1. Leitura integral dos 166 arquivos `.md` de `docs/`, em 26 grupos, com extração de cada promessa verificável: 11.337 afirmações.
2. Agrupamento das afirmações por artefato (tela, edge function, tabela, cron e afins): 6302 itens únicos.
3. Pré-checagem automática de existência e ligação contra o banco real e os índices de código, para os itens com artefato nomeável.
4. Verificação por agente, com leitura do código, nos itens que exigem julgamento (telas, botões, integrações, processos).
5. Contestação por um agente cético instruído a refutar cada veredito com evidência `arquivo:linha`.
6. Julgamento das disputas por um agente juiz, que releu as evidências dos dois lados.

## Números

| Veredito              |    Itens |
| --------------------- | -------: |
| Não implementado      |      821 |
| Parcial               |     1460 |
| Não verificável       |       91 |
| Não aplicável         |      184 |
| Removido de propósito |      189 |
| Implementado          |     3557 |
| **Total**             | **6302** |

| Controle de qualidade           | Itens |
| ------------------------------- | ----: |
| Contestados por cético          |  2524 |
| Decididos por juiz após disputa |   243 |
| Em disputa sem juiz             |   443 |
| Sem contestação concluída       |  3778 |
| Sem veredito                    |     0 |

## Por domínio

| Domínio                                        | Não impl. | Parcial | Não verif. | Implementado | Arquivo                                                        |
| ---------------------------------------------- | --------: | ------: | ---------: | -----------: | -------------------------------------------------------------- |
| CRM core (clientes, contas, portfólio, agenda) |        35 |      40 |          1 |          196 | [01-crm-core.md](01-crm-core.md)                               |
| Pipeline, leads, scoring e roteamento          |        42 |      37 |          0 |          118 | [02-pipeline-leads.md](02-pipeline-leads.md)                   |
| SDR, cadências, sequências e e-mail            |        37 |      70 |          1 |          264 | [03-sdr-cadencias-email.md](03-sdr-cadencias-email.md)         |
| Vendas, cotações e pedidos                     |        49 |      41 |          0 |          216 | [04-vendas-cotacoes-pedidos.md](04-vendas-cotacoes-pedidos.md) |
| WhatsApp, multicanal e voz                     |        15 |      43 |          2 |           55 | [05-whatsapp-multicanal-voz.md](05-whatsapp-multicanal-voz.md) |
| IA, coaching e assistente                      |        12 |      57 |          5 |          230 | [06-ia-coaching-assistente.md](06-ia-coaching-assistente.md)   |
| Forecast, BI e relatórios                      |        30 |      87 |          0 |          347 | [07-forecast-bi-relatorios.md](07-forecast-bi-relatorios.md)   |
| Gamificação e Race Arena                       |        55 |      65 |          0 |          359 | [08-gamificacao-race.md](08-gamificacao-race.md)               |
| Win-Loss e inteligência competitiva            |         4 |      35 |          0 |          106 | [09-winloss-competitivo.md](09-winloss-competitivo.md)         |
| Customer Success e pós-venda                   |         7 |      35 |          1 |           95 | [10-customer-success.md](10-customer-success.md)               |
| Integrações e plataforma                       |        33 |      71 |         14 |          119 | [11-integracoes-plataforma.md](11-integracoes-plataforma.md)   |
| Segurança, LGPD e administração                |       117 |     167 |         25 |          390 | [12-seguranca-lgpd-admin.md](12-seguranca-lgpd-admin.md)       |
| Dados e banco                                  |       106 |     142 |          3 |          304 | [13-dados-banco.md](13-dados-banco.md)                         |
| Infra, CI, testes e deploy                     |       185 |     446 |         36 |          495 | [14-infra-ci-testes-deploy.md](14-infra-ci-testes-deploy.md)   |
| Frontend transversal e UX                      |        75 |     118 |          2 |          259 | [15-frontend-ux-transversal.md](15-frontend-ux-transversal.md) |
| Outros                                         |        19 |       6 |          1 |            4 | [16-outros.md](16-outros.md)                                   |

## Legenda

- **Não implementado:** nenhum artefato correspondente no código nem no banco real.
- **Parcial:** o artefato existe, mas falta o fio que o liga de ponta a ponta. Exemplos: tela sem rota ou sem menu, function sem chamador ou fora da allowlist, mock ou dado fixo, tabela sem RLS, só backend ou só tela.
- **Não verificável:** depende de acesso que a auditoria não tinha, como painel externo, segredo ou serviço de terceiro.
- **Não aplicável:** a frase do doc não descreve um artefato verificável (métrica, opinião, snapshot histórico). Fica fora das listas.

O arquivo [itens.csv](itens.csv) traz todos os 6302 itens com veredito, para filtrar em planilha.
