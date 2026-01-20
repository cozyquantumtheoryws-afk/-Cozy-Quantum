
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voiceId } = await req.json();

    if (!ELEVEN_LABS_API_KEY) {
      throw new Error('Missing ELEVEN_LABS_API_KEY');
    }

    // Default to Artie's Voice (or the one provided in prompt JBFqnCBsd6RMkjVDRZzb)
    const voice = voiceId || 'JBFqnCBsd6RMkjVDRZzb'; 

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          output_format: 'mp3_44100_128',
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API Error:", errorText);
      throw new Error(`ElevenLabs error: ${response.statusText}`);
    }

    // Stream the audio back directly
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
      },
    });

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
