# 📋 PLANO DE IMPLEMENTAÇÃO DETALHADO 1-A-1

> **Data**: 27/12/2024  
> **Projeto**: Sales CRM (Lovable + Claude)  
> **Total de Itens**: 31 melhorias pendentes

---

## 🚨 FASE 1: CRÍTICOS (Implementar Imediatamente)

### Item 1.1: Configurar VAPID Keys
**Prioridade**: 🔴 CRÍTICO  
**Esforço**: 30 minutos  
**Dependências**: Nenhuma

#### Problema
Push notifications não funcionam sem VAPID keys.

#### Arquivos Afetados
```
supabase/functions/push-subscribe/index.ts
supabase/functions/send-push-notification/index.ts
src/hooks/usePushNotifications.ts
public/sw.js
```

#### Passos de Implementação
```bash
# 1. Instalar web-push globalmente
npm install -g web-push

# 2. Gerar VAPID keys
npx web-push generate-vapid-keys

# Output esperado:
# =======================================
# Public Key:
# BJf8XH2p7...
#
# Private Key:
# jxkfP9Qk...
# =======================================

# 3. Adicionar secrets no Lovable Cloud:
# - VAPID_PUBLIC_KEY: <public_key>
# - VAPID_PRIVATE_KEY: <private_key>
```

#### Verificação
- [ ] Gerar par de chaves VAPID
- [ ] Adicionar VAPID_PUBLIC_KEY no Lovable Cloud
- [ ] Adicionar VAPID_PRIVATE_KEY no Lovable Cloud
- [ ] Testar inscrição de push notification
- [ ] Testar envio de push notification

---

### Item 1.2: Configurar ELEVENLABS_API_KEY
**Prioridade**: 🔴 CRÍTICO  
**Esforço**: 15 minutos  
**Dependências**: Nenhuma

#### Problema
TTS/STT de alta qualidade não funciona. Usa fallback do navegador.

#### Arquivos Afetados
```
supabase/functions/elevenlabs-tts/index.ts
supabase/functions/elevenlabs-stt/index.ts
src/hooks/useElevenLabsVoice.ts
src/components/assistant/VoiceControls.tsx
```

#### Passos de Implementação
1. Acessar https://elevenlabs.io
2. Criar conta ou fazer login
3. Ir em Profile → API Keys
4. Gerar nova API Key
5. Adicionar secret `ELEVENLABS_API_KEY` no Lovable Cloud

#### Verificação
- [ ] Criar/acessar conta ElevenLabs
- [ ] Gerar API Key
- [ ] Adicionar ELEVENLABS_API_KEY no Lovable Cloud
- [ ] Testar síntese de voz no Assistente (/assistente)
- [ ] Testar reconhecimento de voz

---

### Item 1.3: Habilitar Leaked Password Protection
**Prioridade**: 🔴 CRÍTICO  
**Esforço**: 5 minutos  
**Dependências**: Nenhuma

#### Problema
Usuários podem usar senhas vazadas em data breaches.

#### Passos de Implementação
1. Acessar Backend via Lovable Cloud
2. Navegar para Authentication → Settings
3. Localizar "Password protection"
4. Habilitar "Leaked Password Protection"
5. Salvar configurações

#### Verificação
- [ ] Habilitar proteção
- [ ] Executar linter do Supabase
- [ ] Confirmar que aviso foi removido

---

## 🟠 FASE 2: ALTA PRIORIDADE (Semana 1-2)

### Item 2.1: Mover Extensões do Schema Public
**Prioridade**: 🟠 ALTO  
**Esforço**: 1 hora  
**Dependências**: Nenhuma

#### Problema
Extensões PostgreSQL no schema `public` representam risco de segurança.

#### SQL a Executar
```sql
-- 1. Criar schema dedicado
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Verificar extensões existentes
SELECT extname, nspname 
FROM pg_extension e 
JOIN pg_namespace n ON e.extnamespace = n.oid 
WHERE nspname = 'public';

-- 3. Mover extensões (exemplo para pg_trgm)
-- Nota: algumas extensões não podem ser movidas, apenas reinstaladas
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
```

#### Verificação
- [ ] Identificar extensões no public
- [ ] Criar schema extensions
- [ ] Mover/reinstalar extensões
- [ ] Executar linter para confirmar

---

### Item 2.2: Refatorar Uso de `any` (309 ocorrências)
**Prioridade**: 🟠 ALTO  
**Esforço**: 6 horas  
**Dependências**: Nenhuma

#### Top 10 Arquivos para Corrigir

