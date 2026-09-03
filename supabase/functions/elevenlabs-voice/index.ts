import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { fetchWithTimeout } from '../_shared/fetch-with-timeout.ts';
import {
  withEdgeCircuitBreaker,
  CircuitBreakerOpenError,
} from '../_shared/circuit-breaker.ts';

Deno.serve(
  withRequestId('elevenlabs-voice', async (req, _ctx) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const { text, voiceId, action = 'tts' } = await req.json();

      const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'ELEVENLABS_API_KEY is not configured' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (action === 'tts') {
        if (!text || !voiceId) {
          return new Response(JSON.stringify({ error: 'Missing text or voiceId' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        let response: Response;
        try {
          response = await withEdgeCircuitBreaker(
            'elevenlabs:voice',
            async () => {
              const r = await fetchWithTimeout(
                `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                  },
                  body: JSON.stringify({
                    text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: {
                      stability: 0.5,
                      similarity_boost: 0.5,
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
          console.error('ElevenLabs error:', errorText);
          return new Response(JSON.stringify({ error: 'Failed to synthesize speech' }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const audioBuffer = await response.arrayBuffer();
        return new Response(audioBuffer, {
          headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
        });
      }

      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error in elevenlabs-voice:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  })
);
