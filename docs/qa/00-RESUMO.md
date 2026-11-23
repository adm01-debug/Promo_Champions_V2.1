# 00 — Resumo para o dono

Auditoria de qualidade feita em 22 e 23 de novembro de 2026, sobre o código que está no ar
(versão 1.7.4). **Nada foi alterado**: nenhum arquivo, nenhuma migration, nenhum dado, nenhum
serviço. O resultado é um diagnóstico e um plano de 255 etapas que outro agente executa, uma
por vez.

## Estado geral, em quatro frases

O sistema é mais maduro do que o rótulo "80% pronto" sugere: passou por auditorias anteriores
e tem defesas reais que **foram verificadas funcionando** — nenhum dado vaza para visitante
não autenticado, os webhooks de parceiros recusam quem não tem assinatura, não há senha nem
chave de serviço no código, não há dependência vulnerável, e a base de código praticamente
não tem arquivo morto. O problema não está espalhado: está concentrado em três pontos
específicos e caros — **quem pode entrar**, **quanto de comissão o sistema diz que vai pagar**
e **quem fica sabendo quando algo falha**. A maior parte dos 151 problemas encontrados é de
médio ou baixo impacto e pode esperar. Os 12 problemas críticos, não.

## Os 10 maiores riscos, em linguagem de negócio

1. **Qualquer pessoa da internet pode criar uma conta no seu CRM.** O cadastro público do
   Supabase está aberto e, ao se cadastrar, a pessoa recebe automaticamente o papel de
   vendedor. Não há restrição de domínio de e-mail. *(verificado ao vivo)*
2. **E, com essa conta, consegue remanejar qualquer negócio do seu funil.** Uma função do
   servidor aceita o identificador da venda vindo de fora e move o estágio sem verificar de
   quem é a venda. Juntando com o item 1: alguém de fora cria uma conta e mexe no seu
   pipeline. Falta confirmar uma condição (se existe uma automação ativa de um tipo
   específico) — é a primeira consulta que o plano manda rodar.
3. **A comissão que o vendedor vê na tela não é a que o sistema vai pagar.** Existem três
   taxas diferentes no sistema; a tela de Metas usa uma (padrão de 10%) e o banco grava com
   outra (padrão de 5%). Em uma venda sem regra específica cadastrada, o vendedor vê o dobro
   do que vai receber.
4. **O painel de retorno sobre investimento mostra o custo de comissão 100 vezes maior.** Um
   erro de unidade: a taxa é percentual e está sendo usada como fração. Com taxa de 10%, o
   custo aparece como dez vezes a receita, e o retorno de todo vendedor fica em torno de −90%.
   Qualquer decisão de contratação tomada nessa tela usou número inventado.
5. **Arrastar um negócio para "Arquivado" registra uma venda ganha.** Gera receita no mês,
   cria comissão a pagar e credita pontos de gamificação. O vendedor acha que está arquivando;
   o sistema entende que fechou.
6. **Um erro de digitação ao cadastrar uma premiação paga o prêmio para todo mundo.** A
   verificação de quem merece o prêmio acontece só no navegador, e o caso "não sei avaliar"
   foi escrito como "atingido". O servidor aceita sem reconferir. O prêmio entra na fila de
   pagamento.
7. **Deploy de mudança no banco de produção acontece sem ninguém autorizar.** O arquivo de
   automação afirma que existe aprovação humana; a configuração real do GitHub mostra que não
   existe. Mergear a versão de release aplica mudança de estrutura no banco e republica as 171
   funções do servidor automaticamente. *(verificado ao vivo)*
8. **Nenhum alerta por e-mail sai do sistema.** A chave do provedor de e-mail não está
   configurada, e as onze funções que dependem dela não reclamam: devolvem "pulado" e seguem.
   Alerta de prazo de lead estourado, risco de perda de cliente, acesso negado, venda fechada
   e meta — nada chega a ninguém. *(verificado ao vivo; a recuperação de senha do usuário
   **não** é afetada)*
9. **Erro de sistema em produção não notifica ninguém — e a tela diz ao usuário que notificou.**
   A captura de erros funciona, mas os dois destinos estão desligados. A mensagem que o usuário
   vê afirma: "A equipe técnica já foi notificada automaticamente". Não foi.
10. **Metade do portão de qualidade não bloqueia nada.** O único check obrigatório cobre 4 dos
    19 trabalhos de verificação: mudança no banco com erro, teste de banco vermelho e tipos
    fora de sincronia passam direto. E 26 dos 49 testes de ponta a ponta — incluindo os que
    provam que um vendedor não lê dados de outro — **nunca rodam**, por uma contradição entre
    duas condições do próprio arquivo de automação. *(verificado ao vivo, com um exemplo real
    de execução que ficou verde sem rodar nada)*

## Contagem por severidade

| Severidade | O que significa | Quantos |
|---|---|---|
| **Crítica** | perda ou vazamento de dado, falha de segurança, fluxo principal quebrado | **12** |
| **Alta** | função importante falha ou dá resultado errado | **47** |
| **Média** | funciona com defeito ou fragilidade | **64** |
| **Baixa** | acabamento e higiene | **28** |
| | **Total** | **151** |

