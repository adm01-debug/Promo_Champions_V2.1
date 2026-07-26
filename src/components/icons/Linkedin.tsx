import { forwardRef, type SVGProps } from 'react';

export interface LinkedinIconProps extends SVGProps<SVGSVGElement> {
  /** Tamanho em px (equivalente ao prop `size` do lucide-react). */
  size?: number | string;
  /** Espessura do traço (compatibilidade com a API do lucide-react). */
  strokeWidth?: number | string;
}

/**
 * Ícone LinkedIn compatível com a API do lucide-react.
 *
 * Motivo: as versões recentes do `lucide-react` removeram os ícones de marca
 * (brand icons), então mantemos uma implementação local para preservar a UI
 * sem depender de um pacote extra.
 */
export const Linkedin = forwardRef<SVGSVGElement, LinkedinIconProps>(function Linkedin(
  { size = 24, strokeWidth = 2, color = 'currentColor', ...props },
  ref,
) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
});

export default Linkedin;