| # | Arquivo | Ocorrências | Correção |
|---|---------|-------------|----------|
| 1 | `src/components/analytics/ActivityTrendChart.tsx` | ~4 | Criar TooltipProps |
| 2 | `src/components/analytics/ClosingTimeChart.tsx` | ~3 | Criar TooltipProps |
| 3 | `src/components/vendedores/SalesChart.tsx` | ~2 | Criar TooltipProps |
| 4 | `src/pages/VendedorDashboard.tsx` | ~3 | Tipar icon como LucideIcon |
| 5 | `src/pages/Fornecedores.tsx` | ~5 | Tipar assessment |
| 6 | `src/hooks/useNotifications.ts` | ~2 | Tipar parsed notification |
| 7 | `src/components/debug/CircuitBreakerTrendChart.tsx` | ~4 | Criar TooltipProps |
| 8 | `src/components/sdr/SDRConversionEvolution.tsx` | ~2 | Tipar entry |
| 9 | `src/components/settings/SecurityAlertSettings.tsx` | ~1 | Tipar error |
| 10 | `src/pages/Notificacoes.tsx` | ~1 | Tipar error |

#### Padrão de Correção - Tooltips Recharts
```typescript
// Arquivo: src/types/recharts.ts (CRIAR)
export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    payload: Record<string, unknown>;
    color?: string;
  }>;
  label?: string;
}

// Uso em componentes:
import { ChartTooltipProps } from '@/types/recharts';

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  // ...
};
```

#### Padrão de Correção - Ícones
```typescript
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  // ...
}
```

#### Verificação por Arquivo
- [ ] src/components/analytics/ActivityTrendChart.tsx
- [ ] src/components/analytics/ClosingTimeChart.tsx
- [ ] src/components/vendedores/SalesChart.tsx
- [ ] src/pages/VendedorDashboard.tsx
- [ ] src/pages/Fornecedores.tsx
- [ ] src/hooks/useNotifications.ts
- [ ] Demais arquivos
- [ ] Executar `npx tsc --noEmit` sem erros

---

### Item 2.3: Substituir Cores Hardcoded (527 ocorrências)
**Prioridade**: 🟠 ALTO  
**Esforço**: 4 horas  
**Dependências**: Nenhuma

#### Mapa de Substituição
```css
/* ❌ HARDCODED → ✅ SEMANTIC TOKEN */

text-white → text-foreground (geral) OU manter em gradientes
text-black → text-foreground
text-gray-400 → text-muted-foreground
text-gray-500 → text-muted-foreground
text-gray-600 → text-muted-foreground
bg-white → bg-background ou bg-card
bg-gray-50 → bg-muted/50
bg-gray-100 → bg-muted
bg-gray-200 → bg-muted
border-gray-200 → border-border
```

#### Casos Especiais - MANTER text-white
```tsx
// ✅ MANTER - Sobre gradientes coloridos
<div className="gradient-primary">
  <Icon className="text-white" />
</div>

// ✅ MANTER - Sobre badges coloridos
<Badge className="bg-status-success text-white">

// ❌ SUBSTITUIR - Sobre bg-card/bg-background
<div className="bg-card">
  <p className="text-white">  {/* ERRADO */}
  <p className="text-foreground">  {/* CORRETO */}
</div>
```

#### Top 10 Arquivos para Corrigir
1. `src/components/gamification/LevelBadge.tsx`
2. `src/pages/VendedorDashboard.tsx`
3. `src/components/tasks/NextBestAction.tsx`
4. `src/components/analytics/DealVelocityChart.tsx`
5. `src/pages/Relatorios.tsx`
6. `src/components/analytics/LeadSLAMonitor.tsx`
7. `src/components/sdr/LeadTemperatureChart.tsx`
8. `src/pages/DesafiosSemanais.tsx`
9. `src/components/gamification/XPProgressBar.tsx`
10. `src/components/dashboard/StatCard.tsx`

#### Verificação
- [ ] Corrigir componentes de gamificação
- [ ] Corrigir páginas de dashboard
- [ ] Corrigir componentes de analytics
- [ ] Testar em Dark Mode
- [ ] Testar em Light Mode
- [ ] Verificar contraste visual

---

### Item 2.4: Implementar Paginação Real
**Prioridade**: 🟠 ALTO  
**Esforço**: 3 horas  
**Dependências**: Nenhuma

#### Hooks que Precisam de Paginação
```
src/hooks/useClients.ts     - ⚠️ Pode exceder 1000
src/hooks/useProducts.ts    - ⚠️ Pode crescer
src/hooks/useSalespeople.ts - ⚠️ Pode crescer
```

