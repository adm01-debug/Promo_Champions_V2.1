import { corsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { getUserClient, UnauthorizedError } from '../_shared/auth-client.ts';
import { fetchWithTimeout } from '../_shared/fetch-with-timeout.ts';
import {
  withEdgeCircuitBreaker,
  CircuitBreakerOpenError,
} from '../_shared/circuit-breaker.ts';

const MAX_AUDIO_BASE64_LENGTH = 10 * 1024 * 1024; // ~7.5 MB decoded

Deno.serve(
  withRequestId('elevenlabs-stt', async (req, _ctx) => {
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

      const { audio } = await req.json();

      if (typeof audio === 'string' && audio.length > MAX_AUDIO_BASE64_LENGTH) {
        return new Response(
          JSON.stringify({
            error: 'audio_too_large',
            message: 'Audio payload exceeds maximum allowed size',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!audio) {
        throw new Error('Audio data is required');
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

      // Decode base64 audio
      const audioBytes = Uint8Array.from(atob(audio), c => c.charCodeAt(0));

      // Create form data for the API
      const formData = new FormData();
      formData.append(
        'audio',
        new Blob([audioBytes], { type: 'audio/webm' }),
        'audio.webm'
      );
      formData.append('model_id', 'scribe_v1');
      formData.append('language_code', 'pt');

      console.info(`Processing STT for audio (${audioBytes.length} bytes)`);

      let response: Response;
      try {
        response = await withEdgeCircuitBreaker(
          'elevenlabs:stt',
          async () => {
            const r = await fetchWithTimeout(
              'https://api.elevenlabs.io/v1/speech-to-text',
              {
                method: 'POST',
                headers: {
                  'xi-api-key': ELEVENLABS_API_KEY,
                },
                body: formData,
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
        console.error('ElevenLabs STT API error:', response.status, errorText);

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

        throw new Error(`ElevenLabs STT API error: ${response.status}`);
      }

      const result = await response.json();
      console.info('STT result:', result);

      return new Response(
        JSON.stringify({
          text: result.text || '',
          language: result.language_code || 'pt',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('STT error:', error);
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
