

## Teste do modo Personalizar — drag-and-drop, persistência e fallback

Objetivo: validar que o `DashboardLayoutEditor` (a) persiste a ordem por usuário em `user_winloss_preferences.layout`, (b) renderiza na ordem salva no próximo carregamento, e (c) lida graciosamente com widgets desativados/ausentes (fallback sem crash, novos widgets aparecendo no final).

---

### Estado verificado no código

`src/hooks/win-loss/useUserDashboardLayout.ts`:
- Lê `layout` da tabela `user_winloss_preferences` por `user_id`.
- Se vazio/inválido → retorna `DEFAULT_LAYOUT` (17 widgets).
- Se salvo → faz merge: `[...stored, ...DEFAULT_LAYOUT.filter(w => !stored.includes(w))]` (anexa novos widgets ao fim — bom).
- `save` faz upsert.

`src/components/win-loss/DashboardLayoutEditor.tsx`:
- Modo view: `layout.map(id => widgets[id] ? <node /> : null)` — fallback OK quando widget não existe no objeto.
- Modo edit: `DndContext` + `SortableContext` vertical + `arrayMove` em `onDragEnd`.
- Sensors: Pointer (4px) + Keyboard (acessível).
- Botões: Personalizar / Cancelar / Padrão (reset DEFAULT) / Salvar.

Lacunas identificadas:
1. **Sem cobertura de teste** automatizada do hook nem do editor.
2. **Persistência não-validada** end-to-end com `user_winloss_preferences` real.
3. **Não há verificação** de que a página `WinLossIntelligence` consome `layout` na ordem correta.
4. **Edição mostra apenas linhas no editor** — usuário não vê preview dos widgets reordenados antes de salvar (perda de feedback visual).

---

### Plano de execução

#### 1. Testes unitários do hook `useUserDashboardLayout`
Arquivo novo `src/test/hooks/useUserDashboardLayout.test.ts` cobrindo:
- Sem usuário autenticado → retorna `DEFAULT_LAYOUT`.
- Usuário sem registro → retorna `DEFAULT_LAYOUT`.
- Layout salvo válido → retorna na ordem salva.
- Layout salvo com widgets faltantes (ex: novos adicionados depois) → anexa ao fim.
- Layout salvo array vazio/null → fallback `DEFAULT_LAYOUT`.
- `save` faz upsert com `user_id` + `layout` + `updated_at`.

Mock de `supabase.auth.getUser` e `supabase.from('user_winloss_preferences')`.

#### 2. Testes unitários do `DashboardLayoutEditor`
Arquivo novo `src/test/components/winloss/DashboardLayoutEditor.test.tsx`:
- Renderiza widgets na ordem do `layout`.
- Botão "Personalizar" entra em modo edição (mostra grips + Salvar/Cancelar/Padrão).
- Cancelar restaura ordem anterior (sem salvar).
- Botão "Padrão" reseta o `draft` para `DEFAULT_LAYOUT`.
- Salvar invoca `save` com a ordem do `draft`.
- View mode: widget id que não existe em `widgets` é ignorado silenciosamente (fallback).
- View mode: widget desativado (não passado em `widgets`) não quebra o layout.

Wrap com `QueryClientProvider`. Para drag, simular reorder via mock direto de `setDraft` (dnd-kit é difícil de testar via JSDOM — testar a função pura `arrayMove` separadamente já cobre a lógica).

#### 3. Teste E2E Playwright (`tests/e2e/win-loss/personalize-layout.spec.ts`)
- Autenticar como usuário admin (reusar helper).
- Navegar `/win-loss-intelligence`.
- Capturar ordem inicial dos data-attributes dos widgets.
- Click "Personalizar" → arrastar primeiro widget para 3ª posição usando `page.dragAndDrop`.
- Click "Salvar" → toast "Layout salvo".
- Recarregar a página → conferir que a nova ordem persiste.
- Click "Personalizar" → "Padrão" → "Salvar" → conferir que volta ao `DEFAULT_LAYOUT`.

Adicionar `data-widget-id={id}` nos wrappers do view mode em `DashboardLayoutEditor` para tornar a asserção robusta.

#### 4. Validação real com `supabase--read_query`
Antes/depois de cada cenário E2E, ler `user_winloss_preferences` para o user de teste e logar o array `layout`.

#### 5. Pequenas melhorias UX no editor (impacto baixo, ganho alto)
- Adicionar `data-widget-id` no view mode (para testes + analytics).
- Mostrar contador "X/Y widgets" no editor.
- Mensagem visual quando `draft` for igual ao `layout` salvo (Salvar fica `disabled`).

#### 6. Verificações finais
- `tsc --noEmit` zero erros.
- `vitest run src/test/hooks/useUserDashboardLayout.test.ts src/test/components/winloss/DashboardLayoutEditor.test.tsx` passando.
- Atualizar `mem://features/winloss-webhook-observability` com nota cruzada → criar `mem://features/winloss-personalized-layout`.

### Detalhes técnicos
- **Sem migrations**, sem novos secrets.
- Sem novas dependências (dnd-kit já instalado).
- `arrayMove` testado indiretamente via dnd-kit (suficiente).
- Para drag E2E em Playwright + dnd-kit, usar `mouse.down/move/up` se `dragAndDrop` falhar (dnd-kit precisa de movimentos intermediários).

### Ordem (sequencial, sem pausas)
1. Adicionar `data-widget-id` no view mode + UX (counter, save disabled).
2. Testes unitários do hook.
3. Testes unitários do editor.
4. E2E spec `personalize-layout.spec.ts`.
5. Validação no banco (`supabase--read_query` antes/depois).
6. `tsc --noEmit` + `vitest run` dos novos testes + atualização de memória.

