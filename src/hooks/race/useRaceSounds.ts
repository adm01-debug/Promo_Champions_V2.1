import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'race_sound_muted';

export type RaceSoundType = 'boost' | 'overtake' | 'checkpoint' | 'victory' | 'countdown' | 'pitstop' | 'powerup';

/**
 * Sons sintéticos via Web Audio API (sem arquivos externos).
 * Cada efeito é gerado proceduralmente para garantir entrega sem dependências.
 */
export function useRaceSounds() {
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === '1';
  });
  const ctxRef = useRef<AudioContext | null>(null);

  const ensureCtx = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0'); } catch { /* noop */ }
      return next;
    });
  }, []);

  const play = useCallback((type: RaceSoundType) => {
    if (muted) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);

    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.connect(env); env.connect(master);

    switch (type) {
      case 'boost':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);
        env.gain.setValueAtTime(0.0001, now);
        env.gain.exponentialRampToValueAtTime(0.6, now + 0.05);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now); osc.stop(now + 0.45);
        break;
      case 'overtake':
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);
        env.gain.setValueAtTime(0.0001, now);
        env.gain.exponentialRampToValueAtTime(0.5, now + 0.02);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now); osc.stop(now + 0.32);
        break;
      case 'checkpoint':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(1320, now + 0.15);
        env.gain.setValueAtTime(0.0001, now);
        env.gain.exponentialRampToValueAtTime(0.4, now + 0.02);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now); osc.stop(now + 0.3);
        break;
      case 'victory': {
        osc.disconnect();
        const notes = [523, 659, 784, 1047];
        notes.forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.value = f;
          o.connect(g); g.connect(master);
          const t = now + i * 0.15;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
          o.start(t); o.stop(t + 0.45);
        });
        break;
      }
      case 'countdown':
        osc.type = 'sine';
        osc.frequency.value = 660;
        env.gain.setValueAtTime(0.0001, now);
        env.gain.exponentialRampToValueAtTime(0.5, now + 0.02);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now); osc.stop(now + 0.2);
        break;
      case 'pitstop':
        osc.type = 'square';
        osc.frequency.value = 220;
        env.gain.setValueAtTime(0.0001, now);
        env.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now); osc.stop(now + 0.55);
        break;
      case 'powerup':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.3);
        env.gain.setValueAtTime(0.0001, now);
        env.gain.exponentialRampToValueAtTime(0.5, now + 0.02);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now); osc.stop(now + 0.4);
        break;
    }
  }, [muted, ensureCtx]);

  useEffect(() => () => {
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close().catch(() => { /* noop */ });
    }
  }, []);

  return { muted, toggleMute, play };
}