Dos 151, **42 têm execução real** (requisição, consulta, comando ou verificação contra a API
do GitHub), **106 foram rastreados** no código que roda e **3 vêm da medição de 12/11** do
banco. Quanto à confiança: **142 estão confirmados** e **9 estão marcados como hipótese**, cada
um dizendo o que falta para confirmar. Nenhum achado entrou sem evidência.

## O que o plano faz

255 etapas, em oito ondas, na ordem: segurança → fluxos quebrados → integridade de dados →
funcionalidades incompletas → robustez → desempenho → experiência de uso → higiene. Cada etapa
é uma mudança pequena, com verificação própria, e aponta para o problema que resolve.

**121 das 255 terminam com a PR aberta esperando você.** São as que mexem em estrutura do
banco, em automação de CI, em segredo, em infraestrutura, em exclusão de dado, ou que mudam um
número de negócio (comissão, meta, ranking, premiação). O agente faz o trabalho e para; a
decisão é sua.

**23 etapas precisam de uma resposta sua antes de começar** — não é revisão de código, é
decisão de negócio que ninguém pode tomar no seu lugar. As três mais importantes:
- **Qual é a taxa de comissão válida?** (etapa 042) Hoje há três fontes divergentes, e
  qualquer unificação sem a sua resposta escolhe um número arbitrário.
- **Gestor pode aprovar e pagar comissão?** (etapa 173) O sistema diz as duas coisas em
  lugares diferentes.
- **Como entram novos vendedores?** (etapa 001) Preciso saber antes de fechar o cadastro
  público, ou a empresa fica sem forma de admitir gente.

## Sobre o alvo de 300 etapas

O pedido era um plano de 300 etapas. **Entrego 255** — e a diferença é deliberada.

Os 151 problemas encontrados sustentam 255 mudanças atômicas e verificáveis. Para chegar a 300
eu precisaria dividir correções que fazem sentido juntas ou inventar trabalho sem evidência, e
o custo disso não é teórico: cada etapa inútil é tempo que o próximo agente gasta sem retorno,
e enfraquece a confiança nas etapas que importam. Onde havia muitas ocorrências do mesmo
problema (400 tabelas com permissão excessiva, 111 gatilhos duplicados, 50 supressões de
verificação), o plano **já divide em lotes** — porque ali a divisão protege, cada lote é uma PR
pequena com verificação própria.

Se mais etapas forem necessárias, elas virão das nove medições que o plano pede (etapas 002,
087, 153, 163, 168, 188, 206, 218 e 225): são justamente as perguntas que esta auditoria não
pôde responder sem acesso de escrita ou sem SQL no banco.

## O que não foi coberto, e por quê

| O que | Por quê |
|---|---|
| **SQL no banco de produção** | O conector configurado responde `Management API 401: Invalid access token` em todas as chamadas. O gateway alternativo confirma o projeto certo no endereço de saúde, mas devolve 404 em todos os 13 caminhos de envio testados. E o token de API do ambiente só alcança outra organização. **Consequência:** todo achado sobre permissão de acesso, função, gatilho e índice do banco vem da introspecção de 17/11 que está no repositório (`supabase/schema.sql`) ou das migrations — não de medição ao vivo. A primeira coisa que o executor faz em qualquer etapa de banco é reconfirmar com SQL. |
| **Qualquer teste que exigisse escrever** | Criar usuário, inserir venda, disparar e-mail, aplicar mudança de estrutura. Por isso os problemas de "um usuário consegue mexer no dado de outro" foram rastreados no código, não explorados. |
| **Suíte de testes de interface e varredura de acessibilidade** | Exigem servidor de pré-visualização com sessão autenticada. As etapas 225 a 227 cobrem. |
| **Layout real em celular e tablet** | Exigiria navegador contra o sistema em produção, autenticado. O que foi verificado é o código do menu móvel — e ali está o problema 10 da lista acima. |
| **Desempenho sob uso real** | A tabela de estatísticas de consulta do Postgres é inacessível sem SQL. A etapa 168 pede essa medição antes de qualquer otimização — o plano não otimiza por adivinhação. |
| **Configuração do projeto na Vercel** | O token disponível não lista os projetos desta conta. O que foi verificado ao vivo são os cabeçalhos e o comportamento do site publicado. |

## Onde estão os arquivos

| Arquivo | O que tem |
|---|---|
| `docs/qa/00-RESUMO.md` | este documento |
| `docs/qa/01-INVENTARIO.md` | mapa do sistema e registro de cobertura, camada por camada |
| `docs/qa/02-CENARIOS.md` | 99 cenários de teste por jornada, com esperado × encontrado |
| `docs/qa/03-ACHADOS.md` | os 151 problemas, agrupados por causa raiz, com evidência |
| `docs/qa/04-PLANO.md` | instruções para o executor, padrões do repositório e as 255 etapas |
| `docs/qa/05-PROGRESSO.md` | a lista que o executor vai marcando |
