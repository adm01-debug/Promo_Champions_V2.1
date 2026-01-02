# 🚀 Guia de Migração: Mock → Produção

## 📊 Status Atual

### ✅ Já Implementado (Produção)
- Integração Bitrix24 real
- Hooks de dados reais (useDealsReal, useContactsReal, useProductsReal)
- Error handling robusto
- Loading states
- Real-time sync Supabase
- Performance monitoring
- Logger estruturado
- Cache manager

### 🟡 Parcialmente Implementado
Alguns componentes ainda podem usar dados mockados para desenvolvimento.

## 🔍 Como Identificar Mocks

### Padrões Comuns de Mock
```typescript
// ❌ MOCK: Array hardcoded
const users = [
  { id: 1, name: "João" },
  { id: 2, name: "Maria" }
];

// ✅ REAL: Query ao banco/API
const { data: users } = useQuery(['users'], fetchUsers);
```

### Checklist de Verificação
- [ ] Procure por arrays hardcoded no código
- [ ] Busque por "mock", "fake", "test" nos nomes de funções
- [ ] Identifique dados com @example.com ou @test.com
- [ ] Verifique se há lorem ipsum em textos
- [ ] Confirme se imagens usam placeholder.com

## 🔧 Processo de Substituição

### 1. Identificar Mock
Localize o dado mockado no código.

### 2. Definir Fonte Real
Determine de onde virá o dado real:
- API Bitrix24?
- Banco Supabase?
- API externa?

### 3. Criar Hook Real
```typescript
// hooks/useUsersReal.ts
export function useUsersReal() {
  return useQuery({
    queryKey: ['users-real'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      if (error) throw error;
      return data;
    },
  });
}
```

### 4. Substituir no Componente
```typescript
// Antes
const users = mockUsers;

// Depois
const { data: users, isLoading } = useUsersReal();

if (isLoading) return <LoadingState />;
```

## 📋 Integrações Disponíveis

### Bitrix24 CRM
Use `src/lib/bitrix24.ts`:
```typescript
import { bitrix24 } from '@/lib/bitrix24';

// Negócios
const deals = await bitrix24.getDeals();

// Contatos
const contacts = await bitrix24.getContacts();

// Produtos
const products = await bitrix24.getProducts();
```

### Supabase
Hooks já disponíveis com real-time:
```typescript
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

// Query normal
const { data } = await supabase.from('table').select('*');

// Com real-time
useRealtimeSync('table', ['query-key']);
```

## ⚠️ Importantes

### Nunca em Produção
- ❌ Dados hardcoded
- ❌ Emails @example.com
- ❌ Senhas no código
- ❌ Tokens expostos
- ❌ Placeholder images

### Sempre Necessário
- ✅ Validação de dados
- ✅ Error handling
- ✅ Loading states
- ✅ Variáveis de ambiente
- ✅ Logs estruturados

## 🧪 Testes

Antes de considerar migrado:
1. Testar com dados reais de volume realista
2. Validar performance (< 2s para queries)
3. Confirmar error handling funciona
4. Verificar loading states aparecem
5. Garantir que não há console.log em produção

## 📞 Suporte

Dúvidas? Consulte:
- `src/lib/bitrix24.ts` - Cliente Bitrix24
- `src/hooks/use*Real.ts` - Hooks de dados reais
- `.env.example` - Variáveis necessárias