#### Template de Implementação
```typescript
// src/hooks/useClients.ts - IMPLEMENTAR

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const useClientsPaginated = (
  searchTerm?: string,
  page = 1,
  pageSize = 25
) => {
  return useQuery({
    queryKey: ["clients", searchTerm, page, pageSize],
    queryFn: async (): Promise<PaginatedResult<Client>> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("clients")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
  });
};
```

#### Verificação
- [ ] Implementar paginação em useClients
- [ ] Implementar paginação em useProducts
- [ ] Implementar paginação em useSalespeople
- [ ] Atualizar páginas que usam esses hooks
- [ ] Testar com dados de teste

---

### Item 2.5: Expandir Testes Unitários (15% → 60%)
**Prioridade**: 🟠 ALTO  
**Esforço**: 8 horas  
**Dependências**: Nenhuma

#### Hooks Prioritários para Testar

| # | Hook | Criticidade | Esforço |
|---|------|-------------|---------|
| 1 | `useGamificationData.ts` | Alta | 1h |
| 2 | `usePushNotifications.ts` | Alta | 1h |
| 3 | `useSuppliers.ts` | Alta | 45min |
| 4 | `useDemandForecast.ts` | Alta | 45min |
| 5 | `useCircuitBreaker.ts` | Alta | 1h |
| 6 | `useDigitalSignatures.ts` | Média | 30min |
| 7 | `usePriceHistory.ts` | Média | 30min |
| 8 | `useDailyChallenges.ts` | Média | 45min |
| 9 | `useWeeklyChallenges.ts` | Média | 45min |
| 10 | `useElevenLabsVoice.ts` | Média | 1h |

#### Template de Teste
```typescript
// src/hooks/__tests__/useNewHook.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useNewHook } from '../useNewHook';

const mockFrom = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useNewHook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data correctly', async () => {
    const mockData = [{ id: '1', name: 'Test' }];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }),
    });

    const { result } = renderHook(() => useNewHook(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(mockData);
  });

  it('should handle errors', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Error' } 
        }),
      }),
    });

    const { result } = renderHook(() => useNewHook(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

#### Verificação
- [ ] Criar useGamificationData.test.tsx
- [ ] Criar usePushNotifications.test.tsx
- [ ] Criar useSuppliers.test.tsx (se não existir)
- [ ] Criar useDemandForecast.test.tsx (se não existir)
- [ ] Criar useCircuitBreaker.test.tsx
- [ ] Executar `npm test` com sucesso
- [ ] Verificar cobertura > 40%

---

### Item 2.6: Expandir Testes E2E
**Prioridade**: 🟠 ALTO  
**Esforço**: 8 horas  
**Dependências**: Auth storage files

#### Cenários para Implementar

| # | Cenário | Arquivo | Esforço |
|---|---------|---------|---------|
| 1 | Fluxo de vendas | `e2e/sales-flow.spec.ts` | 2h |
| 2 | Gamificação | `e2e/gamification.spec.ts` | 2h |
| 3 | Pipeline D&D | `e2e/pipeline.spec.ts` | 1h |
| 4 | Cadências | `e2e/cadences.spec.ts` | 1.5h |
| 5 | Autenticação | `e2e/auth.spec.ts` | 1.5h |

#### Exemplo: Fluxo de Vendas
```typescript
// e2e/sales-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Fluxo de Vendas', () => {
  test.use({ storageState: 'e2e/.auth/salesperson.json' });

  test('deve criar nova venda', async ({ page }) => {
    await page.goto('/pipeline');
    
    // Abrir dialog de nova venda
    await page.click('[data-testid="new-sale-button"]');
    
    // Preencher formulário
    await page.fill('[name="client_name"]', 'Cliente E2E Test');
    await page.fill('[name="product_name"]', 'Produto Teste');
    await page.fill('[name="amount"]', '10000');
    
    // Submeter
    await page.click('[type="submit"]');
    
    // Verificar criação
    await expect(page.locator('text=Cliente E2E Test')).toBeVisible();
  });

  test('deve mover venda no pipeline', async ({ page }) => {
    await page.goto('/pipeline');
    
    // Arrastar deal para próxima coluna
    const deal = page.locator('[data-testid="deal-card"]').first();
    const targetColumn = page.locator('[data-stage="qualificacao"]');
    
    await deal.dragTo(targetColumn);
    
    // Verificar movimentação
    await expect(targetColumn.locator('[data-testid="deal-card"]')).toBeVisible();
  });
});
```

#### Verificação
- [ ] Criar auth storage files
- [ ] Criar sales-flow.spec.ts
- [ ] Criar gamification.spec.ts
- [ ] Criar pipeline.spec.ts
- [ ] Executar `npx playwright test` com sucesso

---

## 🟡 FASE 3: MÉDIA PRIORIDADE (Semana 2-3)

### Item 3.1: Análise de Risco de Fornecedor
**Prioridade**: 🟡 MÉDIO  
**Esforço**: 4 horas

#### Implementação
1. Criar Edge Function `supplier-risk-assessment`
2. Criar hook `useSupplierRisk.ts`
3. Criar componente `SupplierRiskDashboard.tsx`
4. Integrar na página Fornecedores

---

### Item 3.2: Melhorar Previsão de Demanda
**Prioridade**: 🟡 MÉDIO  
**Esforço**: 6 horas

#### Melhorias
1. Adicionar sazonalidade
2. Implementar detecção de tendência
3. Adicionar fatores externos
4. Melhorar intervalos de confiança

---

### Item 3.3: Envolver Console.logs em DEV Check
**Prioridade**: 🟡 MÉDIO  
**Esforço**: 1 hora

#### Arquivos a Corrigir
```
src/hooks/useQueryPerformance.ts - linhas 222-235
src/hooks/usePushNotifications.ts - linha 37
```

#### Padrão
```typescript
// ❌ Antes
console.log('Service Worker registered:', registration);

