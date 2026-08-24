# Relatório de Análise Técnica de Back-End — Promo Champions v2

> **Data:** 2026-05-20  
> **Escopo:** Arquitetura completa do sistema (Edge Functions, banco de dados, integrações, segurança, performance, manutenibilidade)  
> **Analista:** Revisão Sênior de Back-End

---

## Sumário Executivo

O sistema **Promo Champions v2** é uma plataforma CRM/Gamificação construída sobre **React + Vite + Supabase (PostgreSQL + Edge Functions Deno)**. O projeto apresenta uma cobertura funcional impressionante — **~140 Edge Functions**, **432 migrações SQL**, **1.912 arquivos TypeScript** — demonstrando alta produtividade de desenvolvimento. Contudo, a velocidade de entrega introduziu **falhas críticas de segurança** que, se exploradas, permitem acesso irrestrito a dados de clientes, manipulação de CRM e uso indevido da infraestrutura cloud.

### Principais Riscos

| # | Problema | Severidade | Impacto |
|---|----------|------------|---------|
| 1 | Credenciais reais no `.env` commitado ao repositório | 🔴 CRÍTICO | Segurança |
| 2 | SSRF sem autenticação em `simulate-load` | 🔴 CRÍTICO | Segurança |
| 3 | Funções CRM sem autenticação (`bitrix24-sync`, `dispatch-webhook`) | 🔴 CRÍTICO | Segurança |
| 4 | `external-db-bridge`: proxy de banco arbitrário sem allowlist | 🔴 CRÍTICO | Segurança |
| 5 | RLS permissivo (`USING (true)`) em tabelas sensíveis de escrita | 🔴 CRÍTICO | Segurança |
| 6 | CORS wildcard (`*`) em todas as Edge Functions | 🟠 ALTA | Segurança |
| 7 | N+1 queries em `bitrix24-sync` (loop por registro) | 🟠 ALTA | Performance |
| 8 | `getActivityStats` carrega todos os registros em memória | 🟠 ALTA | Performance |
| 9 | 20+ Edge Functions sem qualquer verificação de autenticação | 🟠 ALTA | Segurança |
| 10 | 122 funções usando `SUPABASE_SERVICE_ROLE_KEY` desnecessariamente | 🟠 ALTA | Segurança |

---

## 1. Segurança

### 1.1 Credenciais Reais no Repositório (🔴 CRÍTICO)

**Arquivo:** `.env` (raiz do projeto)

**Evidência:**
```env
VITE_SUPABASE_PROJECT_ID="rapjswienfhkobhlamxb"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://rapjswienfhkobhlamxb.supabase.co"
```

O arquivo `.env` com valores reais de produção está commitado no histórico Git. Embora a `PUBLISHABLE_KEY` seja pública por design, o **Project ID** e a URL do projeto expostos permitem mapeamento da infraestrutura e são pré-requisito para ataques subsequentes.

**Impacto:** Qualquer pessoa com acesso ao repositório obtém credenciais do ambiente de produção. O histórico Git permanece mesmo após remoção do arquivo.

**Recomendação:**
```bash
# 1. Revogar e regenerar todas as chaves no painel Supabase
# 2. Remover do histórico Git
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Garantir que .gitignore cubra .env
echo ".env" >> .gitignore

# 4. Usar GitHub Secrets / Vault para variáveis de ambiente
```

---

### 1.2 SSRF sem Autenticação em `simulate-load` (🔴 CRÍTICO)

**Arquivo:** `supabase/functions/simulate-load/index.ts`

**Evidência:**
```typescript
serve(async (req) => {
  // NENHUMA verificação de autenticação
  const { concurrency = 10, total = 100, targetUrl } = await req.json();
  
  // fetch para qualquer URL fornecida pelo atacante
  const res = await fetch(targetUrl, {
    method: "POST",
    body: JSON.stringify({ event: "load_test", ts: Date.now() }),
  });
});
```

