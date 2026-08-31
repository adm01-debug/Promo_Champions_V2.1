const STORAGE_AUDIO_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/wav',
  'audio/x-wav',
  'audio/vnd.wave',
  'audio/webm',
  'audio/ogg',
  'video/webm',
  'video/mp4',
]);

const MIME_BY_EXTENSION: Record<string, string> = {
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  webm: 'audio/webm',
};

export function resolveRecordingMimeType(file: Pick<File, 'name' | 'type'>): string {
  const browserMime = file.type.trim().toLowerCase();
  if (STORAGE_AUDIO_MIME_TYPES.has(browserMime)) return browserMime;

  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  return (MIME_BY_EXTENSION[extension] ?? browserMime) || 'audio/mpeg';
}
