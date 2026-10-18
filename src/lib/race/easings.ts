/**
 * Curvas de easing inspiradas em telemetria F1 real.
 * - ACCEL: arrancada (slow-in, fast-out) — ideal para overtakes.
 * - BRAKE: frenagem (fast-in, slow-out) — ideal para parar em gap.
 * - COAST: andamento estável — ideal para movimentos longos suaves.
 *
 * Usar com framer-motion `transition.ease` ou CSS `transition-timing-function`.
 */
export const EASE_F1_BRAKE = [0.16, 1, 0.3, 1] as const;
