/**
 * Curvas de easing inspiradas em telemetria F1 real.
 * - ACCEL: arrancada (slow-in, fast-out) — ideal para overtakes.
 * - BRAKE: frenagem (fast-in, slow-out) — ideal para parar em gap.
 * - COAST: andamento estável — ideal para movimentos longos suaves.
 *
 * Usar com framer-motion `transition.ease` ou CSS `transition-timing-function`.
 */
export const EASE_F1_ACCEL = [0.22, 0.61, 0.36, 1] as const;
export const EASE_F1_BRAKE = [0.16, 1, 0.3, 1] as const;
export const EASE_F1_COAST = [0.45, 0, 0.55, 1] as const;

export const EASE_F1_ACCEL_CSS = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
export const EASE_F1_BRAKE_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const EASE_F1_COAST_CSS = 'cubic-bezier(0.45, 0, 0.55, 1)';
