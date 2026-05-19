import { useState, useRef, useEffect, useCallback } from 'react';
import { detectOvertakes, CHECKPOINTS, SECTOR_BOUNDARIES, getPositionOnTrack, isInDRSZone, makeCommentaryLine } from '@/components/race/raceTrackHelpers';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';

interface UseRaceDetectionProps {
  sortedCars: RaceLeaderboardEntry[];
  reducedMotion: boolean;
  triggerShake: () => void;
  playOvertakeSound: () => void;
  playLeaderTakeoverSound: () => void;
  pushCommentary: (text: string) => void;
  pushTickerEvent: (text: string, icon?: string) => void;
  pushBroadcast: (evt: any) => void;
}

export function useRaceDetection({
  sortedCars,
  reducedMotion,
  triggerShake,
  playOvertakeSound,
  playLeaderTakeoverSound,
  pushCommentary,
  pushTickerEvent,
  pushBroadcast,
}: UseRaceDetectionProps) {
  const prevSnapshotRef = useRef<Array<{ id: string; progress: number }>>([]);
  const [flashingCars, setFlashingCars] = useState<Set<string>>(new Set());
  const [dustBursts, setDustBursts] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const [sectorBadges, setSectorBadges] = useState<Array<{ id: string; name: string; x: number; y: number }>>([]);
  const prevLeaderIdRef = useRef<string | null>(null);
  const [overtakesTotal, setOvertakesTotal] = useState(0);
  const [yellowFlagUntil, setYellowFlagUntil] = useState<number>(0);

  // Sectors & Fastest logic
  const sectorEnterRef = useRef<Map<number, { carId: string; at: number }>>(new Map());
  const bestSectorTimeRef = useRef<Map<number, number>>(new Map());
  const [flashSectorIdx, setFlashSectorIdx] = useState<number | null>(null);
  const [fastestCarId, setFastestCarId] = useState<string | null>(null);
  const fastestTimerRef = useRef<number | null>(null);

  // Cinematic focus
  const [cinematicFocus, setCinematicFocus] = useState(false);
  const cinematicTimerRef = useRef<number | null>(null);
  const lastCinematicAtRef = useRef<number>(0);
  const [waveTrigger, setWaveTrigger] = useState(0);
  const lastLapCompletedRef = useRef<number>(0);

  useEffect(() => {
    const curr = sortedCars.map((c) => ({ id: c.car_id, progress: Number(c.progress) }));
    const prev = prevSnapshotRef.current;
    
    if (prev.length > 0 && !reducedMotion) {
      const overtakes = detectOvertakes(prev, curr);
      if (overtakes.length > 0) {
        setOvertakesTotal((n) => n + overtakes.length);
        setYellowFlagUntil(Date.now() + 3000);
        
        const newFlash = new Set(flashingCars);
        overtakes.forEach((o) => newFlash.add(o.overtaker));
        setFlashingCars(newFlash);
        
        setTimeout(() => {
          setFlashingCars((s) => {
            const next = new Set(s);
            overtakes.forEach((o) => next.delete(o.overtaker));
            return next;
          });
        }, 700);

        const o = overtakes[0];
        const attackerName = sortedCars.find((c) => c.car_id === o.overtaker)?.salesperson_name;
        const defenderName = sortedCars.find((c) => c.car_id === o.overtaken)?.salesperson_name;
        const inDRS = isInDRSZone(curr.find((x) => x.id === o.overtaker)?.progress ?? 0);
        
        pushCommentary(makeCommentaryLine({
          type: inDRS ? 'drs' : 'overtake',
          attacker: attackerName,
          defender: defenderName,
        }));

        if (attackerName && defenderName) {
          pushTickerEvent(
            `${attackerName.split(' ')[0]} ultrapassou ${defenderName.split(' ')[0]}`,
            inDRS ? '⚡' : '🏁',
          );
        }

        const overtakerNewRank = curr.findIndex((x) => x.id === o.overtaker);
        if (overtakerNewRank >= 0 && overtakerNewRank < 3 && !reducedMotion) {
          triggerShake();
          playOvertakeSound();
          if (attackerName && defenderName) {
            pushBroadcast({
              kind: 'overtake',
              title: `${attackerName.split(' ')[0]} ULTRAPASSOU ${defenderName.split(' ')[0]}`,
              detail: inDRS ? `Zona DRS · P${overtakerNewRank + 1}` : `Manobra limpa · P${overtakerNewRank + 1}`,
            });
          }
        }
      }

      const newDust: Array<{ id: string; x: number; y: number }> = [];
      curr.forEach((c) => {
        const p = prev.find((x) => x.id === c.id);
        if (!p) return;
        for (const cp of CHECKPOINTS) {
          if (p.progress < cp && c.progress >= cp) {
            const pos = getPositionOnTrack(cp, 0);
            newDust.push({ id: `${c.id}-${cp}-${Date.now()}`, x: pos.x, y: pos.y });
          }
        }
      });
      if (newDust.length > 0) {
        setDustBursts((d) => [...d, ...newDust]);
        setTimeout(() => {
          setDustBursts((d) => d.filter((b) => !newDust.find((nb) => nb.id === b.id)));
        }, 1200);
      }

      const leaderCurr = curr[0];
      const leaderPrev = prev.find((x) => x.id === leaderCurr?.id);
      if (leaderCurr && leaderPrev) {
        SECTOR_BOUNDARIES.forEach((b, i) => {
          if (leaderPrev.progress < b && leaderCurr.progress >= b) {
            const pos = getPositionOnTrack(b, 0);
            const name = `S${i + 1}`;
            const badgeId = `${leaderCurr.id}-${name}-${Date.now()}`;
            setSectorBadges((arr) => [...arr, { id: badgeId, name, x: pos.x, y: pos.y }]);
            setTimeout(() => {
              setSectorBadges((arr) => arr.filter((bd) => bd.id !== badgeId));
            }, 900);
            const lname = sortedCars.find((c) => c.car_id === leaderCurr.id)?.salesperson_name;
            pushCommentary(makeCommentaryLine({ type: 'sector', leader: lname, sector: name }));

            const now = Date.now();
            const prevEnter = sectorEnterRef.current.get(i);
            if (prevEnter && prevEnter.carId === leaderCurr.id) {
              const sectorTime = now - prevEnter.at;
              const best = bestSectorTimeRef.current.get(i);
              if (sectorTime > 200 && (best === undefined || sectorTime < best)) {
                bestSectorTimeRef.current.set(i, sectorTime);
                setFlashSectorIdx(i);
                setFastestCarId(leaderCurr.id);
                if (fastestTimerRef.current) window.clearTimeout(fastestTimerRef.current);
                fastestTimerRef.current = window.setTimeout(() => {
                  setFlashSectorIdx(null);
                  setFastestCarId(null);
                }, 2000);
              }
            }
            sectorEnterRef.current.set(i, { carId: leaderCurr.id, at: now });

            if (i === 2 && now - lastCinematicAtRef.current > 8000) {
              lastCinematicAtRef.current = now;
              setCinematicFocus(true);
              if (cinematicTimerRef.current) window.clearTimeout(cinematicTimerRef.current);
              cinematicTimerRef.current = window.setTimeout(() => setCinematicFocus(false), 1800);
            }
          }
        });

        if (leaderCurr.progress > 1 && Math.floor(leaderCurr.progress) > lastLapCompletedRef.current) {
          lastLapCompletedRef.current = Math.floor(leaderCurr.progress);
          setWaveTrigger((n) => n + 1);
        }
      }

      const newLeaderId = leaderCurr?.id ?? null;
      if (newLeaderId && prevLeaderIdRef.current && newLeaderId !== prevLeaderIdRef.current) {
        const lname = sortedCars.find((c) => c.car_id === newLeaderId)?.salesperson_name;
        pushCommentary(makeCommentaryLine({ type: 'leader', leader: lname }));
        if (lname) pushTickerEvent(`${lname.split(' ')[0]} assumiu P1`, '👑');
        playLeaderTakeoverSound();
        if (lname) {
          pushBroadcast({
            kind: 'leader',
            title: `${lname.split(' ')[0]} ASSUMIU A LIDERANÇA`,
            detail: 'Tomada de P1 ao vivo',
          });
        }
      }
      if (newLeaderId) prevLeaderIdRef.current = newLeaderId;
    }
    prevSnapshotRef.current = curr;
  }, [sortedCars.map((c) => `${c.car_id}:${c.progress}`).join('|'), reducedMotion]);

  return {
    flashingCars,
    dustBursts,
    sectorBadges,
    overtakesTotal,
    yellowFlagUntil,
    flashSectorIdx,
    fastestCarId,
    cinematicFocus,
    waveTrigger,
  };
}
