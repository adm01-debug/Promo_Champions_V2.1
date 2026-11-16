import { describe, expect, it } from 'vitest';
import { resolveRecordingMimeType } from './recordingMime';

describe('resolveRecordingMimeType', () => {
  it.each([
    ['call.wav', 'audio/vnd.wave', 'audio/vnd.wave'],
    ['call.wav', 'application/octet-stream', 'audio/wav'],
    ['call.m4a', 'application/octet-stream', 'audio/mp4'],
    ['call.mp3', '', 'audio/mpeg'],
    ['call.webm', 'audio/webm', 'audio/webm'],
  ])('normaliza %s (%s) para %s', (name, type, expected) => {
    expect(resolveRecordingMimeType({ name, type })).toBe(expected);
  });

  it('preserva MIME desconhecido para o Storage rejeitá-lo', () => {
    expect(
      resolveRecordingMimeType({ name: 'arquivo.bin', type: 'application/x-custom' })
    ).toBe('application/x-custom');
  });
});
