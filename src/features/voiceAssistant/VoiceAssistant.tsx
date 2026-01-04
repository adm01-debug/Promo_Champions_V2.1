// AI Voice Assistant Component
import React, { useState } from 'react';
import { useElevenLabsVoice } from '@/hooks/useElevenLabsVoice';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';

export const VoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { synthesize, isLoading, audioUrl } = useElevenLabsVoice();
  
  const startListening = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported');
      return;
    }
    
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      
      // Process command
      const response = await processVoiceCommand(text);
      
      // Speak response
      if (response) {
        await synthesize(response);
      }
    };
    
    recognition.start();
  };
  
  const stopListening = () => {
    setIsListening(false);
  };
  
  const processVoiceCommand = async (command: string): Promise<string> => {
    const lower = command.toLowerCase();
    
    if (lower.includes('show') && lower.includes('deals')) {
      return 'Opening deals dashboard';
    }
    
    if (lower.includes('create') && lower.includes('client')) {
      return 'Opening new client form';
    }
    
    if (lower.includes('revenue')) {
      return 'Your total revenue this month is fifty thousand dollars';
    }
    
    return 'I did not understand that command';
  };
  
  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };
  
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">AI Voice Assistant</h3>
      
      <div className="flex gap-2 mb-4">
        <Button
          onClick={isListening ? stopListening : startListening}
          variant={isListening ? 'destructive' : 'default'}
        >
          {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
          {isListening ? 'Stop' : 'Start Listening'}
        </Button>
        
        {audioUrl && (
          <Button onClick={playAudio} variant="outline">
            <Volume2 className="w-4 h-4 mr-2" />
            Play Response
          </Button>
        )}
      </div>
      
      {transcript && (
        <div className="p-3 bg-gray-100 rounded">
          <p className="text-sm"><strong>You said:</strong> {transcript}</p>
        </div>
      )}
      
      {isLoading && <p className="text-sm text-gray-500">Processing...</p>}
    </div>
  );
};