Esta função é um **Server-Side Request Forgery (SSRF)** completo. Qualquer pessoa na internet pode:
- Fazer requisições POST para URLs internas da rede da Supabase
- Usar a função como proxy para atacar serviços de terceiros (DDoS amplificado)
- Realizar port scanning interno
- Exfiltrar metadados de cloud (AWS IMDS: `http://169.254.169.254/...`)

**Impacto:** Comprometimento da infraestrutura, abuso de recursos cloud, responsabilidade legal por ataques DDoS gerados a partir da conta Supabase.

**Recomendação:**
```typescript
// 1. Adicionar autenticação obrigatória
const authHeader = req.headers.get("Authorization");
if (!authHeader) return new Response("Unauthorized", { status: 401 });

// 2. Allowlist de domínios
const ALLOWED_DOMAINS = ["*.supabase.co", "sua-api.com"];
const url = new URL(targetUrl);
if (!ALLOWED_DOMAINS.some(d => url.hostname.endsWith(d.replace("*.", "")))) {
  return new Response("Forbidden: domain not allowed", { status: 403 });
}

// 3. Mover para uso interno somente (não expor publicamente)
```

---

### 1.3 Edge Functions Críticas sem Autenticação (🔴 CRÍTICO)

**Arquivos afetados:** `bitrix24-sync/index.ts`, `bitrix24-oauth/index.ts`, `dispatch-webhook/index.ts` e ~20 outras funções

**Evidência em `bitrix24-sync`:**
```typescript
serve(async (req) => {
  if (req.method === "OPTIONS") { /* ... */ }
  // ZERO verificação de autenticação
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  // Executa sync completo do CRM com chave de serviço
});
```

**Evidência em `dispatch-webhook`:**
```typescript
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  // ZERO verificação de autenticação
  const { event_type, payload } = body;
  // Dispara webhooks registrados com payloads arbitrários
});
```

**Funções sem qualquer verificação de auth (amostra):**
- `send-alert-notifications`, `customer-success-360`, `automation-suggestions`
- `execute-workflow`, `engagement-score-recompute`, `notify-ranking-position`
- `scheduled-reports-runner`, `check-lead-sla`, `calibrate-win-probability`
- `expansion-detector`, `demand-forecast`, `email-engagement-scorer`
- `coaching-intelligence`, `elevenlabs-tts`, `enrich-lead`, `territory-optimization`

**Impacto:**
- Qualquer atacante pode disparar sync completo Bitrix24→CRM (dados sobrescritos)
- Roubo/manipulação de tokens OAuth do Bitrix24
- Disparo de webhooks registrados com payloads maliciosos
- Consumo descontrolado de recursos e custos de API (ElevenLabs TTS, etc.)

**Recomendação:**
```typescript
// Padrão mínimo para todas as Edge Functions
async function requireAuth(req: Request): Promise<{ userId: string } | Response> {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return new Response("Unauthorized", { status: 401 });
  
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return new Response("Unauthorized", { status: 401 });
  
  return { userId: data.user.id };
}
```

---

### 1.4 `external-db-bridge`: Proxy de Banco Arbitrário (🔴 CRÍTICO)

**Arquivo:** `supabase/functions/external-db-bridge/index.ts`

**Evidência:**
```typescript
const { operation, table, rpcName, columns, filters, data: bodyData } = await req.json();

// Aceita qualquer nome de tabela sem allowlist
if (operation === "select") {
  let query = externalClient.from(table).select(selectColumns);
  // ...aplica filtros arbitrários
}

if (operation === "delete") {
  let q = externalClient.from(table).delete();
  // Apenas filtra por eq, sem verificar autorização por tabela
}
```

Esta função é um **proxy de banco de dados genérico** que aceita o nome da tabela, operação e filtros como parâmetros externos. Não há:
- Allowlist de tabelas permitidas
- Verificação de se o usuário tem permissão para a tabela específica
- Limitação de operações por role

**Impacto:** Qualquer usuário autenticado pode executar SELECT/INSERT/UPDATE/DELETE em qualquer tabela do banco externo, incluindo tabelas de configuração de sistema, segredos, tokens.

