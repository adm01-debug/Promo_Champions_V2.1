# 📋 PLANO DE IMPLEMENTAÇÃO COMPLETO - MELHORIAS PENDENTES

> **Data da Análise**: 27/12/2024 (Atualizado)  
> **Projeto**: Sales CRM - Sistema de Gestão de Vendas  
> **Status**: Análise exaustiva do repositório com plano 1-a-1

---

## 📊 RESUMO EXECUTIVO ATUALIZADO

| Categoria | Total | Crítico | Alto | Médio | Baixo | ✅ Já Implementado |
|-----------|-------|---------|------|-------|-------|-------------------|
| Secrets/Configuração | 4 | 2 | 2 | 0 | 0 | 0 |
| Funcionalidades Incompletas | 4 | 0 | 1 | 2 | 1 | ✅ 2 (Assinatura Digital, Histórico Preços) |
| Qualidade de Código | 8 | 0 | 3 | 4 | 1 | 0 |
| Segurança | 3 | 1 | 2 | 0 | 0 | 0 |
| Testes | 4 | 0 | 2 | 2 | 0 | 0 |
| Performance | 5 | 0 | 2 | 3 | 0 | 0 |
| UX/Acessibilidade | 6 | 0 | 1 | 3 | 2 | 0 |
| Documentação | 4 | 0 | 0 | 2 | 2 | 0 |
| Console.logs em Produção | 1 | 0 | 1 | 0 | 0 | 0 |
| **TOTAL** | **39** | **3** | **14** | **16** | **6** | **2** |

---

# 🚨 PARTE 1: ITENS CRÍTICOS (Implementar Imediatamente)

## 1.1 VAPID Keys para Push Notifications
**Prioridade**: 🔴 CRÍTICO  
**Esforço**: 30 minutos  
**Status**: ❌ Não configurado

### Problema
Push notifications reais não funcionam sem VAPID keys configuradas.

### Arquivos Afetados
- `supabase/functions/push-subscribe/index.ts` (linha 60)
- `supabase/functions/send-push-notification/index.ts` (linhas 50-51)
- `src/hooks/usePushNotifications.ts`

### Secrets Faltantes
```
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
```

### Passos de Implementação
```bash
# 1. Gerar VAPID keys
npx web-push generate-vapid-keys

# 2. Copiar as chaves geradas

# 3. Adicionar via Lovable Cloud Secrets
# - VAPID_PUBLIC_KEY: <public_key_gerada>
# - VAPID_PRIVATE_KEY: <private_key_gerada>

# 4. Testar push notification
```

### Verificação
- [ ] Gerar VAPID keys
- [ ] Adicionar VAPID_PUBLIC_KEY
- [ ] Adicionar VAPID_PRIVATE_KEY
- [ ] Testar envio de push notification

---

## 1.2 ElevenLabs API Key
**Prioridade**: 🔴 CRÍTICO  
**Esforço**: 15 minutos  
**Status**: ❌ Não configurado

### Problema
TTS/STT de alta qualidade não funciona. Atualmente usa fallback do navegador com qualidade inferior.

### Arquivos Afetados
- `supabase/functions/elevenlabs-tts/index.ts`
- `supabase/functions/elevenlabs-stt/index.ts`
- `src/hooks/useElevenLabsVoice.ts`

### Passos de Implementação
1. Criar conta em https://elevenlabs.io
2. Gerar API Key no dashboard
3. Adicionar secret `ELEVENLABS_API_KEY` via Lovable Cloud

### Verificação
- [ ] Criar conta ElevenLabs
- [ ] Gerar API Key
- [ ] Adicionar secret ELEVENLABS_API_KEY
- [ ] Testar síntese de voz no Assistente

---

## 1.3 Leaked Password Protection Disabled
**Prioridade**: 🔴 CRÍTICO  
**Esforço**: 5 minutos  
**Status**: ⚠️ Aviso do Supabase Linter

### Problema
Usuários podem usar senhas que já foram vazadas em data breaches conhecidos.

### Solução
Não é possível resolver via código - requer ação manual no dashboard.

### Passos de Implementação
1. Acessar Backend via Lovable Cloud
2. Ir em Authentication → Settings
3. Habilitar "Leaked Password Protection"

