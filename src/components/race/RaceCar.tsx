import { motion } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';
import { CarLiveryOverlay } from './CarLiveryOverlay';
import { CarHelmetTooltip } from './CarHelmetTooltip';
import type { LiveryPattern } from './raceColors';

interface RaceCarProps {
  /** Número do piloto. Quando ausente/null, nenhum numeral é renderizado no chassi. */
  number?: number | null;
  primaryColor: string;
  secondaryColor: string;
  style: 'f1' | 'stock' | 'kart';
  scale?: number;
  showTrail?: boolean;
  /** Padrão visual extra para acessibilidade (colorblind mode). */
  pattern?: 'stripes' | 'dots' | 'checker' | null;
  /** Quando true, dispara um flash branco + ping circular indicando ultrapassagem. */
  overtakeFlash?: boolean;
  /** Energia/desgaste 0..1 (1 = pneu novo, 0 = degradado). */
  tireWear?: number;
  /** Quando true, mostra ícone DRS pulsante no topo do carro. */
  drsActive?: boolean;
  /** Posição absoluta na corrida (1-based). Mostra medalha (top 3) ou número. */
  rank?: number;
  /** Quando true, dispara animação de pit-stop (pneus piscando + brilho amarelo). */
  pitStop?: boolean;
  /** Quando true, exibe badge "FASTEST" roxa por 2s acima do carro. */
  fastestSector?: boolean;
  /** Quando true, exibe linhas brancas de turbulência aerodinâmica saindo da traseira. */
  aeroTurbulence?: boolean;
  /** Padrão de pintura (livery) renderizado sobre o chassi. */
  livery?: LiveryPattern;
  /** Cor extra usada por algumas liveries (chamas, listras Pride bi). */
  liveryAccent?: string;
  /** ID único para clipPath da livery (use car_id ou similar). */
  liveryUid?: string;
  /** Cor da escuderia/equipe — renderizada como faixa lateral (stripe) sutil. */
  teamColor?: string | null;
  /** Nome do piloto exibido em "capacete" flutuante após hover persistente. */
  pilotName?: string;
}

/**
 * SVG carro top-down estilo Micro Machines / diecast toy.
 * Sombra projetada destacada, carroceria com brilho, rodas com aros,
 * cockpit/spoiler conforme estilo. Aponta para a direita →.
 */