**Recomendação:**
```typescript
const ALLOWED_TABLES: Record<string, ("select" | "insert" | "update" | "delete")[]> = {
  "sales": ["select", "insert", "update"],
  "clients": ["select"],
  // ... lista explícita
};

if (!ALLOWED_TABLES[table]?.includes(operation)) {
  return new Response("Forbidden", { status: 403 });
}
```

---

### 1.5 Políticas RLS Permissivas em Tabelas Críticas (🔴 CRÍTICO)

**Arquivos:** múltiplas migrações

**Evidência:**
```sql
-- clients table (dados de clientes)
CREATE POLICY "Allow public read access to clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow public update to clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to clients" ON public.clients FOR DELETE USING (true);
CREATE POLICY "Allow public insert to clients" ON public.clients FOR INSERT WITH CHECK (true);

-- lead_scores (scores de leads)
ON public.lead_scores FOR UPDATE USING (true);
ON public.lead_scores FOR DELETE USING (true);

-- combo_tracking (trilha de gamificação)
CREATE POLICY "Anyone can update combo_tracking" ON public.combo_tracking FOR UPDATE TO authenticated USING (true);
```

Tabelas críticas de negócio (`clients`, `products`, `lead_scores`, `salesperson_commission_configs`) têm políticas de escrita que permitem qualquer usuário autenticado modificar ou deletar qualquer registro.

**Impacto:**
- Usuário A pode deletar registros de clientes do usuário B
- Qualquer vendedor pode manipular seus próprios scores de lead
- Dados de clientes acessíveis a todos sem segregação de tenant

**Recomendação:**
```sql
-- Segregação por organização/tenant
CREATE POLICY "Users can only update own clients" ON public.clients
  FOR UPDATE USING (
    organization_id = (SELECT organization_id FROM public.salespeople WHERE id = auth.uid())
  );

-- Ou por ownership
CREATE POLICY "Owner can update" ON public.clients
  FOR UPDATE USING (created_by = auth.uid());
```

---

### 1.6 CORS Wildcard (`*`) em Todas as Edge Functions (🟠 ALTA)

**Arquivo:** `supabase/functions/_shared/cors.ts`

**Evidência:**
```typescript
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",  // ← Permite QUALQUER origem
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, ...",
};
```

Todas as ~140 Edge Functions usam este header CORS sem restrição de origem. Isso significa que qualquer site malicioso pode fazer requisições autenticadas às APIs se o token JWT do usuário for obtido.

**Recomendação:**
```typescript
const ALLOWED_ORIGINS = [
  "https://seuapp.lovable.app",
  "https://seu-dominio.com",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Vary": "Origin",
    // ...
  };
}
```

---

### 1.7 `ai-copilot`: Acesso Anônimo com Fuga de Dados CRM (🟠 ALTA)

**Arquivo:** `supabase/functions/ai-copilot/index.ts`

**Evidência:**
```typescript
// Authenticate the request (optional - works for anonymous users too)
let user = null;
if (authHeader && !authHeader.endsWith(supabaseAnonKey)) {
  // ...
}
// Se não autenticado, continua e ainda executa queries com SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey); // SERVICE_ROLE_KEY!

// Qualquer salespersonId fornecido expõe dados do vendedor
const { data: salesperson } = await supabase
  .from("salespeople")
  .select("name, role, xp, level, commission_rate")
  .eq("id", salespersonId)  // ← parâmetro controlado pelo atacante
  .single();
```

Um atacante sem autenticação pode enumerar dados de qualquer vendedor fornecendo `salespersonId`, além de consultar tarefas, atividades e deals através do contexto de IA.

**Impacto:** Exfiltração de dados pessoais e comerciais sensíveis sem autenticação.

---

### 1.8 Uso Excessivo de `SUPABASE_SERVICE_ROLE_KEY` (🟠 ALTA)

**Evidência:**
```bash
# Resultado: 122 arquivos usando SERVICE_ROLE_KEY
grep -r "SUPABASE_SERVICE_ROLE_KEY" supabase/functions --include="*.ts" -l | wc -l
# 122
```

