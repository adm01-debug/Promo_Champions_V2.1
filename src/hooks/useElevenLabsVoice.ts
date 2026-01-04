import { useState } from 'react';

export const useElevenLabsVoice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const synthesize = async (text: string, voiceId: string = 'default') => {
    setIsLoading(true);
    
    try {
      // Integration with ElevenLabs API
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      );
      
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      return url;
    } catch (error) {
      console.error('ElevenLabs synthesis error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { synthesize, isLoading, audioUrl };
};
