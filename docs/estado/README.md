# Auditoria de Estado — Promo Champions v2.1

Medição: **2026-08-16**. Banco de produção acessado somente para leitura; nada foi alterado.

**Comece por [`ESTADO_ATUAL.md`](ESTADO_ATUAL.md)** — documento executivo, legível em 10 minutos.

## Documentos de detalhe

| Lote | Escopo | Unidades avaliadas |
|---|---|---|
| [01](01_FRONTEND_ROTAS.md) | Rotas e páginas | 174 rotas |
| [02](02_DOMINIO_CRM_PIPELINE.md) | CRM, pipeline, vendas, pedidos | 60 |
| [03](03_DOMINIO_SDR_CADENCIAS.md) | SDR, cadências, multicanal | 50 |
| [04](04_DOMINIO_ANALYTICS_BI.md) | Analytics, BI, forecast | 106 |
| [05](05_DOMINIO_GAMIFICACAO_RACE.md) | Gamificação e Race Arena | 38 |
| [06](06_DOMINIO_IA_COACHING.md) | IA, coaching, busca semântica | 42 |
| [07](07_DOMINIO_WINLOSS_COMPETITIVE.md) | Win/Loss, competitivo, CS | 86 |
| [08](08_ADMIN_SEGURANCA.md) | Admin, segurança, RBAC | 52 |
| [09](09_HOOKS_SERVICES.md) | Hooks, services, camada lógica | estrutural |
| [10](10_EDGE_FUNCTIONS.md) | Edge Functions | 168 |
| [11](11_DADOS_BANCO.md) | Banco: censo, RLS, drift, cron | estrutural |
| [12](12_INFRA_CI_TESTES.md) | Infra, CI, testes | estrutural |
| [13](13_INTEGRACOES.md) | Integrações externas | 16 |

## Como ler

- **✅ IMPLEMENTADO_TOTAL** — fio completo (UI → lógica → persistência) e uso real comprovado
- **🟨 IMPLEMENTADO_PARCIAL** — existe e funciona em parte; falta camada, é stub, ou a tabela está vazia
- **🟦 SUGERIDO_OU_INICIADO** — esqueleto, componente sem consumidor, apenas mencionado
- **⬛ MORTO_OU_ABANDONADO** — código presente, nenhum caminho de execução chega nele

Toda linha cita `arquivo:linha`, objeto de banco ou `jobid` de cron. Célula sem evidência
verificável cai para 🟦 — não sobe.

Onde a auditoria não pôde verificar, está marcado **`NAO_VERIFICADO`**, sem meio-termo. As
limitações estão declaradas na seção "O que esta auditoria NÃO cobriu" do documento executivo.

O lote 08 contém um **bloco de errata** de um achado que foi refutado na verificação
independente. O texto original foi preservado de propósito: quem lê precisa saber que houve
revisão.