A `SERVICE_ROLE_KEY` bypassa **todas** as políticas RLS. Ela deve ser usada apenas para operações administrativas absolutamente necessárias. 122 funções usando esta chave significa que qualquer vulnerabilidade de autenticação em qualquer dessas funções resulta em acesso total ao banco.

**Recomendação:** Usar `SUPABASE_ANON_KEY` com o token JWT do usuário para a maioria das operações. Reservar a `SERVICE_ROLE_KEY` apenas para funções de background/cron que genuinamente precisam de acesso global (ex.: `rotate-daily-challenges`, `scheduled-reports-runner`).

---

## 2. Performance

### 2.1 N+1 Queries em `bitrix24-sync` (🟠 ALTA)

**Arquivo:** `supabase/functions/bitrix24-sync/index.ts`

**Evidência:**
```typescript
// Para CADA empresa retornada (potencialmente milhares):
for (const company of companies) {
  // Query 1: buscar icp_data existente
  const { data: existingIcp } = await supabase
    .from("icp_data").select("client_id").eq("bitrix_id", company.ID).single();

  if (existingIcp?.client_id) {
    // Query 2: update clients
    await supabase.from("clients").update({...}).eq("id", existingIcp.client_id);
    // Query 3: update icp_data
    await supabase.from("icp_data").update({...}).eq("bitrix_id", company.ID);
  } else {
    // Query 2: insert client
    const { data: newClient } = await supabase.from("clients").insert({...});
    // Query 3: insert icp_data
    await supabase.from("icp_data").insert({...});
  }
}
```

Para 500 empresas: **1.500 queries sequenciais**. O mesmo padrão ocorre em `syncDealsFromBitrix` e `syncDealsToBitrix`.

**Benchmark:** Uma sincronização com 1.000 registros pode levar >60 segundos (Edge Functions têm timeout de 150s para uso gratuito / até 540s para Pro). A Supabase cobra por compute time.

**Recomendação:**
```typescript
// 1. Buscar IDs existentes em uma única query
const { data: existingIcps } = await supabase
  .from("icp_data")
  .select("client_id, bitrix_id")
  .in("bitrix_id", companies.map(c => c.ID));

const existingMap = new Map(existingIcps?.map(i => [i.bitrix_id, i.client_id]));

// 2. Separar em updates e inserts
const toUpdate = companies.filter(c => existingMap.has(c.ID));
const toInsert = companies.filter(c => !existingMap.has(c.ID));

// 3. Batch upsert
await supabase.from("clients").upsert(toUpdate.map(mapToClient), { onConflict: "external_id" });
```

---

### 2.2 `getActivityStats`: Carrega Todos os Registros em Memória (🟠 ALTA)

**Arquivo:** `src/services/activityService.ts`

**Evidência:**
```typescript
async getActivityStats(salespersonId?: string): Promise<ActivityStats> {
  let query = supabase.from('activities').select('*'); // SEM LIMITE
  // ...
  const { data, error } = await query; // Fetches ALL records
  const activities = (data || []) as ActivityRecord[];
  // Toda a agregação é feita em JavaScript no cliente
  activities.forEach(a => { /* contagem em memória */ });
}
```

Para uma organização com 10.000 atividades, este método:
- Transfere todos os registros (payload potencialmente >5MB)
- Bloqueia a thread JS enquanto itera
- Ignora completamente os índices do banco

**Recomendação:**
```sql
-- Agregação no banco via RPC
CREATE OR REPLACE FUNCTION get_activity_stats(p_salesperson_id UUID DEFAULT NULL)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total', COUNT(*),
    'by_type', json_object_agg(activity_type, cnt),
    'today', COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)
  )
  FROM (
    SELECT activity_type, COUNT(*) as cnt
    FROM activities
    WHERE (p_salesperson_id IS NULL OR salesperson_id = p_salesperson_id)
    GROUP BY activity_type
  ) sub;
$$ LANGUAGE sql STABLE;
```

---

### 2.3 `activityService.getRecentActivities`: Limite Hardcoded de 100 (🟡 MÉDIA)

