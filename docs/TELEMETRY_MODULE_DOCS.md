# 📊 Módulo de Telemetria de Queries — Documentação Completa

> Guia exaustivo para implementação do sistema de monitoramento de performance de banco de dados em projetos Lovable/Supabase.

**Versão:** 1.0  
**Última atualização:** 23/03/2026  
**Cobertura de testes:** 229 testes automatizados (100% passando)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Schema do Banco de Dados](#3-schema-do-banco-de-dados)
4. [Edge Function — Coleta de Telemetria](#4-edge-function--coleta-de-telemetria)
5. [Frontend — Dashboard de Monitoramento](#5-frontend--dashboard-de-monitoramento)
6. [Componente de Gráficos (Recharts)](#6-componente-de-gráficos-recharts)
7. [Exportação de Relatórios (CSV + PDF)](#7-exportação-de-relatórios-csv--pdf)
8. [Políticas de Segurança (RLS)](#8-políticas-de-segurança-rls)
9. [Suíte de Testes](#9-suíte-de-testes)
10. [Guia de Implementação Passo a Passo](#10-guia-de-implementação-passo-a-passo)
11. [Configurações e Thresholds](#11-configurações-e-thresholds)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Visão Geral

O módulo de telemetria monitora automaticamente **todas as queries** executadas contra o banco de dados externo via Edge Function. Queries que excedem thresholds de performance (>3s ou >8s) ou que resultam em erro são **registradas automaticamente** na tabela `query_telemetry` do banco local (Lovable Cloud).

### Fluxo de Dados

```
[Frontend] → [Edge Function (bridge)] → [Banco Externo]
                    │
                    ├── Mede tempo de execução
                    ├── Classifica severidade (ok | slow | very_slow | error)
                    ├── Emite log estruturado no console
                    └── Persiste no banco local (fire-and-forget) se status ≠ ok
                            │
                            └── [query_telemetry table]
                                        │
                                        └── [Dashboard /admin/telemetria]
                                                ├── Cards de sumário
                                                ├── Gráficos de tendência
                                                ├── Tabela detalhada
                                                └── Exportação CSV/PDF
```

### Características Principais

- **Zero overhead para queries normais**: Somente queries lentas/com erro são persistidas
- **Fire-and-forget**: A persistência de telemetria NUNCA bloqueia a resposta ao frontend
- **Auto-refresh a cada 30s** no dashboard
- **Limpeza automática**: Dados com +7 dias podem ser removidos com um clique
- **Exportação completa**: CSV (compatível com Excel) e PDF (A4 landscape)
- **Filtros avançados**: Por severidade, período pré-definido ou datas personalizadas

---

## 2. Arquitetura

### Componentes

| Componente | Localização | Responsabilidade |
|---|---|---|
| `emitTelemetry()` | `supabase/functions/external-db-bridge/index.ts` | Classificação + log + persistência |
| `query_telemetry` | Tabela Supabase (local) | Armazenamento de dados |
| `AdminTelemetriaPage` | `src/pages/admin/AdminTelemetriaPage.tsx` | Dashboard principal |
| `TelemetryCharts` | `src/components/admin/telemetry/TelemetryCharts.tsx` | Gráficos de tendência |

### Diagrama de Dependências

```
AdminTelemetriaPage
├── TelemetryCharts (recharts)
├── @tanstack/react-query (data fetching + auto-refresh)
├── supabase client (query da tabela query_telemetry)
├── jsPDF + jspdf-autotable (exportação PDF)
├── date-fns (formatação de datas)
└── shadcn/ui (Card, Badge, Select, Calendar, Popover, Button, Skeleton)

external-db-bridge (Edge Function)
├── @supabase/supabase-js (client para banco externo + local)
├── emitTelemetry() (função interna)
└── performance.now() (medição de tempo)
```

---

## 3. Schema do Banco de Dados

### Tabela: `query_telemetry`

```sql
CREATE TABLE public.query_telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Identificação da query
  operation text NOT NULL,           -- 'select', 'insert', 'update', 'delete', 'rpc'
  table_name text,                   -- Nome da tabela consultada (null para RPCs)
  rpc_name text,                     -- Nome da função RPC (null para queries diretas)
  
  -- Métricas de performance
  duration_ms integer NOT NULL,      -- Tempo de execução em milissegundos
  severity text NOT NULL DEFAULT 'slow',  -- 'slow' | 'very_slow' | 'error'
  
  -- Contexto da query
  record_count integer,              -- Número de registros retornados
  query_limit integer,               -- LIMIT usado na query
  query_offset integer,              -- OFFSET usado na query
  count_mode text,                   -- 'exact' | 'planned' | 'none'
  
  -- Informações adicionais
  error_message text,                -- Mensagem de erro (se severity = 'error')
  user_id uuid                       -- ID do usuário que executou a query
);
```

### Migração SQL completa

```sql
-- Criar tabela
CREATE TABLE IF NOT EXISTS public.query_telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  operation text NOT NULL,
  table_name text,
  rpc_name text,
  duration_ms integer NOT NULL,
  severity text NOT NULL DEFAULT 'slow',
  record_count integer,
  query_limit integer,
  query_offset integer,
  count_mode text,
  error_message text,
  user_id uuid
);

-- Habilitar RLS
ALTER TABLE public.query_telemetry ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can read telemetry"
  ON public.query_telemetry FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete telemetry"
  ON public.query_telemetry FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can insert own telemetry"
  ON public.query_telemetry FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Índices recomendados para performance do dashboard
CREATE INDEX idx_query_telemetry_created_at ON public.query_telemetry (created_at DESC);
CREATE INDEX idx_query_telemetry_severity ON public.query_telemetry (severity);
CREATE INDEX idx_query_telemetry_table ON public.query_telemetry (table_name);
```

---

## 4. Edge Function — Coleta de Telemetria

### Constantes de Threshold

```typescript
const SLOW_QUERY_THRESHOLD_MS = 3000;       // Alerta: query > 3 segundos
const VERY_SLOW_QUERY_THRESHOLD_MS = 8000;   // Alerta crítico: query > 8 segundos
```

### Função `emitTelemetry()`

Esta é a função central do sistema. Deve ser chamada **após cada query** ao banco externo.

```typescript
function emitTelemetry(meta: {
  operation: string;       // 'select' | 'insert' | 'update' | 'delete' | 'rpc'
  table?: string;          // Nome da tabela (para queries diretas)
  rpcName?: string;        // Nome da função RPC
  limit?: number;          // LIMIT da query
  offset?: number;         // OFFSET da query
  countMode?: string;      // Modo de contagem usado
  durationMs: number;      // Tempo de execução (performance.now() delta)
  recordCount?: number;    // Registros retornados
  status: 'ok' | 'error' | 'slow' | 'very_slow';
  error?: string;          // Mensagem de erro (se houver)
  userId?: string | null;  // ID do usuário autenticado
}) {
  // 1. Gerar ícone visual baseado no status
  const icon = meta.status === 'very_slow' ? '🔴' 
             : meta.status === 'slow' ? '🟡' 
             : meta.status === 'error' ? '❌' 
             : '✅';
  
  // 2. Montar linha de log estruturada
  const target = meta.rpcName || meta.table || 'unknown';
  const line = `${icon} [telemetry] ${meta.operation}:${target} ${meta.durationMs}ms` +
    ` | records=${meta.recordCount ?? '-'}` +
    ` limit=${meta.limit ?? '-'}` +
    ` offset=${meta.offset ?? '-'}` +
    ` count=${meta.countMode ?? '-'}`;
  
  // 3. Emitir log com nível apropriado
  if (meta.status === 'very_slow') {
    console.warn(`⚠️ VERY SLOW QUERY: ${line}`);
  } else if (meta.status === 'slow') {
    console.warn(`⚠️ SLOW QUERY: ${line}`);
  } else if (meta.status === 'error') {
    console.error(line + ` error=${meta.error}`);
  } else {
    console.info(line);
  }

  // 4. PERSISTIR no banco local (somente se status ≠ 'ok')
  if (meta.status !== 'ok') {
    try {
      const localUrl = Deno.env.get('SUPABASE_URL');
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (localUrl && serviceKey) {
        const localClient = createClient(localUrl, serviceKey);
        // Fire-and-forget: não aguardar resposta
        localClient.from('query_telemetry').insert({
          operation: meta.operation,
          table_name: meta.table || null,
          rpc_name: meta.rpcName || null,
          duration_ms: meta.durationMs,
          record_count: meta.recordCount ?? null,
          query_limit: meta.limit ?? null,
          query_offset: meta.offset ?? null,
          count_mode: meta.countMode || null,
          severity: meta.status,
          error_message: meta.error || null,
          user_id: meta.userId || null,
        }).then(({ error: insertErr }) => {
          if (insertErr) console.warn('[telemetry-persist] Insert failed:', insertErr.message);
        });
      }
    } catch (e) {
      // Fire-and-forget: NUNCA bloquear a resposta principal
    }
  }
}
```

### Como Classificar o Status

```typescript
// Após medir o tempo da query:
const startTime = performance.now();
const { data, error } = await externalClient.from(table).select('*');
const durationMs = Math.round(performance.now() - startTime);

// Classificar
let status: 'ok' | 'error' | 'slow' | 'very_slow';
if (error) {
  status = 'error';
} else if (durationMs >= VERY_SLOW_QUERY_THRESHOLD_MS) {
  status = 'very_slow';
} else if (durationMs >= SLOW_QUERY_THRESHOLD_MS) {
  status = 'slow';
} else {
  status = 'ok';
}

// Emitir telemetria
emitTelemetry({
  operation: 'select',
  table: 'products',
  durationMs,
  status,
  recordCount: data?.length ?? 0,
  limit: 100,
  offset: 0,
  countMode: 'planned',
  error: error?.message,
  userId: authenticatedUserId,
});
```

### Padrão Completo de Uso (Select com Telemetria)

```typescript
// Dentro da Edge Function handler:
const selectStart = performance.now();
const { data: selectData, error: selectError, count } = await externalClient
  .from(table)
  .select(selectColumns, { count: countMode === 'none' ? undefined : countMode })
  .range(offset, offset + limit - 1);
const selectDuration = Math.round(performance.now() - selectStart);

console.info(`Selected ${selectData?.length ?? 0} of ${count ?? 'n/a'} records from ${table}`);

if (selectError) {
  emitTelemetry({
    operation: 'select', table, limit, offset, countMode,
    durationMs: selectDuration, status: 'error', error: selectError.message
  });
  return new Response(JSON.stringify({ error: selectError.message }), {
    status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

const selectStatus = selectDuration >= VERY_SLOW_QUERY_THRESHOLD_MS ? 'very_slow'
  : selectDuration >= SLOW_QUERY_THRESHOLD_MS ? 'slow' : 'ok';
emitTelemetry({
  operation: 'select', table, limit, offset, countMode,
  durationMs: selectDuration, status: selectStatus,
  recordCount: selectData?.length ?? 0
});
```

---

## 5. Frontend — Dashboard de Monitoramento

### Rota

```
/admin/telemetria
```

### Arquivo Principal

`src/pages/admin/AdminTelemetriaPage.tsx`

### Dependências

```typescript
import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TelemetryCharts } from "@/components/admin/telemetry/TelemetryCharts";
```

### Interface de Dados

```typescript
interface TelemetryRow {
  id: string;
  operation: string;
  table_name: string | null;
  rpc_name: string | null;
  duration_ms: number;
  record_count: number | null;
  query_limit: number | null;
  query_offset: number | null;
  count_mode: string | null;
  severity: string;              // 'slow' | 'very_slow' | 'error'
  error_message: string | null;
  user_id: string | null;
  created_at: string;
}
```

### Filtros Suportados

```typescript
type SeverityFilter = "all" | "slow" | "very_slow" | "error";
type TimeFilter = "1h" | "6h" | "24h" | "7d" | "custom";
```

### Query de Dados (React Query)

```typescript
const { data: rows = [], isLoading, refetch, isRefetching } = useQuery<TelemetryRow[]>({
  queryKey: ["query-telemetry", severityFilter, timeFilter, customDateFrom, customDateTo],
  queryFn: async () => {
    const { from, to } = getTimeThreshold();
    let query = supabase
      .from("query_telemetry")
      .select("*")
      .gte("created_at", from)
      .lte("created_at", to)
      .order("created_at", { ascending: false })
      .limit(500);

    if (severityFilter !== "all") {
      query = query.eq("severity", severityFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
  refetchInterval: 30000,  // Auto-refresh a cada 30 segundos
  staleTime: 10000,
});
```

### Cálculo de Estatísticas

```typescript
// Cards de sumário
const verySlow = rows.filter(r => r.severity === "very_slow").length;
const slow = rows.filter(r => r.severity === "slow").length;
const errors = rows.filter(r => r.severity === "error").length;
const avgDuration = rows.length > 0
  ? Math.round(rows.reduce((s, r) => s + r.duration_ms, 0) / rows.length)
  : 0;
```

### Cálculo de Top Offenders

```typescript
const tableStats = new Map<string, { count: number; totalMs: number; maxMs: number }>();
for (const r of rows) {
  const key = r.rpc_name || r.table_name || "unknown";
  const prev = tableStats.get(key) || { count: 0, totalMs: 0, maxMs: 0 };
  tableStats.set(key, {
    count: prev.count + 1,
    totalMs: prev.totalMs + r.duration_ms,
    maxMs: Math.max(prev.maxMs, r.duration_ms),
  });
}
const topOffenders = [...tableStats.entries()]
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 8);
```

### Formatadores

```typescript
const formatDuration = (ms: number) => {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
};

const formatTime = (iso: string) => {
  return new Date(iso).toLocaleString("pt-BR", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    day: "2-digit", month: "2-digit",
  });
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "very_slow":
      return <Badge className="bg-destructive/20 text-destructive">🔴 Muito Lenta</Badge>;
    case "slow":
      return <Badge className="bg-yellow-500/20 text-yellow-600">🟡 Lenta</Badge>;
    case "error":
      return <Badge className="bg-destructive/20 text-destructive">❌ Erro</Badge>;
  }
};
```

### Limpeza de Dados Antigos

```typescript
const handleCleanup = async () => {
  const threshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("query_telemetry").delete().lt("created_at", threshold);
  refetch();
};
```

---

## 6. Componente de Gráficos (Recharts)

### Arquivo

`src/components/admin/telemetry/TelemetryCharts.tsx`

### Props

```typescript
interface TelemetryChartsProps {
  rows: TelemetryRow[];
  timeFilter: string;
}
```

### Gráficos Incluídos

#### 1. Alertas ao Longo do Tempo (AreaChart empilhado)

Agrupa dados em buckets temporais baseados no filtro de período:

```typescript
const bucketMs = timeFilter === "1h" ? 5 * 60 * 1000    // 5 min
  : timeFilter === "6h" ? 30 * 60 * 1000                // 30 min
  : timeFilter === "24h" ? 60 * 60 * 1000               // 1 hora
  : 6 * 60 * 60 * 1000;                                 // 6 horas (para 7d)
```

**Séries:**
- `muitoLentas` (very_slow) — cor `hsl(var(--destructive))`
- `lentas` (slow) — cor `hsl(45, 93%, 47%)` (amarelo)
- `erros` (error) — cor `hsl(0, 84%, 60%)` (vermelho)

#### 2. Duração Média / Máxima (AreaChart)

**Séries:**
- `maxMs` — Duração máxima no bucket
- `mediaMs` — Duração média no bucket

#### 3. Alertas por Tabela (BarChart horizontal)

Mostra as top 8 tabelas com mais alertas, usando layout `vertical`.

### Formatação de Tempo nos Eixos

```typescript
function formatBucketTime(ts: number, timeFilter: string): string {
  const d = new Date(ts);
  if (timeFilter === "7d") {
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
```

---

## 7. Exportação de Relatórios (CSV + PDF)

### Exportação CSV

```typescript
const handleExportCSV = () => {
  const headers = [
    "Data/Hora", "Operação", "Tabela/RPC", "Duração (ms)", "Severidade",
    "Registros", "Limit", "Offset", "Count Mode", "Erro"
  ];

  const csvRows = rows.map(r => [
    new Date(r.created_at).toLocaleString("pt-BR"),
    r.operation,
    r.table_name || r.rpc_name || "-",
    r.duration_ms,
    r.severity,
    r.record_count ?? "-",
    r.query_limit ?? "-",
    r.query_offset ?? "-",
    r.count_mode ?? "-",
    (r.error_message || "").replace(/"/g, '""'),
  ]);

  // BOM UTF-8 para compatibilidade com Excel
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  // ... download automático
};
```

**Detalhes importantes:**
- **BOM UTF-8** (`\uFEFF`) no início do arquivo para Excel reconhecer acentos
- Aspas duplas escapadas no campo de erro
- Nome do arquivo: `telemetria_YYYY-MM-DD_filtro.csv`

### Exportação PDF

```typescript
const handleExportPDF = async () => {
  const { default: jsPDF } = await import("jspdf");          // Dynamic import
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Cabeçalho
  doc.setFontSize(16);
  doc.text("Telemetria de Queries", 14, 15);
  doc.setFontSize(9);
  doc.text(`Exportado em ${now.toLocaleString("pt-BR")} · Período: ${periodLabel}`, 14, 22);

  // Tabela
  autoTable(doc, {
    head: [headers],
    body,
    startY: 28,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [41, 37, 36], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 244] },
  });

  doc.save(`telemetria_${date}_${filter}.pdf`);
};
```

**Dependências:**
- `jspdf` (v4.2.1+)
- `jspdf-autotable` (v5.0.7+)

---

## 8. Políticas de Segurança (RLS)

```sql
-- Somente admins podem LER dados de telemetria
CREATE POLICY "Admins can read telemetry"
  ON public.query_telemetry FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Somente admins podem DELETAR dados de telemetria  
CREATE POLICY "Admins can delete telemetry"
  ON public.query_telemetry FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Edge function insere com service_role_key (bypass RLS)
-- Frontend pode inserir com user_id = auth.uid()
CREATE POLICY "Authenticated users can insert own telemetry"
  ON public.query_telemetry FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
```

**Nota:** A Edge Function usa `SUPABASE_SERVICE_ROLE_KEY` para inserir, o que faz bypass de RLS. A policy de INSERT existe para cenários onde telemetria é enviada diretamente pelo frontend.

---

## 9. Suíte de Testes

### Visão Geral: 229 Testes

| Arquivo | Testes | Escopo |
|---|---|---|
| `tests/lib/telemetry-logic.test.ts` | 77 | Lógica pura: thresholds, severidade, offenders, formatação, CSV/PDF, buckets |
| `tests/components/TelemetryCharts.test.tsx` | 38 | Componente de gráficos: rendering, dados, responsividade |
| `tests/pages/AdminTelemetriaPage.test.tsx` | 47 | Página completa: UI, filtros, exportação, interações |
| `tests/lib/external-db-bridge-telemetry.test.ts` | 67 | Edge function: emitTelemetry, classificação, cache, mapeamento |

### Padrão de Teste: Lógica Pura

Como a lógica de telemetria está tanto na Edge Function (Deno) quanto no frontend (React), os testes **replicam as funções puras** para validar sem runtime Deno:

```typescript
// tests/lib/telemetry-logic.test.ts
function classifySeverity(durationMs: number, hasError: boolean): string {
  if (hasError) return 'error';
  if (durationMs >= 8000) return 'very_slow';
  if (durationMs >= 3000) return 'slow';
  return 'ok';
}

describe('classifySeverity', () => {
  it('returns ok for fast queries', () => {
    expect(classifySeverity(200, false)).toBe('ok');
  });
  it('returns slow for 3s+ queries', () => {
    expect(classifySeverity(3000, false)).toBe('slow');
  });
  it('returns very_slow for 8s+ queries', () => {
    expect(classifySeverity(8000, false)).toBe('very_slow');
  });
  it('returns error when hasError is true regardless of duration', () => {
    expect(classifySeverity(100, true)).toBe('error');
  });
});
```

### Padrão de Teste: Componentes React

```typescript
// tests/components/TelemetryCharts.test.tsx
import { render, screen } from '@testing-library/react';
import { TelemetryCharts } from '@/components/admin/telemetry/TelemetryCharts';
import { BrowserRouter } from 'react-router-dom';

const wrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

it('renders charts when data is provided', () => {
  const rows = [
    { id: '1', duration_ms: 5000, severity: 'slow', table_name: 'products', 
      rpc_name: null, created_at: new Date().toISOString() }
  ];
  render(<TelemetryCharts rows={rows} timeFilter="24h" />, { wrapper });
  expect(screen.getByText('Alertas ao Longo do Tempo')).toBeInTheDocument();
});
```

### Executar Todos os Testes

```bash
npm test -- tests/lib/telemetry-logic.test.ts \
  tests/components/TelemetryCharts.test.tsx \
  tests/pages/AdminTelemetriaPage.test.tsx \
  tests/lib/external-db-bridge-telemetry.test.ts
```

---

## 10. Guia de Implementação Passo a Passo

### Passo 1: Criar a tabela `query_telemetry`

Execute a migração SQL da [Seção 3](#3-schema-do-banco-de-dados).

### Passo 2: Adicionar a função `has_role()` (se não existir)

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### Passo 3: Adicionar telemetria à Edge Function

1. Copie as constantes de threshold
2. Copie a função `emitTelemetry()`
3. Envolva cada query com medição de tempo:

```typescript
const start = performance.now();
const { data, error } = await client.from(table).select('*');
const duration = Math.round(performance.now() - start);

const status = error ? 'error'
  : duration >= 8000 ? 'very_slow'
  : duration >= 3000 ? 'slow'
  : 'ok';

emitTelemetry({ operation: 'select', table, durationMs: duration, status, ... });
```

### Passo 4: Instalar dependências do frontend

```bash
npm install recharts jspdf jspdf-autotable date-fns
```

### Passo 5: Criar a página do dashboard

1. Copie `AdminTelemetriaPage.tsx` para `src/pages/admin/`
2. Copie `TelemetryCharts.tsx` para `src/components/admin/telemetry/`
3. Adicione a rota no router:

```typescript
<Route path="/admin/telemetria" element={<AdminTelemetriaPage />} />
```

### Passo 6: Configurar secrets na Edge Function

A Edge Function precisa acessar o banco local para persistir dados:

- `SUPABASE_URL` — URL do projeto Supabase local
- `SUPABASE_SERVICE_ROLE_KEY` — Chave de serviço (para bypass de RLS)

### Passo 7: Executar testes

Copie os 4 arquivos de teste e execute para validar a implementação.

---

## 11. Configurações e Thresholds

| Configuração | Valor | Onde |
|---|---|---|
| Threshold lento | 3.000 ms | Edge Function |
| Threshold muito lento | 8.000 ms | Edge Function |
| Auto-refresh do dashboard | 30.000 ms | Frontend (React Query) |
| Stale time dos dados | 10.000 ms | Frontend (React Query) |
| Limite de registros no dashboard | 500 | Frontend (query) |
| Retenção de dados (limpeza manual) | 7 dias | Frontend (handleCleanup) |
| Top offenders exibidos | 8 | Frontend (topOffenders) |
| Bucket size (1h) | 5 min | TelemetryCharts |
| Bucket size (6h) | 30 min | TelemetryCharts |
| Bucket size (24h) | 1 hora | TelemetryCharts |
| Bucket size (7d) | 6 horas | TelemetryCharts |

### Ajustando Thresholds

Para ajustar os limites de alerta, modifique as constantes na Edge Function:

```typescript
// Mais sensível (detecta queries acima de 2s):
const SLOW_QUERY_THRESHOLD_MS = 2000;
const VERY_SLOW_QUERY_THRESHOLD_MS = 5000;

// Menos sensível (somente queries acima de 5s):
const SLOW_QUERY_THRESHOLD_MS = 5000;
const VERY_SLOW_QUERY_THRESHOLD_MS = 15000;
```

---

## 12. Troubleshooting

### Dashboard vazio (nenhuma query registrada)

1. **Verificar se a Edge Function está emitindo telemetria**: Cheque os logs da Edge Function por linhas `[telemetry]`
2. **Verificar secrets**: `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` devem estar configurados
3. **Verificar RLS**: O usuário logado deve ter role `admin` para ver dados
4. **Verificar período**: O filtro padrão é "24h" — se as queries lentas foram há mais tempo, ajuste o filtro

### Insert de telemetria falhando

- Mensagem `[telemetry-persist] Insert failed`: Checar se a tabela `query_telemetry` existe e as columns batem
- A inserção é **fire-and-forget**: erros aqui NUNCA afetam a resposta ao frontend

### Performance do dashboard

- O dashboard carrega no máximo **500 registros** por vez
- Se o volume de alertas for muito alto, considere aumentar os thresholds
- A limpeza manual remove dados com +7 dias

### Gráficos não aparecem

- Os gráficos só renderizam quando há **1+ registros** nos dados filtrados
- Verificar se `recharts` está instalado: `npm list recharts`

---

## Apêndice: Formato dos Logs

### Log no Console da Edge Function

```
✅ [telemetry] select:products 245ms | records=50 limit=50 offset=0 count=planned
🟡 [telemetry] select:product_images 3500ms | records=200 limit=200 offset=0 count=none
🔴 [telemetry] select:categories 9200ms | records=85 limit=100 offset=0 count=exact
❌ [telemetry] rpc:get_products_by_category 150ms | records=- limit=- offset=- count=- error=relation does not exist
```

### Formato:
```
{icon} [telemetry] {operation}:{target} {duration}ms | records={count} limit={limit} offset={offset} count={countMode}
```

---

*Documentação gerada automaticamente para uso interno. Todos os snippets de código são extraídos diretamente do sistema em produção.*
