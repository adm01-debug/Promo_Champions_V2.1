# 🧩 Funcionalidades com Backend/Hook prontos mas SEM UI Completa

> Análise original gerada em **2026-04-16** cruzando `src/hooks/` com imports reais em `src/pages/` e `src/components/`.
> **Status revalidado em 2026-11-28** contra a `main` (`4f2fc32d8`): a seção "Backlog real" é a fonte
> atual; o restante do documento de abril ficou obsoleto e foi substituído pelos resultados da revarredura.

---

## ✅ Itens do documento original já entregues

| Item                                                                 | Situação verificada                                                                                                                                                                                                        |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/competencias` (`useCompetencyData`)                                | `src/pages/Competencias.tsx` roteada em `AppRoutes.tsx`                                                                                                                                                                    |
| Win/Loss dedicado (`useWinLossAnalysis`)                             | `src/pages/WinLossAnalysisPage.tsx` roteada                                                                                                                                                                                |
| Tempo de fechamento (`useClosingTime`)                               | `src/pages/ClosingTimePage.tsx` roteada                                                                                                                                                                                    |
| ROI (`useROIDashboard`)                                              | `src/pages/ROIDashboard.tsx` roteada                                                                                                                                                                                       |
| Galeria de badges (`useCollectibleBadges`)                           | `src/pages/BadgesGalleryPage.tsx` roteada                                                                                                                                                                                  |
| Perfil gamificado (`useGamifiedProfile`)                             | `src/pages/GamifiedProfilePage.tsx` roteada                                                                                                                                                                                |
| Territórios (`useTerritories`)                                       | `src/pages/Territorios.tsx` roteada                                                                                                                                                                                        |
| Hub de insights conversacionais                                      | `/conversational-intelligence/insights` (PR #768)                                                                                                                                                                          |
| Hubs CS 360, Enablement, Pricing, Territory Optimization, Race Arena | Roteados em `AppRoutes.tsx`                                                                                                                                                                                                |
| Relatórios de Funil e Cohort                                         | Estavam **aninhados** em `/relatorios` (só no `Outlet` de quem visita o índice); promovidos a rotas próprias `/relatorios/funil` e `/relatorios/cohort`, que é o que o menu e o `canonical` da própria página já apontavam |

## ✅ Hooks do documento que não existem no repositório

`useAICopilot`, `usePageAnalytics`, `usePWA`, `useAnnounce`, `useUnsavedChanges`,
`useCursorPagination`, `useOptimisticMutation`, `useGoals`, `useSalesAssistantHelpers`,
`usePrefetchRoute`. Nunca foram commitados: são **construção nova**, não recuperação de trabalho perdido.

## 🔴 Backlog real remanescente

| Item                           | O que falta                                                                                   | Onde                             |
| ------------------------------ | --------------------------------------------------------------------------------------------- | -------------------------------- |
| Centro de preferências de push | **Resolvido** (#770): `PushPreferencesCard` (categorias + horário de silêncio) e filtro no envio via `_shared/push-preferences.ts` | `src/hooks/usePushPreferences.ts` |
| Onboarding de passkey no login | **Resolvido** (#771): `PasskeyOnboardingPrompt` na home, só para quem ainda não tem credencial | `src/components/security/PasskeyOnboardingPrompt.tsx` |
| Playground da `ranking-api`    | API pública documentada sem UI de teste para integradores                                     | `supabase/functions/ranking-api` |

> Edições/registros anteriores do documento (tabelas por hook, tiers e "Top 10 prioridades") foram
> substituídos por esta versão porque descreviam estado de abril que não corresponde à `main` atual.