**Evidência:**
```typescript
async getRecentActivities(limit: number = 100): Promise<ActivityRecord[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')         // ← Todos os campos, inclusive potencialmente grandes (notes, metadata)
    .order('created_at', { ascending: false })
    .limit(limit);
```

`select('*')` em todas as atividades traz campos não necessários para listagem. Sem paginação cursor-based, o scroll infinito causará degradação progressiva.

**Recomendação:**
```typescript
// Usar apenas campos necessários + paginação por cursor
.select('id, activity_type, outcome, created_at, salesperson_id')
.lt('created_at', cursor)
.limit(20)
```

---

### 2.4 Ausência de Índices em Colunas de Filtragem Críticas (🟡 MÉDIA)

Nas migrações iniciais, tabelas como `sales` e `activities` são criadas sem índices em colunas frequentemente filtradas:

```sql
-- Ausente na migração inicial:
-- CREATE INDEX idx_activities_salesperson_id ON activities(salesperson_id);
-- CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
-- CREATE INDEX idx_sales_salesperson_id ON sales(salesperson_id);
-- CREATE INDEX idx_sales_status ON sales(status);
```

---

### 2.5 `telemetry.ts`: Signature Incorreta (🟡 MÉDIA)

**Arquivo:** `supabase/functions/_shared/telemetry.ts`

**Evidência:**
```typescript
export async function withTelemetry(
  fnName: string,
  handler: (req: Request) => Promise<Response>
): Promise<Response> {
  const start = Date.now();
  try {
    const response = await handler();  // ← handler() chamado SEM argumentos
    //                                       mas a assinatura diz (req: Request) => ...
```

O `withTelemetry` declara que `handler` recebe um `Request`, mas o invoca sem parâmetros. Qualquer função que use `withTelemetry` e tente usar `req` dentro do handler receberá `undefined`.

---

## 3. Banco de Dados

### 3.1 432 Migrações com Nomes UUID (🟡 MÉDIA)

```
supabase/migrations/20251212200226_932d9de6-0394-4b03-afef-1f3489abf03e.sql
supabase/migrations/20260418122352_0616b0f7-20cd-4165-b811-f996899f13df.sql
```

**Problemas:**
- Impossível identificar o propósito de uma migração pelo nome
- Sem convention de naming (`add_index_to_activities`, `create_webhooks_table`, etc.)
- 432 migrações geradas por ferramentas visuais (Lovable), sem revisão humana
- Ausência de scripts de rollback para nenhuma migração
- Migrações duplicadas com timestamps conflitantes (`20241231000000_saved_filters.sql` e `20250102_saved_filters.sql`)

**Recomendação:**
```
# Convenção de naming
YYYYMMDDHHMMSS_descricao_breve.sql

# Exemplo
20260520100000_add_salesperson_id_index_to_activities.sql
20260520110000_create_webhook_deliveries_table.sql

# Estrutura com rollback
-- migrate.sql: alterações
-- rollback.sql: reversão
```

---

### 3.2 Correspondência Frágil em `bitrix24-sync` (🟡 MÉDIA)

**Arquivo:** `supabase/functions/bitrix24-sync/index.ts`

**Evidência:**
```typescript
// Matching de deals por nome — extremamente frágil
const { data: existingSale } = await supabase
  .from("sales")
  .select("id")
  .eq("client_name", clientName)       // Strings podem variar ("João Silva" vs "joao silva")
  .eq("product_name", deal.TITLE)      // Não é campo único
  .single();
```

Se dois clientes com nomes similares tiverem deals com o mesmo título, o sistema irá sobrescrever o deal errado. O correto é usar o `BITRIX_ID` como chave de idempotência.

**Recomendação:**
```typescript
// Adicionar coluna external_id na tabela sales
// e fazer upsert por essa chave
await supabase.from("sales").upsert(
  { external_id: `bitrix24:${deal.ID}`, ...dealData },
  { onConflict: "external_id" }
);
```

---

### 3.3 Falta de Particionamento em Tabelas de Alto Volume (🟡 MÉDIA)

Tabelas como `activities`, `webhook_deliveries`, `query_telemetry` e `audit_log` não têm estratégia de particionamento ou TTL (Time-To-Live). Em produção com uso intenso, crescerão indefinidamente.

