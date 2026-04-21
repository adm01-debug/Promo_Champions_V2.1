

## Sincronizar configurações do AtRisk com o perfil (cross-device)

### Objetivo
Hoje `useAtRiskSettings` persiste apenas no `localStorage` — trocar de navegador/dispositivo perde threshold, limit, maxVisible, filtros (severity/stage/keyword/reasonCodes) e modo debug. Sincronizar no backend para o perfil do usuário, mantendo `localStorage` como cache otimista offline.

### Estratégia: Local-first + sync server

LocalStorage continua sendo a **fonte síncrona** (UI nunca pisca). O backend é a **fonte canônica** quando disponível, com merge baseado em `updated_at`.

```text
Mount  → lê local (instantâneo) → fetch server em background
                                  ↓
                              server.updated_at > local? → adota server, regrava local
                              server vazio?              → push local para server
                              local mais novo?           → push local para server

Update → grava local imediato → debounce 800ms → push server
```

### Backend

#### Tabela `user_app_settings` (genérica, namespace por chave)

```sql
create table public.user_app_settings (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,                   -- ex: 'winloss-at-risk'
  value jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_app_settings enable row level security;

create policy "users read own settings"   on public.user_app_settings
  for select using (auth.uid() = user_id);
create policy "users insert own settings" on public.user_app_settings
  for insert with check (auth.uid() = user_id);
create policy "users update own settings" on public.user_app_settings
  for update using (auth.uid() = user_id);
create policy "users delete own settings" on public.user_app_settings
  for delete using (auth.uid() = user_id);

create trigger user_app_settings_touch
  before update on public.user_app_settings
  for each row execute function public.update_updated_at_column();
```

Tabela genérica (não específica de AtRisk) para reaproveitar em outras prefs futuras (ex.: ViewPrefs, layout do dashboard que ainda usa local). Chave = `'winloss-at-risk'`.

### Frontend

#### Novo helper `src/hooks/useSyncedSetting.ts`

Hook genérico reusável:

```ts
useSyncedSetting<T>({
  key: string,
  defaults: T,
  sanitize: (raw: unknown) => T,
  storageKey: string,        // localStorage cache key
  schemaVersion: number,
}) → { value, update, reset, syncStatus: 'idle'|'syncing'|'synced'|'offline' }
```

Internals:
- `useState` inicial = `localStorage` (instantâneo).
- `useEffect` no mount: `supabase.from('user_app_settings').select().eq('key', key).maybeSingle()`. Sem auth → modo local-only (`syncStatus: 'offline'`).
- Merge: se `server.updated_at > localUpdatedAt` adota server. Se server vazio ou local mais novo, push local.
- `update()` grava local imediato + debounce 800ms via `setTimeout` para `upsert` server (cancela pending no próximo update).
- Visibilidade: ao voltar foco (`visibilitychange`), refetch server (não-bloqueante) para detectar mudança em outro device.

#### Refatorar `useAtRiskSettings`

Mantém API pública intacta (`{ settings, update, reset, clearFilters }`) — apenas troca a implementação interna por `useSyncedSetting`. Adiciona `syncStatus` ao retorno (opcional consumir).

LocalStorage atual (`winloss-at-risk-settings` v4) continua válido como cache; migração v3→v4 já existe.

#### UI: indicador discreto de sync

No `AtRiskSettingsPopover`, adicionar pequeno texto no rodapé do popover:
- `🔄 Sincronizando…` enquanto pending
- `✓ Sincronizado` (subtle, 2s) após sucesso
- `⚠ Salvo só neste navegador` quando offline/sem auth (com tooltip explicando)

Sem badge no header do card — UI compacta, info só dentro do popover.

### Edge cases

1. **Sem login**: `syncStatus = 'offline'`, tudo funciona local. Ao logar depois, próximo mount sincroniza.
2. **Conflito de devices**: last-write-wins por `updated_at` (server). Aceitável para prefs (não dados críticos).
3. **Quota localStorage**: já tratado no `write()` existente (try/catch).
4. **Migração**: usuários atuais têm settings só em local → primeira execução pós-deploy faz push para server automaticamente (server vazio → adota local).
5. **Reset**: limpa local + `delete` na tabela.

### Arquivos

**Migration**
- Tabela `user_app_settings` + RLS + trigger `updated_at`.

**Novo**
- `src/hooks/useSyncedSetting.ts` — hook genérico local-first + sync.
- `src/test/hooks/useSyncedSetting.test.ts` — defaults, merge por updated_at, debounce, fallback offline, conflito de versão.

**Editado**
- `src/hooks/win-loss/useAtRiskSettings.ts` — usa `useSyncedSetting` por baixo, expõe `syncStatus`.
- `src/components/win-loss/AtRiskSettingsPopover.tsx` — rodapé com status de sync.

**Inalterados**
- `AtRiskDealsFromPatterns.tsx` (consome API pública igual).
- Backend (`detect-winloss-at-risk`) — zero mudança.

### Critério de aceite
1. Logado, mudar threshold para 60 no Chrome → abrir Firefox logado mesma conta → threshold = 60 após 1s.
2. Offline (sem internet) → mudanças persistem local; popover mostra "Salvo só neste navegador"; ao voltar online próximo update sincroniza.
3. Logout → settings continuam funcionando local; login com outra conta → carrega settings da outra conta.
4. Reset → limpa local e remove linha do server.
5. Conflito (mudança simultânea em 2 devices) → último update vence; aceitável.
6. Sem login → comportamento idêntico ao atual (zero regressão), `syncStatus = 'offline'`.
7. Suíte `useSyncedSetting` verde; suíte existente de `useAtRiskSettings`/`atRiskPresets`/`atRiskSeverityFilter` permanece verde (API pública preservada).

