import { useEffect, useRef } from 'react';
import { useRaceCalm } from '@/contexts/RaceCalmContext';

interface Options {
  /** Gap em % (0..100). null = sem rival. */
  gapPct: number | null;
  /** Globalmente mudo? */
  muted?: boolean;
  /** Volume base 0..1. */
  volume?: number;
}

/**
 * Drone de proximidade do rival.
 * - Ativa quando gap < 5% (entrando).
 * - Desativa quando gap > 7% (histerese, evita liga/desliga).
 * - Pitch sobe ~1 semitom (×1.0595) por % de aproximação abaixo de 5%.
 * - Respeita Calm Mode e mute global. Falha silenciosa se WebAudio não disponível.
 */
export function useRivalProximityAudio({ gapPct, muted = false, volume = 0.08 }: Options) {
  const { calm } = useRaceCalm();
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    return () => {
      try { oscRef.current?.stop(); } catch { /* noop */ }
      try { ctxRef.current?.close(); } catch { /* noop */ }
      ctxRef.current = null; oscRef.current = null; gainRef.current = null;
      activeRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (calm || muted || gapPct == null) {
      stop();
      return;
    }
    const shouldStart = !activeRef.current && gapPct < 5;
    const shouldStop = activeRef.current && gapPct > 7;

    if (shouldStart) start();
    if (shouldStop) stop();

    if (activeRef.current && oscRef.current && ctxRef.current) {
      const closeness = Math.max(0, 5 - gapPct); // 0..5
      const semitones = closeness; // 1 semitom por 1% de aproximação
      const baseFreq = 110; // A2
      const freq = baseFreq * Math.pow(2, semitones / 12);
      try {
        oscRef.current.frequency.setTargetAtTime(freq, ctxRef.current.currentTime, 0.15);
      } catch { /* noop */ }
    }

    function start() {
      try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) return;
        const ctx: AudioContext = ctxRef.current ?? new Ctx();
        ctxRef.current = ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = 110;
        gain.gain.value = 0;
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.4);
        oscRef.current = osc;
        gainRef.current = gain;
        activeRef.current = true;
      } catch { /* noop */ }
    }

    function stop() {
      if (!activeRef.current) return;
      try {
        if (gainRef.current && ctxRef.current) {
          gainRef.current.gain.setTargetAtTime(0, ctxRef.current.currentTime, 0.3);
        }
        const osc = oscRef.current;
        window.setTimeout(() => { try { osc?.stop(); } catch { /* noop */ } }, 800);
      } catch { /* noop */ }
      oscRef.current = null;
      gainRef.current = null;
      activeRef.current = false;
    }
  }, [gapPct, calm, muted, volume]);
}