**Recomendação:**
```sql
-- Particionamento por mês para webhook_deliveries
CREATE TABLE webhook_deliveries (
  id UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- ...
) PARTITION BY RANGE (created_at);

CREATE TABLE webhook_deliveries_2026_05 PARTITION OF webhook_deliveries
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

-- TTL via pg_cron
SELECT cron.schedule('delete-old-webhook-deliveries', '0 2 * * *',
  'DELETE FROM webhook_deliveries WHERE created_at < NOW() - INTERVAL ''90 days''');
```

---

## 4. Integrações

### 4.1 `bitrix24-oauth`: Tokens Armazenados em Texto Plano (🟠 ALTA)

**Arquivo:** `supabase/functions/bitrix24-oauth/index.ts`

**Evidência:**
```typescript
await supabase.from("portfolio_settings").upsert([
  {
    setting_key: "bitrix24_access_token",
    setting_value: tokens.access_token,  // ← Token OAuth em texto plano na DB
  },
  {
    setting_key: "bitrix24_refresh_token",
    setting_value: tokens.refresh_token,  // ← Refresh token em texto plano
  },
]);
```

Tokens OAuth em texto plano em uma tabela com RLS provavelmente permissivo são facilmente exfiltráveis.

**Recomendação:** Usar Supabase Vault (`vault.secrets`) para armazenar segredos criptografados, ou criptografar com `pgcrypto` antes do armazenamento.

---

### 4.2 `send-password-reset`: Hardcode de URL de Redirect (🟡 MÉDIA)

**Arquivo:** `supabase/functions/send-password-reset/index.ts`

**Evidência:**
```typescript
redirectTo: `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/reset-password`,
```

Esta substituição de string é frágil e específica para o ambiente Lovable. Em produção com domínio customizado, o link de reset irá para o domínio errado.

---

### 4.3 Rate Limiting In-Memory em `report-embed-public` (🟡 MÉDIA)

**Arquivo:** `supabase/functions/report-embed-public/index.ts`

**Evidência:**
```typescript
const rateLimit = new Map<string, RateLimitEntry>();  // ← Variável global in-process
```

Edge Functions Deno são stateless e têm cold starts. Este Map é resetado a cada nova instância, tornando o rate limiting efetivamente inoperante em ambiente distribuído.

**Recomendação:** Implementar rate limiting via Redis/Upstash ou usando uma tabela Postgres com `pg_advisory_lock`.

---

### 4.4 Versões Inconsistentes de Dependências Deno (🟡 MÉDIA)

Diferentes funções usam versões distintas da lib padrão Deno:

```typescript
// Funções usando versão antiga (0.168.0):
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Funções usando versão mais recente (0.190.0, 0.224.0):
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
```

A `std@0.168.0` tem vulnerabilidades conhecidas fixadas em versões posteriores. A inconsistência também gera comportamento imprevisível.

**Recomendação:** Centralizar as importações em `_shared/deps.ts` com versões fixas e atualizadas.

---

## 5. Manutenibilidade

### 5.1 Escopo do Projeto Excessivo (🟡 MÉDIA)

```
1.912 arquivos TypeScript em src/
~140 Edge Functions Deno
432 migrações SQL
```

Para um projeto em estágio de produto, este volume é excepcionalmente alto. Os principais riscos:

- **Dead code:** Componentes e funções implementados mas não utilizados em produção
- **Cognitive overhead:** Dificulta onboarding e code review
- **Custo de manutenção:** Cada função precisa ser monitorada, atualizada, testada

**Recomendação:**
1. Auditoria de funções Edge não chamadas nos últimos 30 dias (via logs Supabase)
2. Análise de dead code com `ts-prune` ou similar
3. Consolidação de funções com responsabilidades similares

---

### 5.2 Dependências de Dev em `dependencies` (🟡 MÉDIA)

**Arquivo:** `package.json`

