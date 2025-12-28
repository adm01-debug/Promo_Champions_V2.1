// Melhoria 127 - AI Voice Assistant Integration
import { useElevenLabsVoice } from '@/hooks/useElevenLabsVoice';
import { useSalesAssistant } from '@/hooks/useSalesAssistant';

export const AIVoiceAssistant = () => {
  const { speak, isPlaying } = useElevenLabsVoice();
  const { getResponse } = useSalesAssistant();
  const [transcript, setTranscript] = useState('');

  const handleVoiceCommand = async (command: string) => {
    setTranscript(command);
    
    // Get AI response
    const response = await getResponse(command);
    
    // Speak response
    speak(response.text);
    
    // Execute action if needed
    if (response.action) {
      executeAction(response.action);
    }
  };

  const startListening = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript;
      handleVoiceCommand(command);
    };
    recognition.start();
  };

  return (
    <div>
      <Button onClick={startListening}>🎤 Ask Assistant</Button>
      {transcript && <p>You said: {transcript}</p>}
      {isPlaying && <p>🔊 Speaking...</p>}
    </div>
  );
};
