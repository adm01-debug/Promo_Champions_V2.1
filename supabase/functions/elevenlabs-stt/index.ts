import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();

    if (!audio) {
      throw new Error('Audio data is required');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      console.info('ElevenLabs API key not configured - returning placeholder response');
      return new Response(
        JSON.stringify({ 
          error: 'api_key_not_configured',
          message: 'ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY to secrets.' 
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
    formData.append('audio', new Blob([audioBytes], { type: 'audio/webm' }), 'audio.webm');
    formData.append('model_id', 'scribe_v1');
    formData.append('language_code', 'pt');

    console.info(`Processing STT for audio (${audioBytes.length} bytes)`);

    const response = await fetch(
      'https://api.elevenlabs.io/v1/speech-to-text',
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs STT API error:', response.status, errorText);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'invalid_api_key', message: 'Invalid ElevenLabs API key' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'rate_limit', message: 'ElevenLabs rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`ElevenLabs STT API error: ${response.status}`);
    }

    const result = await response.json();
    console.info('STT result:', result);

    return new Response(
      JSON.stringify({ 
        text: result.text || '',
        language: result.language_code || 'pt'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('STT error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