**Evidência:**
```json
"dependencies": {
  "@commitlint/cli": "^20.5.0",        // ← dev-only
  "@commitlint/config-conventional": "^20.5.0",  // ← dev-only
  "husky": "^9.1.7",                   // ← dev-only
  "lint-staged": "^16.4.0",            // ← dev-only
  "jsdom": "^29.1.1",                  // ← test-only
  "@testing-library/jest-dom": "^6.6.0",  // ← test-only
  "@testing-library/react": "^16.0.0",    // ← test-only
  "@testing-library/user-event": "^14.6.1",  // ← test-only
  "vitest": "^3.2.4"                   // ← test-only
}
```

Ferramentas de desenvolvimento e teste em `dependencies` são incluídas no bundle de produção, aumentando o tamanho do build desnecessariamente.

---

### 5.3 Cobertura de Testes Limitada (🟡 MÉDIA)

**Arquivos de teste identificados:**
- `src/test/bi-helpers.test.ts` (helpers BI)
- `src/test/csv-export.test.ts` (exportação CSV)
- `src/test/regressions.test.ts` (regressões)
- `supabase/functions/create-stagnant-tasks/index.test.ts`

Para um sistema com 1.912 arquivos e 140 Edge Functions, a cobertura de testes unitários/integração parece muito baixa. Não há testes para:
- Lógica de autenticação das Edge Functions
- Políticas RLS
- Webhook dispatch/retry
- Sincronização Bitrix24

---

### 5.4 Commit History Não Descritivo (🟢 BAIXA)

```
87c87a7 Fast Visual Edit
d06171e Changes
287bc90 Fast Visual Edit
5dbaff1 Changes
```

100% das mensagens de commit são geradas pela plataforma Lovable sem descrição semântica. Impossibilita rastreamento de mudanças ou rollback inteligente.

---

## 6. Operacionalidade

### 6.1 Telemetria Apenas via Console (🟡 MÉDIA)

**Arquivo:** `supabase/functions/_shared/telemetry.ts`

```typescript
console.info(`[TELEMETRY] ${fnName} success - duration: ${duration}ms`);
```

Toda a telemetria é via `console.log/error/info`. Isso significa:
- Sem alertas automáticos em falhas
- Sem dashboards de latência por função
- Sem correlação de traces entre requisições
- Logs perdidos após o período de retenção do Supabase (7 dias no plano gratuito)

**Recomendação:** Integrar com Datadog, Grafana Cloud, ou Sentry via webhook de logs da Supabase, ou usar OpenTelemetry com exportação para collector externo.

---

### 6.2 `withTelemetry` Não Está em Uso (🟡 MÉDIA)

A função `withTelemetry` em `_shared/telemetry.ts` está definida mas **não é importada por nenhuma Edge Function** (grep no codebase). A telemetria implementada em `external-db-bridge` é ad-hoc e não reutiliza o wrapper.

---

### 6.3 Ausência de Health Checks Padronizados (🟡 MÉDIA)

Das ~140 Edge Functions, apenas algumas possuem endpoints de health check. Não há:
- Endpoint `/health` padrão em todas as funções
- Verificação de conectividade com DB
- Monitoramento de latência via Uptime (ex.: UptimeRobot, Checkly)

---

### 6.4 Sem Retry/Dead Letter Queue para Webhooks (🟡 MÉDIA)

**Arquivo:** `supabase/functions/dispatch-webhook/index.ts`

O dispatcher registra falhas mas não há lógica de retry automático com backoff exponencial. Entregas com falha ficam registradas em `webhook_deliveries` mas não são reprocessadas automaticamente.

---

## 7. Custos

### 7.1 Chamadas AI Sem Cache (🟡 MÉDIA)

Funções como `ai-copilot`, `nlq-query` e `ai-agent-orchestrator` fazem chamadas ao gateway de IA para cada requisição sem nenhum cache. Perguntas idênticas geram custos repetidos.

**Recomendação:**
```typescript
// Cache de respostas AI com TTL curto para sugestões idênticas
const cacheKey = crypto.subtle.digest("SHA-256", 
  new TextEncoder().encode(JSON.stringify({ context, action, salespersonId }))
);
const cached = await kv.get(cacheKey);
if (cached) return cached;
```

