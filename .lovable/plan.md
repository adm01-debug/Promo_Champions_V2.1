# Levantamento e Plano de Melhorias Técnicas - Auditoria de Excelência

Após uma análise minuciosa do projeto, identifiquei oportunidades críticas para elevar a maturidade técnica do sistema para o nível 10/10, focando em robustez, tipagem rigorosa e performance.

## 1. Eliminação de Dívida Técnica (Tipagem)
O projeto ainda possui múltiplos usos de `any`, principalmente em componentes de interface complexos (`AdminComercial.tsx`, `Cadencias.tsx`) e em utilitários de exportação. Isso fragiliza a segurança em tempo de compilação.

- **Ação:** Substituir `any` por interfaces específicas ou Generics estritos em `AdminComercial.tsx` e `Cadencias.tsx`.
- **Ação:** Refinar os tipos em `src/types/index.ts` para cobrir os metadados de auditoria e configurações comerciais.

## 2. Otimização de Performance e Estabilidade
Identifiquei que o trigger de automação em `Cadencias.tsx` (`supabase.functions.invoke`) é disparado no `useState` inicial de forma não estruturada, o que pode causar execuções redundantes em re-renderizações ou falhas silenciosas.

- **Ação:** Refatorar o disparo de Edge Functions para um `useEffect` controlado com tratamento de erro e controle de concorrência.
- **Ação:** Implementar memoização (`useMemo`/`useCallback`) em cálculos pesados de filtragem no dashboard de cadências.

## 3. Robustez na Camada de Dados
A manipulação de valores monetários e decimais em `AdminComercial.tsx` utiliza `parseFloat` diretamente do valor do input, o que é propenso a erros de arredondamento e validação.

- **Ação:** Implementar uma camada de validação e normalização de dados antes do envio para o Supabase, utilizando schemas Zod para garantir integridade.

## 4. Auditoria e Logs
Embora exista uma funcionalidade de auditoria, os logs de metadados (`metadata as any`) perdem a rastreabilidade estruturada.

- **Ação:** Tipar os metadados de auditoria para garantir que cada ação (`approved_goal`, etc.) tenha os campos obrigatórios para compliance.

---

## Detalhes Técnicos para Implementação

### Etapa 1: Tipagem de AdminComercial
- Criar interfaces `ApprovalRequest`, `CommercialGoal`, `ScoringRule`.
- Mapear os `new_values` e `old_values` de acordo com o `type` da solicitação.

### Etapa 2: Estabilização de Cadências
- Mover o invoke de `process-cadence-tasks` para um hook dedicado que evite loops.
- Corrigir os `p as any` no mapeamento da lista de leads.

### Etapa 3: Exportação Segura
- Garantir que `exportToPDF` e `exportToCSV` validem a estrutura dos dados recebidos através de constraints genéricas mais estritas.
