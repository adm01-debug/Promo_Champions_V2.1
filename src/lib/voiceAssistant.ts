export class VoiceAssistant {
  private recognition: any;
  private synthesis: SpeechSynthesis;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'pt-BR';
    }
    this.synthesis = window.speechSynthesis;
  }

  startListening(onResult: (text: string) => void) {
    if (!this.recognition) {
      console.error('Speech recognition not supported');
      return;
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.start();
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  speak(text: string, lang = 'pt-BR') {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    this.synthesis.speak(utterance);
  }

  stop() {
    this.synthesis.cancel();
  }
}
