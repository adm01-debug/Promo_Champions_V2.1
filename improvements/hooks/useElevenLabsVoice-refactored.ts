import { useState, useRef } from 'react';

interface ElevenLabsVoiceOptions {
  model?: string;
  voice_settings?: VoiceSettings;
}

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
}

interface UseElevenLabsVoiceReturn {
  speak: (text: string, options?: ElevenLabsVoiceOptions) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
}

const ELEVEN_LABS_API = 'https://api.elevenlabs.io/v1/text-to-speech';
const API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY || '';

const defaultSettings: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75
};

export const useElevenLabsVoice = (): UseElevenLabsVoiceReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const speak = async (
    text: string, 
    options?: ElevenLabsVoiceOptions
  ): Promise<void> => {
    try {
      const response = await fetch(ELEVEN_LABS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: options?.model ?? 'eleven_monolingual_v1',
          voice_settings: options?.voice_settings ?? defaultSettings
        })
      });
      
      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }
      
      const audioBlob: Blob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        console.error('Audio playback error');
      };
      
      await audio.play();
      
      audioRef.current = audio;
      setIsPlaying(true);
    } catch (error) {
      console.error('Voice synthesis error:', error);
      setIsPlaying(false);
      throw error;
    }
  };
  
  const stop = (): void => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };
  
  return { speak, stop, isPlaying };
};
