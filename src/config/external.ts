/**
 * URLs externas centralizadas do PROMO CHAMPIONS.
 * `VITE_APP_URL`/`VITE_CANONICAL_URL` permitem sobrescrever em build/deploy;
 * os demais são endpoints de terceiros com fallback para o valor padrão.
 */
// ── URLs do próprio app ──
/** URL pública do app (deploy Lovable). Sobrescrever com VITE_APP_URL em outros ambientes. */
export const APP_URL =
  import.meta.env.VITE_APP_URL ?? 'https://championgifts.lovable.app';
/** Domínio canônico de produção (SEO/links públicos). */
export const CANONICAL_URL =
  import.meta.env.VITE_CANONICAL_URL ?? 'https://promochampions.com.br';
// ── Serviços externos ──
export const WA_ME_URL = 'https://wa.me';
export const DICEBEAR_AVATARS_URL = 'https://api.dicebear.com/7.x/avataaars/svg';
export const PRAVATAR_URL = 'https://i.pravatar.cc/150';
export const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
export const PWNED_PASSWORDS_RANGE_URL = 'https://api.pwnedpasswords.com/range';
export const CARBON_FIBRE_TEXTURE_URL =
  'https://www.transparenttextures.com/patterns/carbon-fibre.png';