// ✅ Depois
if (import.meta.env.DEV) {
  console.log('Service Worker registered:', registration);
}
```

---

### Item 3.4: Refatorar Componentes Grandes
**Prioridade**: 🟡 MÉDIO  
**Esforço**: 4 horas

#### Arquivos
```
src/pages/Fornecedores.tsx (~500 linhas)
src/pages/ICP.tsx (~437 linhas)
src/components/pipeline/PipelineBoard.tsx (~350 linhas)
```

---

### Item 3.5: Adicionar Skeleton Loaders
**Prioridade**: 🟡 MÉDIO  
**Esforço**: 2 horas

#### Páginas
- PrevisaoDemanda
- Cadencias
- DesafiosSemanais

---

### Item 3.6: Melhorar ARIA Labels
**Prioridade**: 🟡 MÉDIO  
**Esforço**: 3 horas

#### Componentes
- StatCards
- Gráficos Recharts
- Badges de gamificação

---

## 🔵 FASE 4: BAIXA PRIORIDADE (Semana 4)

### Item 4.1: Documentar Edge Functions
**Esforço**: 4 horas

### Item 4.2: Gerar ERD Atualizado
**Esforço**: 2 horas

### Item 4.3: Verificar Responsive Mobile
**Esforço**: 2 horas

### Item 4.4: Implementar Atalhos de Teclado
**Esforço**: 2 horas

### Item 4.5: Otimizar Imagens
**Esforço**: 1 hora

---

## 📅 CRONOGRAMA

### Semana 1: Críticos + Alta Prioridade (Parte 1)
| Dia | Itens |
|-----|-------|
| Seg | 1.1, 1.2, 1.3 (Secrets e Segurança) |
| Ter | 2.1 (Extensions) |
| Qua | 2.2 (any - 50%) |
| Qui | 2.2 (any - 50%) |
| Sex | 2.3 (Cores - 50%) |

### Semana 2: Alta Prioridade (Parte 2)
| Dia | Itens |
|-----|-------|
| Seg | 2.3 (Cores - 50%) |
| Ter | 2.4 (Paginação) |
| Qua | 2.5 (Testes Unit - 50%) |
| Qui | 2.5 (Testes Unit - 50%) |
| Sex | 2.6 (Testes E2E) |

### Semana 3: Média Prioridade
| Dia | Itens |
|-----|-------|
| Seg | 3.1 (Risco Fornecedor) |
| Ter | 3.2 (Previsão Demanda) |
| Qua | 3.3 (Console.logs), 3.4 (Refatorar) |
| Qui | 3.5 (Skeletons) |
| Sex | 3.6 (ARIA) |

### Semana 4: Baixa Prioridade
| Dia | Itens |
|-----|-------|
| Seg | 4.1 (Docs) |
| Ter | 4.1 (Docs), 4.2 (ERD) |
| Qua | 4.3 (Mobile) |
| Qui | 4.4 (Atalhos) |
| Sex | 4.5 (Imagens), Revisão Final |

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Atual | Semana 2 | Semana 4 |
|---------|-------|----------|----------|
| Secrets configurados | 5/7 | 7/7 | 7/7 |
| Warnings Supabase | 2 | 0 | 0 |
| Uso de `any` | 309 | <100 | <30 |
| Cores hardcoded | 527 | <200 | 0 |
| Cobertura testes | 15% | 40% | 60% |
| Testes E2E | 1 | 3 | 6 |
| Console.logs | 33 | 10 | 0 |

---

**Documento criado em**: 27/12/2024  
**Atualizar conforme itens forem implementados**