function RaceCarInner({
  number,
  primaryColor,
  secondaryColor,
  style,
  scale = 1.15,
  showTrail = false,
  pattern = null,
  overtakeFlash = false,
  tireWear = 1,
  drsActive = false,
  rank,
  pitStop = false,
  fastestSector = false,
  aeroTurbulence = false,
  livery = 'solid',
  liveryAccent,
  liveryUid,
  teamColor = null,
  pilotName,
}: RaceCarProps) {
  const [helmetVisible, setHelmetVisible] = useState(false);
  const hoverTimerRef = useRef<number | null>(null);
  const tooltipId = `helmet-tip-${number ?? 'anon'}`;

  useEffect(() => () => {
    if (hoverTimerRef.current != null) window.clearTimeout(hoverTimerRef.current);
  }, []);

  const onEnter = () => {
    if (!pilotName || rank === undefined) return;
    if (hoverTimerRef.current != null) window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = window.setTimeout(() => setHelmetVisible(true), 600);
  };
  const onLeave = () => {
    if (hoverTimerRef.current != null) window.clearTimeout(hoverTimerRef.current);
    setHelmetVisible(false);
  };

  const patternFillId =
    pattern === 'stripes' ? 'cbStripes' : pattern === 'dots' ? 'cbDots' : pattern === 'checker' ? 'cbChecker' : null;

  const isF1 = style === 'f1';
  const isKart = style === 'kart';
  // Proporções tipo Micro Machines: corpo mais cheio
  const bodyW = isF1 ? 58 : isKart ? 42 : 52;
  const bodyH = isF1 ? 20 : isKart ? 24 : 26;
  const bodyR = isKart ? 5 : isF1 ? 9 : 8;

  // posição das rodas
  const wheelOffsetX = bodyW / 2 - 7;
  const wheelOffsetY = bodyH / 2 + 1;

  return (
    <g
      transform={`scale(${scale})`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-describedby={pilotName ? tooltipId : undefined}
    >
      {pilotName && rank !== undefined && (
        <CarHelmetTooltip
          id={tooltipId}
          visible={helmetVisible}
          name={pilotName}
          rank={rank}
          color={primaryColor}
        />
      )}
      {/* ===== Boost trail ===== */}
      {showTrail && (
        <>
          {/* Skid marks (rastro de pneu) — 2 linhas paralelas que esmaecem */}
          {[-wheelOffsetY, wheelOffsetY].map((wy) => (
            <motion.rect
              key={`skid-${wy}`}
              x={-bodyW / 2 - 60}
              y={wy - 1}
              width={60}
              height={2}
              rx={1}
              fill="url(#skidMark)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{ duration: 1.5, repeat: 2, ease: 'easeOut' }}
            />
          ))}
          <motion.ellipse
            cx={-44}
            cy={0}
            rx={34}
            ry={10}
            fill={primaryColor}
            initial={{ opacity: 0, scaleX: 0.4 }}
            animate={{ opacity: [0, 0.55, 0], scaleX: [0.4, 1.6, 2.2] }}
            transition={{ duration: 0.7, repeat: 3, ease: 'easeOut' }}
            style={{ filter: 'blur(6px)' }}
          />
          <motion.ellipse
            cx={-32}
            cy={0}
            rx={22}
            ry={6}
            fill="url(#boostTrail)"
            initial={{ opacity: 0, scaleX: 0.3 }}
            animate={{ opacity: [0, 0.95, 0], scaleX: [0.3, 1.5, 2] }}
            transition={{ duration: 0.6, repeat: 3 }}
          />
          {[0, 1, 2, 3].map((i) => (
            <motion.circle
              key={i}
              cx={-bodyW / 2 - 4}
              cy={(i - 1.5) * 3}
              r={1.6}
              fill={secondaryColor}
              initial={{ opacity: 0, x: 0 }}
              animate={{
                opacity: [0, 1, 0],
                x: [-2, -22 - i * 3, -36 - i * 4],
                y: [(i - 1.5) * 3, (i - 1.5) * 5, (i - 1.5) * 7],
              }}
              transition={{ duration: 0.5 + i * 0.05, repeat: 3, delay: i * 0.04, ease: 'easeOut' }}
            />
          ))}
          {/* Mario-Kart turbo particles (cor do carro) */}
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = (i - 2) * 0.35;
            return (
              <motion.circle
                key={`turbo-${i}`}
                cx={-bodyW / 2 - 2}
                cy={0}
                r={2.2 + (i % 2) * 0.6}
                fill={i % 2 === 0 ? primaryColor : secondaryColor}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  cx: [-bodyW / 2 - 2, -bodyW / 2 - 26 - i * 6, -bodyW / 2 - 50 - i * 8],
                  cy: [0, Math.sin(angle) * 10, Math.sin(angle) * 18],
                }}
                transition={{ duration: 0.6, repeat: 3, delay: i * 0.05, ease: 'easeOut' }}
              />
            );
          })}
          <motion.circle
            cx={-bodyW / 2}
            cy={0}
            r={0}
            fill="none"
            stroke={primaryColor}
            strokeWidth={1.5}
            initial={{ r: 0, opacity: 0.8 }}
            animate={{ r: [0, 18, 28], opacity: [0.8, 0.3, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
          />
        </>
      )}

      {/* ===== Aura dourada pulsante do líder (P1) — embaixo do carro ===== */}
      {rank === 1 && (
        <g pointerEvents="none">
          {/* Halo radial difuso */}
          <motion.ellipse
            cx={0}
            cy={bodyH / 2 + 2}
            rx={bodyW * 0.75}
            ry={9}
            fill="hsl(45 95% 55%)"
            animate={{ opacity: [0.22, 0.6, 0.22] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'blur(5px)' }}
          />
          {/* Aura interna mais concentrada */}
          <motion.ellipse
            cx={0}
            cy={bodyH / 2 + 1}
            rx={bodyW * 0.55}
            ry={5}
            fill="hsl(48 100% 65%)"
            animate={{ opacity: [0.35, 0.8, 0.35] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'blur(2.5px)' }}
          />
          {/* Glow dourado contornando o chassi */}
          <motion.rect
            x={-bodyW / 2 - 2}
            y={-bodyH / 2 - 2}
            width={bodyW + 4}
            height={bodyH + 4}
            rx={bodyR + 2}
            fill="hsl(45 95% 55%)"
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'blur(6px)' }}
          />
          {/* Faíscas douradas atrás (rastro de brilho) */}
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={`spark-${i}`}
              cy={(i - 1) * 3}
              r={1.4}
              fill="hsl(48 100% 70%)"
              initial={{ cx: -bodyW / 2, opacity: 0 }}
              animate={{
                cx: [-bodyW / 2, -bodyW / 2 - 18],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.25,
                ease: 'easeOut',
              }}
              style={{ filter: 'drop-shadow(0 0 2px hsl(48 100% 65%))' }}
            />
          ))}
        </g>
      )}

      {/* ===== Sombra dinâmica do sol (elipse alongada para baixo-esquerda, blur SVG) ===== */}
      <ellipse
        cx={5}
        cy={bodyH / 2 + 7}
        rx={bodyW / 2 + 3}
        ry={4.5}
        fill="hsl(0 0% 0%)"
        opacity={0.28}
        filter="url(#carShadowBlur)"
      />
      {/* Sombra projetada (offset baixo, blur visual via dupla elipse) */}
      <ellipse cx={3} cy={bodyH / 2 + 6} rx={bodyW / 2 + 1} ry={3.5} fill="rgba(0,0,0,0.18)" />
      <ellipse cx={3} cy={bodyH / 2 + 5} rx={bodyW / 2 - 2} ry={2.5} fill="rgba(0,0,0,0.28)" />

      {/* ===== Rodas traseiras (renderizadas antes do corpo) ===== */}
      <g>
        {/* traseira esquerda (top) */}
        <ellipse cx={-wheelOffsetX} cy={-wheelOffsetY} rx={4.5} ry={3.8} fill="#0a0a0a" />
        <ellipse cx={-wheelOffsetX} cy={-wheelOffsetY} rx={2.5} ry={2.2} fill="#2a2a2a" />
        <circle cx={-wheelOffsetX} cy={-wheelOffsetY} r={1} fill="#525252" />
        {/* traseira direita (bottom) */}
        <ellipse cx={-wheelOffsetX} cy={wheelOffsetY} rx={4.5} ry={3.8} fill="#0a0a0a" />
        <ellipse cx={-wheelOffsetX} cy={wheelOffsetY} rx={2.5} ry={2.2} fill="#2a2a2a" />
        <circle cx={-wheelOffsetX} cy={wheelOffsetY} r={1} fill="#525252" />
        {/* dianteira esquerda (top) */}
        <ellipse cx={wheelOffsetX} cy={-wheelOffsetY} rx={4.5} ry={3.8} fill="#0a0a0a" />
        <ellipse cx={wheelOffsetX} cy={-wheelOffsetY} rx={2.5} ry={2.2} fill="#2a2a2a" />
        <circle cx={wheelOffsetX} cy={-wheelOffsetY} r={1} fill="#525252" />
        {/* dianteira direita (bottom) */}
        <ellipse cx={wheelOffsetX} cy={wheelOffsetY} rx={4.5} ry={3.8} fill="#0a0a0a" />
        <ellipse cx={wheelOffsetX} cy={wheelOffsetY} rx={2.5} ry={2.2} fill="#2a2a2a" />
        <circle cx={wheelOffsetX} cy={wheelOffsetY} r={1} fill="#525252" />
      </g>

      {/* ===== Asa traseira (F1) ===== */}
      {isF1 && (
        <>
          <rect
            x={-bodyW / 2 - 3}
            y={-bodyH / 2 - 3}
            width={5}
            height={bodyH + 6}
            rx={1}
            fill={secondaryColor}
            stroke="#1f2937"
            strokeWidth={0.9}
          />
          <rect x={-bodyW / 2 - 3} y={-1} width={5} height={2} fill="#0f172a" opacity={0.5} />
        </>
      )}

      {/* ===== Corpo principal ===== */}
      <rect
        x={-bodyW / 2}
        y={-bodyH / 2}
        width={bodyW}
        height={bodyH}
        rx={bodyR}
        fill={primaryColor}
        stroke="#0f172a"
        strokeWidth={1.4}
      />

      {/* faixa central (livery) */}
      <rect
        x={-bodyW / 2 + 5}
        y={-2.5}
        width={bodyW - 10}
        height={5}
        fill={secondaryColor}
        opacity={0.9}
      />

      {/* duas linhas finas de detalhe */}
      <rect x={-bodyW / 2 + 5} y={-bodyH / 2 + 3} width={bodyW - 10} height={0.8} fill={secondaryColor} opacity={0.5} />
      <rect x={-bodyW / 2 + 5} y={bodyH / 2 - 3.8} width={bodyW - 10} height={0.8} fill={secondaryColor} opacity={0.5} />

      {/* faixa lateral da escuderia (sutil, abaixo da livery) */}
      {teamColor && (
        <>
          <rect
            x={-bodyW / 2 + 4}
            y={-bodyH / 2 + 1.2}
            width={bodyW - 8}
            height={1.2}
            rx={0.6}
            fill={teamColor}
            opacity={0.75}
            pointerEvents="none"
          />
          <rect
            x={-bodyW / 2 + 4}
            y={bodyH / 2 - 2.4}
            width={bodyW - 8}
            height={1.2}
            rx={0.6}
            fill={teamColor}
            opacity={0.75}
            pointerEvents="none"
          />
        </>
      )}

      {/* highlight superior (brilho) */}
      <rect
        x={-bodyW / 2 + 1}
        y={-bodyH / 2 + 1}
        width={bodyW - 2}
        height={bodyH - 2}
        rx={bodyR - 1}
        fill="url(#carBodyShine)"
        pointerEvents="none"
      />

      {/* shimmer metálico animado (estilo diecast) */}
      <rect
        x={-bodyW / 2 + 1}
        y={-bodyH / 2 + 1}
        width={bodyW - 2}
        height={bodyH - 2}
        rx={bodyR - 1}
        fill="url(#carShimmer)"
        pointerEvents="none"
        opacity={0.85}
      />

      {/* overlay de livery (chamas, listras, padrões Pride...) */}
      {livery && livery !== 'solid' && (
        <CarLiveryOverlay
          pattern={livery}
          bodyW={bodyW}
          bodyH={bodyH}
          bodyR={bodyR}
          primary={primaryColor}
          secondary={secondaryColor}
          accent={liveryAccent}
          uid={liveryUid ?? `${number ?? 'x'}-${primaryColor.replace('#', '')}`}
        />
      )}

      {/* overlay de padrão (acessibilidade colorblind) */}
      {patternFillId && (
        <rect
          x={-bodyW / 2}
          y={-bodyH / 2}
          width={bodyW}
          height={bodyH}
          rx={bodyR}
          fill={`url(#${patternFillId})`}
          pointerEvents="none"
        />
      )}

      {/* ===== Cockpit (vidro escuro) ===== */}
      <ellipse
        cx={isF1 ? 5 : isKart ? 1 : 2}
        cy={0}
        rx={isF1 ? 6 : isKart ? 6 : 8}
        ry={isF1 ? 5.5 : isKart ? 6 : 7}
        fill="#0b1220"
        stroke="#1f2937"
        strokeWidth={1}
      />
      {/* reflexo do vidro */}
      <ellipse
        cx={isF1 ? 4 : isKart ? 0 : 1}
        cy={-2}
        rx={isF1 ? 3 : isKart ? 2.8 : 4}
        ry={isF1 ? 1.6 : isKart ? 1.8 : 2}
        fill="#ffffff"
        opacity={0.18}
      />

      {/* ===== Asa dianteira (F1) ===== */}
      {isF1 && (
        <>
          <rect
            x={bodyW / 2 - 1}
            y={-bodyH / 2 - 4}
            width={4}
            height={bodyH + 8}
            rx={1}
            fill={secondaryColor}
            stroke="#1f2937"
            strokeWidth={0.9}
          />
          <rect x={bodyW / 2 - 1} y={-1} width={4} height={2} fill="#0f172a" opacity={0.5} />
        </>
      )}

      {/* faróis dianteiros */}
      {!isKart && (
        <>
          <ellipse cx={bodyW / 2 - 2} cy={-bodyH / 2 + 4} rx={1.5} ry={1.2} fill="#fef9c3" opacity={0.95} />
          <ellipse cx={bodyW / 2 - 2} cy={bodyH / 2 - 4} rx={1.5} ry={1.2} fill="#fef9c3" opacity={0.95} />
        </>
      )}
      {/* luzes traseiras */}
      <rect x={-bodyW / 2 + 0.5} y={-bodyH / 2 + 3} width={1.6} height={2.5} rx={0.5} fill="#dc2626" opacity={0.9} />
      <rect x={-bodyW / 2 + 0.5} y={bodyH / 2 - 5.5} width={1.6} height={2.5} rx={0.5} fill="#dc2626" opacity={0.9} />

      {/* ===== Número do piloto (renderizado apenas quando explicitamente passado > 0) ===== */}
      {number != null && number > 0 && (
        <>
          <circle cx={-bodyW / 2 + 14} cy={0} r={5.5} fill={secondaryColor} stroke="#0f172a" strokeWidth={0.8} />
          <text
            x={-bodyW / 2 + 14}
            y={0}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={7.5}
            fontWeight={900}
            fill={primaryColor}
            style={{ fontFamily: 'system-ui, sans-serif' }}
          >
            {number}
          </text>
        </>
      )}

      {/* ===== Flash de ultrapassagem (sound design visual) ===== */}
      {overtakeFlash && (
        <>
          {/* flash branco breve sobre o corpo */}
          <motion.rect
            x={-bodyW / 2}
            y={-bodyH / 2}
            width={bodyW}
            height={bodyH}
            rx={bodyR}
            fill="hsl(0 0% 100%)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0] }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            pointerEvents="none"
          />
          {/* ping circular expandindo */}
          <motion.circle
            cx={0}
            cy={0}
            r={6}
            fill="none"
            stroke="hsl(48 95% 60%)"
            strokeWidth={2}
            initial={{ r: 6, opacity: 0.95 }}
            animate={{ r: [6, 32, 48], opacity: [0.95, 0.4, 0] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            pointerEvents="none"
          />
          <motion.circle
            cx={0}
            cy={0}
            r={4}
            fill="none"
            stroke="hsl(0 0% 100%)"
            strokeWidth={1.2}
            initial={{ r: 4, opacity: 0.85 }}
            animate={{ r: [4, 22, 36], opacity: [0.85, 0.3, 0] }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
            pointerEvents="none"
          />
        </>
      )}

      {/* ===== Tire wear bar (energia) ===== */}
      {(() => {
        const w = Math.max(0, Math.min(1, tireWear));
        const barW = bodyW * 0.7;
        const fillW = barW * w;
        const color = w > 0.66 ? 'hsl(142 70% 45%)' : w > 0.33 ? 'hsl(45 95% 55%)' : 'hsl(0 80% 55%)';
        return (
          <g transform={`translate(${-barW / 2} ${bodyH / 2 + 8.5})`} pointerEvents="none">
            <rect x={-0.5} y={-0.5} width={barW + 1} height={2.4} rx={1.2} fill="hsl(0 0% 0% / 0.45)" />
            <rect x={0} y={0} width={fillW} height={1.8} rx={0.9} fill={color} />
          </g>
        );
      })()}

      {/* ===== DRS indicator ===== */}
      {drsActive && (
        <g transform={`translate(0 ${-bodyH / 2 - 9})`} pointerEvents="none">
          <motion.g
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x={-9} y={-4.5} width={18} height={8} rx={2} fill="hsl(142 76% 38%)" stroke="hsl(0 0% 100%)" strokeWidth={0.6} />
            <text y={2} textAnchor="middle" fontSize={6} fontWeight={900} fill="hsl(0 0% 100%)" style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '0.06em' }}>
              DRS
            </text>
          </motion.g>
        </g>
      )}

      {/* ===== Rank badge — destacado e centralizado acima do carro ===== */}
      {rank !== undefined && rank > 0 && (() => {
        const isPodium = rank <= 3;
        const isLeader = rank === 1;
        const medalColor =
          rank === 1 ? 'hsl(45 95% 55%)' :
          rank === 2 ? 'hsl(0 0% 80%)' :
          rank === 3 ? 'hsl(28 78% 52%)' :
          'hsl(0 0% 15%)';
        const ringColor =
          rank === 1 ? 'hsl(45 95% 55%)' :
          rank === 2 ? 'hsl(0 0% 80%)' :
          rank === 3 ? 'hsl(28 78% 52%)' :
          'hsl(0 0% 100% / 0.6)';
        const fg = isPodium ? 'hsl(20 30% 14%)' : 'hsl(0 0% 100%)';
        return (
          <motion.g
            transform={`translate(0 ${-bodyH / 2 - 16})`}
            key={`rank-${rank}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={
              isLeader
                ? { scale: [1, 1.08, 1], opacity: 1 }
                : { scale: [0.8, 1.45, 0.92, 1], opacity: 1 }
            }
            transition={
              isLeader
                ? { scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.3 } }
                : { duration: 0.6, ease: 'easeOut' }
            }
            pointerEvents="none"
            style={isPodium ? { filter: `drop-shadow(0 0 4px ${medalColor})` } : undefined}
          >
            <circle r={13} fill="hsl(0 0% 0% / 0.6)" />
            <circle r={11} fill={medalColor} stroke="hsl(0 0% 100%)" strokeWidth={2.2} />
            {isPodium && (
              <circle r={12.4} fill="none" stroke={ringColor} strokeWidth={1} opacity={0.85} />
            )}
            <text
              y={3.8}
              textAnchor="middle"
              fontSize={11}
              fontWeight={900}
              fill={fg}
              style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '-0.03em' }}
            >
              P{rank}
            </text>
          </motion.g>
        );
      })()}

      {/* ===== Pit stop overlay (pneus piscando + glow amarelo) ===== */}
      {pitStop && (
        <g pointerEvents="none">
          <motion.rect
            x={-bodyW / 2 - 4}
            y={-bodyH / 2 - 4}
            width={bodyW + 8}
            height={bodyH + 8}
            rx={bodyR + 2}
            fill="none"
            stroke="hsl(45 95% 55%)"
            strokeWidth={2}
            strokeDasharray="4 3"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.45, repeat: Infinity }}
          />
          {[
            [-wheelOffsetX, -wheelOffsetY],
            [-wheelOffsetX, wheelOffsetY],
            [wheelOffsetX, -wheelOffsetY],
            [wheelOffsetX, wheelOffsetY],
          ].map(([wx, wy], i) => (
            <motion.circle
              key={`pit-${i}`}
              cx={wx}
              cy={wy}
              r={5.5}
              fill="hsl(45 95% 55%)"
              opacity={0.8}
              animate={{ opacity: [0, 0.85, 0] }}
              transition={{ duration: 0.35, repeat: Infinity, delay: i * 0.08 }}
            />
          ))}
          <g transform={`translate(0 ${-bodyH / 2 - 16})`}>
            <rect x={-12} y={-5} width={24} height={9} rx={2} fill="hsl(45 95% 55%)" stroke="hsl(0 0% 10%)" strokeWidth={0.6} />
            <text y={2} textAnchor="middle" fontSize={6.5} fontWeight={900} fill="hsl(20 30% 18%)" style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '0.08em' }}>
              PIT
            </text>
          </g>
        </g>
      )}

      {/* ===== Aero turbulence (rajadas de vento na traseira em alta velocidade) ===== */}
      {aeroTurbulence && (
        <g pointerEvents="none">
          {[0, 1, 2].map((i) => {
            const yOff = (i - 1) * 4.5;
            return (
              <motion.line
                key={`aero-${i}`}
                x1={-bodyW / 2 - 2}
                y1={yOff}
                x2={-bodyW / 2 - 16}
                y2={yOff + (i - 1) * 1.8}
                stroke="hsl(0 0% 100%)"
                strokeWidth={1.2}
                strokeLinecap="round"
                opacity={0.55}
                animate={{
                  opacity: [0, 0.7, 0],
                  x1: [-bodyW / 2 - 2, -bodyW / 2 - 8],
                  x2: [-bodyW / 2 - 16, -bodyW / 2 - 28 - i * 2],
                }}
                transition={{
                  duration: 0.55,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: 'easeOut',
                }}
              />
            );
          })}
        </g>
      )}

      {/* ===== FASTEST sector badge (roxo F1) ===== */}
      {fastestSector && (
        <motion.g
          transform={`translate(0 ${-bodyH / 2 - 22})`}
          initial={{ opacity: 0, scale: 0.5, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          pointerEvents="none"
        >
          <rect x={-18} y={-6} width={36} height={11} rx={2.5}
            fill="hsl(271 91% 55%)" stroke="hsl(0 0% 100%)" strokeWidth={0.8} />
          <text y={2.2} textAnchor="middle" fontSize={6.5} fontWeight={900}
            fill="hsl(0 0% 100%)"
            style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '0.12em' }}>
            FASTEST
          </text>
        </motion.g>
      )}
    </g>
  );
}

/**
 * Memoizado com comparator custom: re-renderiza apenas quando props visualmente
 * relevantes mudam. Movimento (translate via CSS/SVG transform) é controlado pelo pai.
 */
export const RaceCar = memo(RaceCarInner, (prev, next) => {
  return (
    prev.number === next.number &&
    prev.primaryColor === next.primaryColor &&
    prev.secondaryColor === next.secondaryColor &&
    prev.style === next.style &&
    prev.scale === next.scale &&
    prev.showTrail === next.showTrail &&
    prev.pattern === next.pattern &&
    prev.overtakeFlash === next.overtakeFlash &&
    prev.tireWear === next.tireWear &&
    prev.drsActive === next.drsActive &&
    prev.rank === next.rank &&
    prev.pitStop === next.pitStop &&
    prev.fastestSector === next.fastestSector &&
    prev.aeroTurbulence === next.aeroTurbulence &&
    prev.livery === next.livery &&
    prev.liveryAccent === next.liveryAccent &&
    prev.liveryUid === next.liveryUid &&
    prev.teamColor === next.teamColor &&
    prev.pilotName === next.pilotName
  );
});
RaceCar.displayName = 'RaceCar';