### Verificação
- [ ] Habilitar proteção de senhas vazadas
- [ ] Executar linter novamente para confirmar

---

# 🟠 PARTE 2: ITENS DE ALTA PRIORIDADE

## 2.1 Extension in Public Schema
**Prioridade**: 🟠 ALTO  
**Esforço**: 1 hora  
**Status**: ⚠️ Aviso do Supabase Linter

### Problema
Extensões PostgreSQL instaladas no schema `public` representam risco de segurança.

### Passos de Implementação
```sql
-- 1. Criar schema dedicado para extensões
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Mover extensões existentes (exemplo)
-- Verificar quais extensões estão no public primeiro
SELECT extname, nspname 
FROM pg_extension e 
JOIN pg_namespace n ON e.extnamespace = n.oid 
WHERE nspname = 'public';

-- 3. Reinstalar extensões no schema correto
-- NOTA: Algumas extensões não podem ser movidas, apenas reinstaladas
```

### Verificação
- [ ] Identificar extensões no public schema
- [ ] Criar schema extensions
- [ ] Mover/reinstalar extensões
- [ ] Executar linter para confirmar

---

## 2.2 Refatorar Uso de `any` (324 ocorrências)
**Prioridade**: 🟠 ALTO  
**Esforço**: 6 horas  
**Status**: ❌ 324 ocorrências em 47 arquivos

### Arquivos Mais Afetados (Top 10)

| # | Arquivo | Ocorrências | Prioridade |
|---|---------|-------------|------------|
| 1 | `src/pages/ICP.tsx` | ~15 | Alta |
| 2 | `src/hooks/useClientPortfolio.ts` | ~10 | Alta |
| 3 | `src/hooks/useLeadSourceAnalysis.ts` | ~8 | Alta |
| 4 | `src/hooks/useConversionAnalysis.ts` | ~8 | Alta |
| 5 | `src/hooks/useICPData.ts` | ~6 | Alta |
| 6 | `src/components/cadences/TodaysCadenceTasks.tsx` | ~6 | Média |
| 7 | `src/hooks/useElevenLabsVoice.ts` | ~5 | Média |
| 8 | `src/hooks/useNotificationPreferences.ts` | ~5 | Média |
| 9 | `src/components/debug/CircuitBreakerTrendChart.tsx` | ~4 | Baixa |
| 10 | `src/components/dashboard/SalesChart.tsx` | ~4 | Baixa |

### Padrões a Corrigir

```typescript
// ❌ ERRADO
const handleEdit = (icp: any) => { ... }
function calculateConversionData(history: any[], ...) { ... }
const CustomTooltip = ({ active, payload }: any) => { ... }

// ✅ CORRETO
interface ICPData { client_id: string; ramo_atividade?: string; ... }
const handleEdit = (icp: ICPData) => { ... }

interface StageHistory { sales: { salesperson_id: string } }
function calculateConversionData(history: StageHistory[], ...) { ... }

interface TooltipProps { active?: boolean; payload?: Array<{ value: number }> }
const CustomTooltip = ({ active, payload }: TooltipProps) => { ... }
```

### Passos de Implementação (por arquivo)

#### 2.2.1 - src/pages/ICP.tsx
```typescript
// Linha 47: Substituir any por ICPData
const [editingICP, setEditingICP] = useState<ICPData | null>(null);

// Linha 96: Tipar parâmetro
const handleEdit = (icp: ICPData) => { ... }
```

#### 2.2.2 - src/hooks/useConversionAnalysis.ts
```typescript
// Criar interface para StageHistory
interface StageHistoryWithSales {
  sales: { salesperson_id: string } | null;
  stage: string;
  entered_at: string;
  exited_at: string | null;
}

// Linha 35-37: Usar a interface
function calculateConversionData(
  history: StageHistoryWithSales[], 
  salespersonId?: string
): ConversionResult { ... }
```

