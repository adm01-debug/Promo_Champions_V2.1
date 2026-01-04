import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { VoiceAssistant } from '@/lib/voiceAssistant';

const assistant = new VoiceAssistant();

export function VoiceControl() {
  const [isListening, setIsListening] = useState(false);

  const handleToggle = () => {
    if (isListening) {
      assistant.stopListening();
      setIsListening(false);
    } else {
      assistant.startListening((text) => {
        console.log('Voice input:', text);
        // Process voice command
      });
      setIsListening(true);
    }
  };

  return (
    <Button
      variant={isListening ? 'destructive' : 'outline'}
      size="icon"
      onClick={handleToggle}
    >
      {isListening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
    </Button>
  );
}
