import { corsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { getUserClient, UnauthorizedError } from '../_shared/auth-client.ts';
import { fetchWithTimeout } from '../_shared/fetch-with-timeout.ts';
import {
  withEdgeCircuitBreaker,
  CircuitBreakerOpenError,
} from '../_shared/circuit-breaker.ts';

const MAX_TEXT_LENGTH = 2000;

Deno.serve(
  withRequestId('elevenlabs-tts', async (req, _ctx) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Require a valid Supabase JWT — prevents anonymous billing abuse
      try {
        await getUserClient(req);
      } catch (authErr) {
        const isUnauth = authErr instanceof UnauthorizedError;
        return new Response(
          JSON.stringify({ error: isUnauth ? authErr.message : 'unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { text, voiceId } = await req.json();

      if (typeof text === 'string' && text.length > MAX_TEXT_LENGTH) {
        return new Response(
          JSON.stringify({
            error: 'text_too_long',
            message: `text must be ≤ ${MAX_TEXT_LENGTH} chars`,
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!text) {
        throw new Error('Text is required');
      }

      const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

      if (!ELEVENLABS_API_KEY) {
        console.info(
          'ElevenLabs API key not configured - returning placeholder response'
        );
        return new Response(
          JSON.stringify({
            error: 'api_key_not_configured',
            message:
              'ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY to secrets.',
          }),
          {
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Default voice: Roger (professional male voice in PT-BR)
      const selectedVoiceId = voiceId || 'CwhRBWXzGAHq8TQ4Fs17';

      console.info(
        `Generating TTS for text (${text.length} chars) with voice ${selectedVoiceId}`
      );

      let response: Response;
      try {
        response = await withEdgeCircuitBreaker(
          'elevenlabs:tts',
          async () => {
            const r = await fetchWithTimeout(
              `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
              {
                method: 'POST',
                headers: {
                  'xi-api-key': ELEVENLABS_API_KEY,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  text,
                  model_id: 'eleven_multilingual_v2',
                  output_format: 'mp3_44100_128',
                  voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.3,
                    use_speaker_boost: true,
                    speed: 1.0,
                  },
                }),
              }
            );
            if (r.status >= 500) throw new Error(`elevenlabs_5xx_${r.status}`);
            return r;
          },
          { failureThreshold: 5, resetTimeout: 30_000, timeoutMs: 35_000 }
        );
      } catch (err) {
        if (err instanceof CircuitBreakerOpenError) {
          return new Response(
            JSON.stringify({
              error: 'circuit_open',
              message: 'ElevenLabs temporariamente indisponível',
            }),
            {
              status: 503,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        throw err;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', response.status, errorText);

        if (response.status === 401) {
          return new Response(
            JSON.stringify({
              error: 'invalid_api_key',
              message: 'Invalid ElevenLabs API key',
            }),
            {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        if (response.status === 429) {
          return new Response(
            JSON.stringify({
              error: 'rate_limit',
              message: 'ElevenLabs rate limit exceeded',
            }),
            {
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(audioBuffer);
      let binary = '';
      for (const byte of bytes) binary += String.fromCharCode(byte);
      const base64Audio = btoa(binary);
      console.info(
        `TTS generated successfully, audio size: ${audioBuffer.byteLength} bytes`
      );

      return new Response(JSON.stringify({ audioContent: base64Audio }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('TTS error:', error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  })
);