### Verificação
- [ ] Corrigir src/pages/ICP.tsx (15 ocorrências)
- [ ] Corrigir src/hooks/useClientPortfolio.ts (10 ocorrências)
- [ ] Corrigir src/hooks/useLeadSourceAnalysis.ts (8 ocorrências)
- [ ] Corrigir src/hooks/useConversionAnalysis.ts (8 ocorrências)
- [ ] Corrigir src/hooks/useICPData.ts (6 ocorrências)
- [ ] Corrigir arquivos restantes
- [ ] Executar `npx tsc --noEmit` sem erros

---

## 2.3 Substituir Cores Hardcoded (547 ocorrências)
**Prioridade**: 🟠 ALTO  
**Esforço**: 4 horas  
**Status**: ❌ 547 ocorrências em 54 arquivos

### Mapeamento de Substituição

| Cor Hardcoded | Token Correto |
|---------------|---------------|
| `text-white` | `text-foreground` ou contexto específico |
| `bg-white` | `bg-background` ou `bg-card` |
| `text-black` | `text-foreground` |
| `bg-black` | `bg-background` |
| `text-gray-400` | `text-muted-foreground` |
| `text-gray-500` | `text-muted-foreground` |
| `text-gray-600` | `text-muted-foreground` |
| `bg-gray-100` | `bg-muted` |
| `bg-gray-200` | `bg-muted` |
| `border-gray-200` | `border-border` |

### Arquivos Mais Afetados (Top 10)

| # | Arquivo | Ocorrências |
|---|---------|-------------|
| 1 | `src/components/gamification/LevelBadge.tsx` | ~20 |
| 2 | `src/pages/VendedorDashboard.tsx` | ~18 |
| 3 | `src/components/tasks/NextBestAction.tsx` | ~15 |
| 4 | `src/components/analytics/DealVelocityChart.tsx` | ~12 |
| 5 | `src/pages/Relatorios.tsx` | ~10 |
| 6 | `src/components/analytics/LeadSLAMonitor.tsx` | ~10 |
| 7 | `src/components/sdr/LeadTemperatureChart.tsx` | ~8 |
| 8 | `src/pages/DesafiosSemanais.tsx` | ~8 |
| 9 | `src/components/gamification/XPProgressBar.tsx` | ~6 |
| 10 | `src/components/dashboard/StatCard.tsx` | ~6 |

### Casos Especiais

```tsx
// ⚠️ CASOS QUE REQUEREM ATENÇÃO

// 1. text-white em gradientes - MANTER (é intencional)
<div className="gradient-primary">
  <Icon className="text-white" />  // ✅ OK - contraste no gradiente
</div>

// 2. text-white em badges coloridos - MANTER
<Badge className="bg-status-success">
  <span className="text-white">...</span>  // ✅ OK
</Badge>

// 3. Substituir apenas onde não há contexto de cor
<div className="bg-card">
  <p className="text-white">...</p>  // ❌ ERRO - deveria ser text-foreground
</div>
```

### Passos de Implementação

1. Buscar e substituir em batch por arquivo
2. Revisar casos especiais (gradientes, badges)
3. Testar em dark mode e light mode
4. Validar contraste visual

### Verificação
- [ ] Corrigir arquivos de gamificação
- [ ] Corrigir páginas de dashboard
- [ ] Corrigir componentes de analytics
- [ ] Testar em dark mode
- [ ] Testar em light mode

---

## 2.4 Implementar Paginação em Queries
**Prioridade**: 🟠 ALTO  
**Esforço**: 3 horas  
**Status**: ❌ Limite padrão de 1000 registros pode ser atingido

### Hooks Afetados

| Hook | Tabela | Risco |
|------|--------|-------|
| `useClients.ts` | clients | Alto - pode ter muitos clientes |
| `useSalesData.ts` | sales | Alto - vendas crescem rapidamente |
| `useActivities.ts` | activities | Alto - muitas atividades por dia |
| `useSuppliers.ts` | suppliers | Médio |

### Implementação Exemplo

