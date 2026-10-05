// _shared/file-signature.ts
// Validação de "magic bytes" (assinatura binária) para uploads.
// O Content-Type declarado pelo cliente é apenas um header — o servidor
// precisa conferir os primeiros bytes do arquivo antes de armazenar,
// transcrever ou repassar a terceiros (ElevenLabs, AI gateway, Storage
// público). Rejeitar divergências evita que HTML/EXE/scripts cheguem ao
// bucket ou ao provider disfarçados de áudio/PDF/imagem.

export type FileSignature =
  | 'wav'
  | 'mp3'
  | 'ogg'
  | 'webm'
  | 'mp4' // também cobre m4a/mov (container ISO BMFF)
  | 'flac'
  | 'pdf'
  | 'png'
  | 'jpeg'
  | 'webp'
  | 'exe' // MZ/PE — sempre rejeitar em uploads de mídia
  | 'elf'
  | 'zip' // inclui docx/xlsx/apk — não é mídia
  | 'html' // <!DOCTYPE html / <html — XSS armazenado se subir como "pdf"
  | null;

const AUDIO_SIGNATURES: ReadonlySet<Exclude<FileSignature, null>> = new Set([
  'wav',
  'mp3',
  'ogg',
  'webm',
  'mp4',
  'flac',
]);

function ascii(bytes: Uint8Array, start: number, len: number): string {
  let s = '';
  for (let i = start; i < start + len && i < bytes.length; i++) {
    s += String.fromCharCode(bytes[i]);
  }
  return s;
}

/**
 * Detecta a assinatura binária do arquivo. Retorna `null` quando nenhuma
 * assinatura conhecida bate (ex.: texto puro, PCM cru, formatos fora da
 * tabela) — o chamador decide se rejeita ou permite.
 */
export function detectFileSignature(bytes: Uint8Array): FileSignature {
  if (bytes.length < 4) return null;

  // RIFF container: WAV (....WAVE) ou WEBP (....WEBP)
  if (ascii(bytes, 0, 4) === 'RIFF' && bytes.length >= 12) {
    const form = ascii(bytes, 8, 4);
    if (form === 'WAVE') return 'wav';
    if (form === 'WEBP') return 'webp';
    return null;
  }

  // MP3: tag ID3 ou frame sync 0xFF Ex
  if (ascii(bytes, 0, 3) === 'ID3') return 'mp3';
  if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return 'mp3';

  // Ogg container (Vorbis/Opus)
  if (ascii(bytes, 0, 4) === 'OggS') return 'ogg';

  // WebM/Matroska: EBML header 1A 45 DF A3
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return 'webm';
  }

  // ISO BMFF (mp4/m4a/mov): ....ftyp
  if (bytes.length >= 8 && ascii(bytes, 4, 4) === 'ftyp') return 'mp4';

  // FLAC
  if (ascii(bytes, 0, 4) === 'fLaC') return 'flac';

  // PDF
  if (ascii(bytes, 0, 4) === '%PDF') return 'pdf';

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'png';
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';

  // Executáveis — nunca aceitar em uploads de mídia
  if (ascii(bytes, 0, 2) === 'MZ') return 'exe';
  if (bytes[0] === 0x7f && ascii(bytes, 1, 3) === 'ELF') return 'elf';

  // ZIP (PK\x03\x04) — cobre docx/xlsx/apk
  if (
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07)
  ) {
    return 'zip';
  }

  // HTML disfarçado — prefixo textual típico (com whitespace antes)
  const head = ascii(bytes, 0, Math.min(bytes.length, 512)).trimStart().toLowerCase();
  if (head.startsWith('<!doctype html') || head.startsWith('<html')) return 'html';

  return null;
}

export interface SignatureCheck {
  ok: boolean;
  detected: FileSignature;
  reason?: string;
}

/**
 * Confere os bytes contra o conjunto de assinaturas permitidas.
 * Regra: assinatura conhecida fora do conjunto OU assinatura desconhecida
 * => rejeita (postura fail-closed para ingestão de mídia).
 */
export function checkFileSignature(
  bytes: Uint8Array,
  allowed: ReadonlySet<Exclude<FileSignature, null>>,
): SignatureCheck {
  const detected = detectFileSignature(bytes);
  if (detected === null) {
    return { ok: false, detected, reason: 'signature_unrecognized' };
  }
  if (!allowed.has(detected)) {
    return { ok: false, detected, reason: 'signature_mismatch' };
  }
  return { ok: true, detected };
}

/** Atalho: valida bytes como áudio suportado pelos providers de STT/TTS. */
export function checkAudioSignature(bytes: Uint8Array): SignatureCheck {
  return checkFileSignature(bytes, AUDIO_SIGNATURES);
}
