import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const STORAGE_KEY = 'app_scroll_positions';
const MAX_ENTRIES = 50;

type ScrollMap = Record<string, number>;

function readPositions(): ScrollMap {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}') as ScrollMap;
  } catch {
    return {};
  }
}

function persistPositions(map: ScrollMap) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // sessionStorage cheio/indisponível — posições ficam só em memória.
  }
}

/**
 * Restauração de scroll na navegação:
 * - PUSH/REPLACE → topo da página;
 * - POP (voltar do browser/botão voltar) → posição salva da entrada de
 *   histórico (location.key), com retentativas curtas para conteúdo lazy.
 *
 * sessionStorage é a fonte canônica: gravado ao sair da rota (cleanup) e
 * relido a cada POP — sobrevive a remounts sem vazar estado entre sessões.
 */
export function useScrollRestoration() {
  const location = useLocation();
  const navType = useNavigationType();
  const lastYRef = useRef(0);

  // Controle manual: o scrollRestoration nativo do browser disputa com o
  // nosso restore no POP e pode zerar a posição depois do primeiro scrollTo.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
      return () => {
        window.history.scrollRestoration = 'auto';
      };
    }
    return undefined;
  }, []);

  // Registra a posição de scroll da entrada de histórico corrente.
  useEffect(() => {
    const key = location.key;
    lastYRef.current = window.scrollY;
    const onScroll = () => {
      lastYRef.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      const map = readPositions();
      map[key] = lastYRef.current;
      // LRU simples: mantém as entradas mais recentes.
      const keys = Object.keys(map);
      while (keys.length > MAX_ENTRIES) {
        const oldest = keys.shift();
        if (oldest && oldest !== key) delete map[oldest];
      }
      persistPositions(map);
    };
  }, [location.key]);

  // Aplica a política ao trocar de rota.
  useEffect(() => {
    // Re-push do navigationGuard (cancelamento de voltar com form sujo):
    // mesma página, não é navegação de verdade — não mexe no scroll.
    const state = location.state as Record<string, unknown> | null;
    if (state?.__pcNavGuardRestore) return undefined;

    if (navType === 'POP') {
      const target = readPositions()[location.key] ?? 0;
      if (target > 0) {
        // Primeiro restore imediato; retentativas cobrem conteúdo lazy que
        // cresce a altura da página depois do primeiro paint (dashboards
        // pesados podem levar >1s para renderizar a altura total).
        window.scrollTo({ top: target, behavior: 'instant' });
        const timers = [120, 320, 640, 1000, 1600].map(ms =>
          setTimeout(() => window.scrollTo({ top: target, behavior: 'instant' }), ms)
        );
        // Gesto de rolagem do usuário cancela as retentativas — o restore
        // não disputa posição com quem já começou a rolar manualmente.
        const cancelRetries = () => timers.forEach(clearTimeout);
        window.addEventListener('wheel', cancelRetries, { passive: true });
        window.addEventListener('touchmove', cancelRetries, { passive: true });
        window.addEventListener('keydown', cancelRetries);
        return () => {
          cancelRetries();
          window.removeEventListener('wheel', cancelRetries);
          window.removeEventListener('touchmove', cancelRetries);
          window.removeEventListener('keydown', cancelRetries);
        };
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    return undefined;
  }, [location.key, location.pathname, location.state, navType]);
}
