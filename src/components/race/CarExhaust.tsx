/**
 * Exhaust trail + chama no escapamento.
 * Renderizado dentro do <motion.g> do carro (coordenadas locais),
 * já está rotacionado, então a chama aponta para -X (traseira).
 */
interface CarExhaustProps {
  /** Intensidade 0..1 (mapeada da velocidade/desgaste). */
  intensity?: number;
  /** Esconde quando true (ex: carro em pit). */
  hidden?: boolean;
}

export function CarExhaust({ intensity = 0.7, hidden = false }: CarExhaustProps) {
  if (hidden) return null;
  const scale = 0.5 + intensity * 0.6;

  return (
    <g pointerEvents="none" aria-hidden style={{ transformOrigin: '-12px 0px' }}>
      {/* 3 puffs de fumaça atrás do carro */}
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={-14 - i * 4}
          cy={0}
          r={1.6 + i * 0.7}
          fill="hsl(0 0% 80%)"
          opacity={0.45 - i * 0.12}
          filter="url(#dustBlur)"
          style={{
            animation: `race-exhaust-puff 0.7s ease-out infinite`,
            animationDelay: `${i * 0.12}s`,
            transformOrigin: `${-14 - i * 4}px 0px`,
          }}
        />
      ))}
      {/* Chama no escapamento (apenas com intensidade > 0.5) */}
      {intensity > 0.5 && (
        <g
          transform={`translate(-12 0) scale(${scale} ${scale})`}
          style={{ animation: 'race-exhaust-flame 0.18s ease-in-out infinite' }}
        >
          <polygon
            points="0,-1.4 -3.5,0 0,1.4 -1.5,0"
            fill="hsl(28 95% 55%)"
            opacity={0.9}
          />
          <polygon
            points="0,-0.8 -2.2,0 0,0.8 -0.8,0"
            fill="hsl(48 100% 65%)"
            opacity={0.95}
          />
        </g>
      )}
    </g>
  );
}