---

### 7.2 `select('*')` Generalizado (🟡 MÉDIA)

Múltiplas funções e serviços usam `select('*')` trazendo todos os campos. Isso aumenta o consumo de bandwidth e custos de egress, especialmente em tabelas com campos JSONB grandes.

---

## 8. Lista de Prioridades (Roadmap de Correções)

### Sprint 1 — Imediato (Crítico)

| # | Ação | Esforço |
|---|------|---------|
| 1 | Revogar credenciais expostas no `.env`; remover do Git history | 2h |
| 2 | Adicionar autenticação obrigatória em `bitrix24-sync`, `bitrix24-oauth`, `dispatch-webhook`, `simulate-load` | 4h |
| 3 | Remover ou proteger `simulate-load` com allowlist de domínios | 1h |
| 4 | Adicionar allowlist de tabelas em `external-db-bridge` | 2h |
| 5 | Corrigir RLS de escrita em `clients`, `products`, `lead_scores` para segregação por tenant/owner | 4h |

### Sprint 2 — Curto Prazo (Alto Impacto)

| # | Ação | Esforço |
|---|------|---------|
| 6 | Restringir CORS para domínios específicos | 2h |
| 7 | Tornar autenticação obrigatória no `ai-copilot` | 1h |
| 8 | Auditoria: identificar e proteger as ~20 funções sem autenticação | 1 dia |
| 9 | Refatorar `bitrix24-sync` para usar batch upserts | 1 dia |
| 10 | Mover `getActivityStats` para RPC no banco de dados | 4h |
| 11 | Criptografar tokens OAuth no banco (Vault) | 4h |

### Sprint 3 — Médio Prazo (Qualidade)

| # | Ação | Esforço |
|---|------|---------|
| 12 | Corrigir `withTelemetry` e adotar em todas as funções | 4h |
| 13 | Implementar rate limiting distribuído via Postgres/Redis | 1 dia |
| 14 | Adicionar índices nas colunas críticas (`salesperson_id`, `created_at`) | 4h |
| 15 | Migrar dependências dev para `devDependencies` no `package.json` | 1h |
| 16 | Padronizar versões Deno std lib em `_shared/deps.ts` | 2h |
| 17 | Centralizar convenção de naming em novas migrações | 2h |

### Sprint 4 — Longo Prazo (Excelência Operacional)

| # | Ação | Esforço |
|---|------|---------|
| 18 | Implementar observabilidade com OpenTelemetry + Grafana Cloud | 2 dias |
| 19 | Adicionar retry automático com backoff em `dispatch-webhook` | 1 dia |
| 20 | Estratégia de particionamento + TTL para tabelas de alto volume | 1 dia |
| 21 | Cache de respostas AI para consultas idênticas | 1 dia |
| 22 | Auditoria de dead code e consolidação de Edge Functions | 3 dias |
| 23 | Cobertura de testes para autenticação e políticas RLS | 2 dias |

---

## 9. Benchmarking

| Aspecto | Promo Champions v2 | Padrão de Mercado |
|---------|---------------------|-------------------|
| Autenticação em Edge Functions | ~70% sem verificação explícita | 100% com token validation |
| Políticas RLS | `USING (true)` em tabelas críticas | Segmentação por `auth.uid()` ou tenant |
| CORS | `*` (wildcard) | Origin específico por ambiente |
| Gestão de segredos | Texto plano no banco | Vault / KMS |
| Observabilidade | `console.log` | OpenTelemetry + plataforma dedicada |
| Testes | <5 arquivos de teste | >70% cobertura de linha |
| Migrations | 432 migrações sem rollback | Semânticas com up/down |
| Batch operations | N+1 em sincronizações | Batch upsert com `onConflict` |

---

## Referências

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Vault](https://supabase.com/docs/guides/database/vault)
- [Deno Security Best Practices](https://deno.land/manual/runtime/security)
- [SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [PostgreSQL Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html)

---

*Relatório gerado por análise estática do código-fonte. Para validação completa, recomenda-se revisão dinâmica com testes de penetração e análise de logs de produção.*
