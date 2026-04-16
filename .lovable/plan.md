
Vou auditar o que existe antes de planejar.

**Auditado (já existe):**
- ✅ `MentionInput.tsx` + `MentionText` — input com @mentions e highlight
- ✅ `useDealChatHistory` — chat por deal (não-threaded)
- ✅ `usePlaybooks` — playbooks sem versionamento
- ✅ Notificações via `send_notification` RPC

**Gaps a implementar:**
- ❌ @mentions com **notificação real** disparada (hoje só renderiza)
- ❌ **Threaded comments** (parent_id, respostas aninhadas) em deals/clientes
- ❌ **Document collaboration** (embed Google Docs / Office 365 via URL)
- ❌ **Video messages** (gravação via MediaRecorder + upload Storage, estilo Loom)
- ❌ **Co-selling** (múltiplos owners + split %  de comissão)
- ❌ **Shared playbooks** com versionamento (snapshots imutáveis)
- ❌ **Deal rooms** (espaço compartilhado cliente↔vendedor com token público)

## Plano — Colaboração Avançada 360º

### 1. Migration (database)

**Tabelas novas:**
- `deal_comments` — id, deal_id, parent_comment_id (threaded), author_id, body, mentions uuid[], attachments jsonb, created_at, updated_at, edited_at
- `client_comments` — mesma estrutura para clientes/accounts
- `comment_reactions` — id, comment_id, user_id, emoji, created_at
- `deal_documents` — id, deal_id, title, provider (google_docs/office365/notion/figma), embed_url, added_by, created_at
- `video_messages` — id, owner_salesperson_id, deal_id (nullable), client_id (nullable), title, storage_path, duration_seconds, thumbnail_path, view_count, created_at
- `video_message_views` — id, video_id, viewer_email, viewed_at, watch_seconds
- `deal_co_owners` — id, deal_id, salesperson_id, role (primary/co_owner/sdr/specialist), commission_split_pct (numeric 0-100), created_at — constraint: soma <= 100 por deal (validação via trigger)
- `playbook_versions` — id, playbook_id, version_number, snapshot jsonb (items completos), changelog text, created_by, created_at
- `deal_rooms` — id, deal_id, public_token (uuid), title, welcome_message, is_active, expires_at, created_by, created_at
- `deal_room_resources` — id, room_id, type (document/video/proposal/link), title, url, sort_order
- `deal_room_messages` — id, room_id, sender_type (internal/client), sender_name, sender_email, body, created_at
- `deal_room_views` — id, room_id, viewer_ip, viewer_email, viewed_at

**Storage bucket:** `video-messages` (público para leitura via signed URL); `room-attachments`.

**RPC:**
- `notify_mentions(_comment_id, _entity_type)` — lê mentions e dispara `send_notification` para cada mencionado.
- `validate_co_owners_split()` (trigger) — garante soma ≤ 100.
- `snapshot_playbook_version(_playbook_id, _changelog)` — cria versão com snapshot dos items.
- `get_deal_room_by_token(_token)` (SECURITY DEFINER, anon-safe) — retorna room + resources + messages para acesso público.

**RLS:** admin/manager total; salesperson vê comentários/co_owners de seus deals; deal_rooms públicas via token (sem auth).

### 2. Edge Functions
- `mention-notifier` — recebe comment_id, extrai mentions, cria notifications + envia push se inscrito.
- `deal-room-public` — endpoint público (verify_jwt=false) que valida token e retorna dados do room para o cliente externo (sem login).

### 3. Hooks (`src/hooks/collaboration/`)
- `useDealComments.ts` / `useClientComments.ts` — listagem threaded, criar resposta, reagir
- `useDealDocuments.ts` — CRUD docs colaborativos
- `useVideoMessages.ts` — listar/criar (com upload Storage)
- `useDealCoOwners.ts` — adicionar/remover co-owners + split
- `usePlaybookVersions.ts` — listar versões, criar snapshot, restaurar
- `useDealRooms.ts` — CRUD rooms + recursos + mensagens
- `useVideoRecorder.ts` — wrapper MediaRecorder (screen+camera)

### 4. Componentes (`src/components/collaboration/`)
- `ThreadedCommentsPanel.tsx` — árvore de comentários com replies, reactions, @mentions (reaproveita `MentionInput`)
- `CommentThread.tsx` — node recursivo
- `DocumentCollaborationPanel.tsx` — lista + add embed (Google Docs/Office365/Notion) + iframe seguro
- `VideoMessageRecorder.tsx` — UI de gravação (screen/cam/mic), preview, upload
- `VideoMessagePlayer.tsx` — player + tracking de views
- `CoOwnersManager.tsx` — UI para adicionar co-owners + sliders de split (validação 100%)
- `PlaybookVersionsPanel.tsx` — timeline de versões + diff básico + restore
- `DealRoomManager.tsx` — criar room, copiar link público, gerenciar recursos
- `DealRoomPublicView.tsx` — página pública (rota separada) para cliente acessar via token

### 5. Integração nas telas existentes
- **DealDetailDialog/Drawer**: novas tabs "Comentários", "Documentos", "Vídeos", "Co-owners", "Deal Room"
- **ClientDetail**: tab "Comentários"
- **PlaybooksManager**: botão "Versões" + dialog `PlaybookVersionsPanel`

### 6. Rotas
- `/deal-room/:token` — pública (sem ProtectedRoute, sem layout) → renderiza `DealRoomPublicView`
- Adicionar em `AppRoutes.tsx` + `lazyPages.ts`

### 7. Padrões obrigatórios
- ≤400 linhas/arquivo (helpers em `*Helpers.ts`)
- Sora títulos / Inter body, tokens semânticos, dark
- Framer motion, skeleton, React.memo
- React Query 5min staleTime
- Strict TS, RLS, zero console errors
- Validação Zod em edge functions
- Sonner toasts em mutations

### 8. Validação pós-implementação
- Deploy edge functions
- Smoke test endpoints (mention-notifier, deal-room-public)
- Validar RLS via read_query
- Testar gravação de vídeo + upload + playback
- Testar criação de room + acesso público via token incógnito

Ordem de execução: migration → storage buckets → edge functions → hooks → componentes → integração nas telas → rota pública → testes.