```typescript
// src/hooks/useClients.ts - ANTES
export const useClients = (searchTerm?: string) => {
  return useQuery({
    queryKey: ["clients", searchTerm],
    queryFn: async (): Promise<Client[]> => {
      let query = supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      // ... sem limite!
    },
  });
};

// src/hooks/useClients.ts - DEPOIS
export const useClients = (searchTerm?: string, page = 1, pageSize = 50) => {
  return useQuery({
    queryKey: ["clients", searchTerm, page, pageSize],
    queryFn: async (): Promise<{ data: Client[]; count: number }> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      let query = supabase
        .from("clients")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,...`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
  });
};
```

### Verificação
- [ ] Adicionar paginação em useClients.ts
- [ ] Adicionar paginação em useSalesData.ts
- [ ] Adicionar paginação em useActivities.ts
- [ ] Atualizar componentes que consomem esses hooks
- [ ] Adicionar componente de paginação nas tabelas

---

## 2.5 Expandir Testes Unitários (15% → 60%)
**Prioridade**: 🟠 ALTO  
**Esforço**: 8 horas  
**Status**: ❌ Apenas 13 de ~85 hooks testados

### Hooks Testados (13/85)
- ✅ useActivities
- ✅ useClients
- ✅ useDashboardKPIs
- ✅ usePerformanceComparison
- ✅ usePipeline
- ✅ useProducts
- ✅ useRLSPolicies
- ✅ useReportData
- ✅ useSalesData
- ✅ useSalesForecast
- ✅ useSalespeople
- ✅ useTasks
- ✅ useWinLossAnalysis

### Hooks Críticos para Testar (Prioridade)

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

### Template de Teste

```typescript
// src/hooks/__tests__/useGamificationData.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGamificationData } from '../useGamificationData';

const mockFrom = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: (...args: any[]) => mockFrom(...args) },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useGamificationData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch XP data correctly', async () => {
    const mockData = [{ id: '1', total_xp: 1500, current_level: 5 }];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }),
    });

    const { result } = renderHook(() => useGamificationData('salesperson-1'), { wrapper });
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(mockData);
  });
});
```

### Verificação
- [ ] Criar useGamificationData.test.ts
- [ ] Criar usePushNotifications.test.ts
- [ ] Criar useSuppliers.test.ts
- [ ] Criar useDemandForecast.test.ts
- [ ] Criar useCircuitBreaker.test.ts
- [ ] Executar `npm test` com cobertura > 50%

---

## 2.6 Expandir Testes E2E
**Prioridade**: 🟠 ALTO  
**Esforço**: 8 horas  
**Status**: ❌ Apenas 1 spec file (rls-policies.spec.ts)

### Cenários Existentes
- ✅ Acesso não autenticado
- ✅ Restrições de Salesperson
- ✅ Acesso de Manager
- ✅ Acesso total de Admin
- ✅ Logging de acesso negado

### Cenários Faltantes

| # | Cenário | Prioridade | Esforço |
|---|---------|------------|---------|
| 1 | Fluxo completo de vendas | Alta | 2h |
| 2 | Gamificação (XP, streaks, challenges) | Alta | 2h |
| 3 | Pipeline drag-and-drop | Média | 1h |
| 4 | Cadências | Média | 1h |
| 5 | Assistente IA | Baixa | 1h |
| 6 | Push notifications | Baixa | 1h |

### Implementação - Fluxo de Vendas

```typescript
// e2e/sales-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Fluxo de Vendas', () => {
  test.use({ storageState: 'e2e/.auth/salesperson.json' });

  test('deve criar nova venda e mover pelo pipeline', async ({ page }) => {
    await page.goto('/pipeline');
    
    // Criar nova venda
    await page.click('[data-testid="create-sale-button"]');
    await page.fill('[name="client_name"]', 'Cliente Teste');
    await page.fill('[name="product_name"]', 'Produto Teste');
    await page.fill('[name="amount"]', '5000');
    await page.click('[type="submit"]');
    
    // Verificar criação
    await expect(page.locator('text=Cliente Teste')).toBeVisible();
    
    // Mover para próximo estágio via drag-and-drop
    const card = page.locator('[data-testid="deal-card"]').first();
    const targetColumn = page.locator('[data-stage="qualificacao"]');
    await card.dragTo(targetColumn);
    
    // Verificar movimentação
    await expect(targetColumn.locator('text=Cliente Teste')).toBeVisible();
  });
});
```

### Auth Storage Files Necessários

```typescript
// e2e/auth.setup.ts - Atualizar para gerar os arquivos
import { test as setup } from '@playwright/test';

const users = [
  { role: 'salesperson', email: 'vendedor@test.com', password: 'test123' },
  { role: 'manager', email: 'gerente@test.com', password: 'test123' },
  { role: 'admin', email: 'admin@test.com', password: 'test123' },
];

for (const user of users) {
  setup(`authenticate as ${user.role}`, async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', user.email);
    await page.fill('[name="password"]', user.password);
    await page.click('[type="submit"]');
    await page.waitForURL('/');
    await page.context().storageState({ path: `e2e/.auth/${user.role}.json` });
  });
}
```

### Verificação
- [ ] Criar arquivos de auth storage
- [ ] Criar sales-flow.spec.ts
- [ ] Criar gamification.spec.ts
- [ ] Criar pipeline-dnd.spec.ts
- [ ] Executar `npx playwright test` sem falhas

---

# 🟡 PARTE 3: ITENS DE MÉDIA PRIORIDADE

## 3.1 Análise de Risco de Fornecedor
**Prioridade**: 🟡 MÉDIO  
**Esforço**: 4 horas  
**Status**: ❌ Tabela existe mas sem lógica

### Problema
A tabela `supplier_risk_assessments` existe mas:
- Sem Edge Function para calcular risco automaticamente
- Sem UI para visualizar/editar assessments
- Sem alertas de fornecedores de alto risco

### Passos de Implementação

#### 3.1.1 - Criar Edge Function
```typescript
// supabase/functions/supplier-risk-assessment/index.ts
serve(async (req) => {
  const { supplier_id } = await req.json();
  
  // Calcular riscos baseado em:
  // - Histórico de entregas (pontualidade)
  // - Histórico de qualidade (devoluções)
  // - Saúde financeira (pagamentos)
  
  const financialRisk = calculateFinancialRisk(supplier_id);
  const deliveryRisk = calculateDeliveryRisk(supplier_id);
  const qualityRisk = calculateQualityRisk(supplier_id);
  
  const overallRisk = (financialRisk + deliveryRisk + qualityRisk) / 3;
  
  // Salvar assessment
  await supabase.from('supplier_risk_assessments').insert({
    supplier_id,
    financial_risk: financialRisk,
    delivery_risk: deliveryRisk,
    quality_risk: qualityRisk,
    overall_risk: overallRisk,
    risk_level: getRiskLevel(overallRisk),
  });
});
```

#### 3.1.2 - Criar Hook
```typescript
// src/hooks/useSupplierRisk.ts
export function useSupplierRisk(supplierId?: string) {
  return useQuery({
    queryKey: ['supplier-risk', supplierId],
    queryFn: async () => {
      const { data } = await supabase
        .from('supplier_risk_assessments')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('assessment_date', { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    enabled: !!supplierId,
  });
}
```

#### 3.1.3 - Criar Componente de Dashboard
```typescript
// src/components/suppliers/SupplierRiskDashboard.tsx
```

### Verificação
- [ ] Criar Edge Function
- [ ] Criar useSupplierRisk hook
- [ ] Criar componente de visualização
- [ ] Integrar na página Fornecedores
- [ ] Adicionar alertas de alto risco

---

## 3.2 Melhorar Modelo de Previsão de Demanda
**Prioridade**: 🟡 MÉDIO  
**Esforço**: 6 horas  
**Status**: ⚠️ Modelo básico implementado

### Limitações Atuais
- Usa apenas média móvel simples
- Sem sazonalidade
- Sem fatores externos
- Sem machine learning

### Melhorias Propostas

```typescript
// supabase/functions/demand-forecast/index.ts

// 1. Adicionar sazonalidade
function calculateSeasonalFactor(dates: Date[]): number {
  const month = new Date().getMonth();
  const salesByMonth = new Array(12).fill(0);
  
  dates.forEach(d => salesByMonth[d.getMonth()]++);
  
  const avgMonthly = dates.length / 12;
  return salesByMonth[month] / avgMonthly || 1;
}

// 2. Adicionar detecção de tendência com regressão linear
function calculateTrendWithRegression(dates: Date[], values: number[]): number {
  // Implementar regressão linear simples
  const n = dates.length;
  const sumX = dates.reduce((sum, d, i) => sum + i, 0);
  const sumY = values.reduce((sum, v) => sum + v, 0);
  const sumXY = dates.reduce((sum, d, i) => sum + i * values[i], 0);
  const sumX2 = dates.reduce((sum, d, i) => sum + i * i, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
}

// 3. Adicionar fatores externos
interface ExternalFactors {
  hasPromotion: boolean;
  isHolidaySeason: boolean;
  marketGrowthRate: number;
}
```

### Verificação
- [ ] Implementar sazonalidade
- [ ] Implementar detecção de tendência
- [ ] Adicionar fatores externos
- [ ] Melhorar confidence intervals
- [ ] Testar com dados históricos

---

## 3.3 Remover ESLint Disables e @ts-ignore
**Prioridade**: 🟡 MÉDIO  
**Esforço**: 1 hora  
**Status**: ❌ 15 ocorrências em 3 arquivos

### Ocorrências

| Arquivo | Linha | Tipo |
|---------|-------|------|
| `src/components/settings/SoundSettingsTabs.tsx` | 66 | eslint-disable |
| `src/components/settings/SoundSettings.tsx` | 68 | eslint-disable |
| `src/components/analytics/PerformanceComparison.tsx` | 289 | @ts-ignore |

### Correções

```typescript
// src/components/settings/SoundSettingsTabs.tsx - Linha 66
// ANTES
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// DEPOIS - Adicionar dependências corretas ou usar useCallback
const playReadySound = useCallback(() => { ... }, []);
useEffect(() => {
  playReadySound();
}, [playReadySound]);
```

```typescript
// src/components/analytics/PerformanceComparison.tsx - Linha 289
// ANTES
// @ts-ignore
css={{ borderColor: `${ROLE_COLORS[benchmark.role]}30` }}

// DEPOIS - Usar style prop ou criar tipo customizado
style={{ borderColor: `${ROLE_COLORS[benchmark.role]}30` }}

// OU criar interface
interface ExtendedBadgeProps extends BadgeProps {
  style?: React.CSSProperties;
}
```

### Verificação
- [ ] Corrigir SoundSettingsTabs.tsx
- [ ] Corrigir SoundSettings.tsx
- [ ] Corrigir PerformanceComparison.tsx
- [ ] Executar `npm run lint` sem warnings

---

## 3.4 Remover Console.logs Desnecessários
**Prioridade**: 🟡 MÉDIO  
**Esforço**: 2 horas  
**Status**: ❌ 463 ocorrências em 40 arquivos

### Análise

| Tipo | Ocorrências | Ação |
|------|-------------|------|
| `console.log()` em DEV check | ~50 | ✅ Manter |
| `console.error()` em catch | ~200 | ✅ Manter |
| `console.warn()` em DEV check | ~30 | ✅ Manter |
| `console.log()` sem check | ~100 | ❌ Remover |
| Logs de celebração/debug | ~80 | ❌ Remover ou envolver em DEV |

### Padrão Correto

```typescript
// ✅ CORRETO - com check de DEV
if (import.meta.env.DEV) {
  console.log('[CircuitBreaker] State changed:', newState);
}

// ✅ CORRETO - error em catch
try { ... } catch (error) {
  console.error('Error fetching data:', error);
  throw error;
}

// ❌ ERRADO - log sem contexto
console.log(`🎉 Level Up overlay queued!`);

// ✅ CORRETO - envolver em DEV
if (import.meta.env.DEV) {
  console.log(`🎉 Level Up overlay queued!`);
}
```

### Arquivos para Limpar

| # | Arquivo | Logs a Remover |
|---|---------|----------------|
| 1 | `src/components/gamification/CelebrationOverlayProvider.tsx` | 3 |
| 2 | `src/hooks/usePushNotifications.ts` | 4 |
| 3 | `src/hooks/useTeams.ts` | 3 |
| 4 | `src/hooks/useDailyChallenges.ts` | 3 |

### Verificação
- [ ] Envolver logs de celebração em DEV check
- [ ] Verificar logs em hooks críticos
- [ ] Manter apenas console.error em catches
- [ ] Buscar por `console.log(` sem DEV check

---

## 3.5 Adicionar Skeleton Loaders Faltantes
**Prioridade**: 🟡 MÉDIO  
**Esforço**: 2 horas  
**Status**: ⚠️ Parcialmente implementado

### Páginas sem Skeleton

| Página | Status | Esforço |
|--------|--------|---------|
| `Fornecedores.tsx` | Usa `<Skeleton>` básico | 30min |
| `ComparadorPrecos.tsx` | Usa `<Skeleton>` básico | 30min |
| `PrevisaoDemanda.tsx` | Verificar | 30min |

### Implementação

```typescript
// src/components/skeletons/FornecedoresSkeleton.tsx
export function FornecedoresSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardContent className="p-0">
          <TableSkeleton rows={8} columns={6} />
        </CardContent>
      </Card>
    </div>
  );
}
```

### Verificação
- [ ] Criar FornecedoresSkeleton
- [ ] Criar ComparadorPrecosSkeleton
- [ ] Integrar nos componentes
- [ ] Testar transições de loading

---

## 3.6 Melhorar ARIA Labels
**Prioridade**: 🟡 MÉDIO  
**Esforço**: 3 horas  
**Status**: ⚠️ 76 labels existentes, mas faltam em componentes custom

### Componentes sem ARIA adequado

| Componente | Problema |
|------------|----------|
| Cards de estatísticas | Sem role="region" |
| Gráficos Recharts | Sem aria-label descritivo |
| Badges de gamificação | Sem aria-label |
| Botões de ação | Alguns sem aria-label |

### Implementação

```tsx
// src/components/dashboard/StatCard.tsx
<Card 
  role="region" 
  aria-label={`Estatística: ${title}`}
  className="..."
>

// src/components/gamification/LevelBadge.tsx
<Badge 
  aria-label={`Nível ${level}: ${levelName}`}
  className="..."
>

// Gráficos Recharts
<ResponsiveContainer>
  <LineChart 
    role="img" 
    aria-label="Gráfico de evolução de vendas mostrando dados dos últimos 30 dias"
  >
```

### Verificação
- [ ] Adicionar aria-label em StatCards
- [ ] Adicionar aria-label em gráficos
- [ ] Adicionar aria-label em badges
- [ ] Testar com screen reader

---

# 🔵 PARTE 4: ITENS DE BAIXA PRIORIDADE

## 4.1 Documentação de API (Edge Functions)
**Prioridade**: 🔵 BAIXO  
**Esforço**: 4 horas

### Edge Functions para Documentar

| Function | Descrição |
|----------|-----------|
| `access-denied-alerts` | Alertas de acesso negado |
| `activity-goal-alerts` | Alertas de metas de atividade |
| `auto-reassign-inactive` | Reatribuição automática |
| `bitrix24-oauth` | OAuth Bitrix24 |
| `bitrix24-sync` | Sincronização Bitrix24 |
| `challenge-expiration-alerts` | Alertas de expiração |
| `check-lead-sla` | Verificação SLA de leads |
| `create-stagnant-tasks` | Criação de tarefas |
| `deal-probability` | Probabilidade de deals |
| `demand-forecast` | Previsão de demanda |
| `detect-at-risk-deals` | Detecção de deals em risco |
| `elevenlabs-stt` | Speech-to-Text |
| `elevenlabs-tts` | Text-to-Speech |
| `lead-scoring` | Scoring de leads |
| `next-best-action` | Próxima melhor ação |
| `push-subscribe` | Inscrição push |
| `rotate-daily-challenges` | Rotação de desafios |
| `sales-assistant-chat` | Chat assistente |
| `salesperson-coaching` | Coaching |
| `sdr-consecutive-alerts` | Alertas SDR |
| `send-alert-notifications` | Envio de alertas |
| `send-push-notification` | Envio push |

---

## 4.2 ERD Atualizado do Banco
**Prioridade**: 🔵 BAIXO  
**Esforço**: 2 horas

### Tabelas para Documentar (60 total)
Usar ferramenta como dbdiagram.io ou Mermaid

---

## 4.3 Verificar Responsive em Novas Páginas
**Prioridade**: 🔵 BAIXO  
**Esforço**: 2 horas

### Páginas para Verificar
- Fornecedores (tabela em mobile)
- Comparador de Preços (tabela em mobile)
- Assinatura Digital
- Previsão de Demanda (gráficos)

---

## 4.4 Implementar Mais Atalhos de Teclado
**Prioridade**: 🔵 BAIXO  
**Esforço**: 2 horas

### Atalhos Existentes
- `useKanbanShortcuts.ts` para Pipeline

### Atalhos Sugeridos
| Atalho | Ação |
|--------|------|
| `Ctrl+K` | Busca global |
| `Ctrl+N` | Nova venda |
| `Ctrl+T` | Nova tarefa |
| `Esc` | Fechar modal |

---

# 📋 CRONOGRAMA DE IMPLEMENTAÇÃO

## Semana 1: Críticos
| Dia | Tarefa | Responsável |
|-----|--------|-------------|
| Seg | 1.1 VAPID Keys + 1.2 ElevenLabs | DevOps |
| Ter | 1.3 Leaked Password + 2.1 Extensions | DBA |
| Qua | 2.2 Refatorar `any` (50%) | Frontend |
| Qui | 2.2 Refatorar `any` (50%) | Frontend |
| Sex | 2.3 Cores hardcoded (50%) | Frontend |

## Semana 2: Alta Prioridade
| Dia | Tarefa | Responsável |
|-----|--------|-------------|
| Seg | 2.3 Cores hardcoded (50%) | Frontend |
| Ter | 2.4 Paginação em queries | Backend |
| Qua | 2.5 Testes unitários (50%) | QA |
| Qui | 2.5 Testes unitários (50%) | QA |
| Sex | 2.6 Testes E2E | QA |

## Semana 3: Média Prioridade
| Dia | Tarefa | Responsável |
|-----|--------|-------------|
| Seg | 3.1 Análise de Risco | Backend |
| Ter | 3.2 Previsão de Demanda | Backend |
| Qua | 3.3 ESLint + 3.4 Console.logs | Frontend |
| Qui | 3.5 Skeletons | Frontend |
| Sex | 3.6 ARIA Labels | Frontend |

## Semana 4: Baixa Prioridade
| Dia | Tarefa | Responsável |
|-----|--------|-------------|
| Seg-Ter | 4.1 Documentação API | Docs |
| Qua | 4.2 ERD | Docs |
| Qui | 4.3 Responsive | Frontend |
| Sex | 4.4 Atalhos de teclado | Frontend |

---

# 🏁 MÉTRICAS DE SUCESSO

| Métrica | Atual | Meta Semana 2 | Meta Final |
|---------|-------|---------------|------------|
| Secrets configuradas | 5/7 | 7/7 | 7/7 |
| Warnings Supabase Linter | 2 | 0 | 0 |
| Uso de `any` | 324 | < 100 | < 30 |
| Cores hardcoded | 547 | < 200 | 0 |
| Cobertura testes unit | 15% | 40% | 60% |
| Cobertura testes E2E | 10% | 25% | 40% |
| ESLint disables | 15 | 0 | 0 |
| Console.logs sem DEV | ~100 | 0 | 0 |
| Páginas com skeleton | 70% | 90% | 100% |
| ARIA labels coverage | 50% | 75% | 90% |

---

# ✅ ITENS JÁ IMPLEMENTADOS

## Funcionalidades
- ✅ **2.1 Assinatura Digital**: Tabelas `digital_signatures` e `document_signers` criadas com RLS
- ✅ **2.2 Histórico de Preços**: Tabelas `price_history` e `price_alerts` criadas com triggers

## Arquitetura
- ✅ Lazy loading em todas as páginas
- ✅ PWA com Service Worker
- ✅ Circuit Breaker implementado
- ✅ Design System robusto
- ✅ RLS bem implementado para 3 roles
- ✅ Integração Bitrix24 funcional
- ✅ Sistema de gamificação completo

---

*Documento gerado em 27/12/2024. Atualizar conforme itens forem implementados.*
