// Melhoria 127 - AI Voice Assistant Enhancement

import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

class AIVoiceAssistant {
  private recognizer: sdk.SpeechRecognizer | null = null;
  private synthesizer: sdk.SpeechSynthesizer | null = null;

  async initialize() {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      import.meta.env.VITE_AZURE_SPEECH_KEY,
      import.meta.env.VITE_AZURE_SPEECH_REGION
    );

    speechConfig.speechRecognitionLanguage = 'pt-BR';
    speechConfig.speechSynthesisVoiceName = 'pt-BR-FranciscaNeural';

    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    this.recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    this.synthesizer = new sdk.SpeechSynthesizer(speechConfig);
  }

  async startListening(
    onResult: (text: string) => void,
    onError?: (error: string) => void
  ) {
    if (!this.recognizer) await this.initialize();

    this.recognizer!.recognizeOnceAsync(
      (result) => {
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          onResult(result.text);
        }
      },
      (error) => {
        if (onError) onError(error);
      }
    );
  }

  async speak(text: string) {
    if (!this.synthesizer) await this.initialize();

    return new Promise((resolve, reject) => {
      this.synthesizer!.speakTextAsync(
        text,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            resolve(result);
          }
        },
        (error) => reject(error)
      );
    });
  }

  async processCommand(command: string): Promise<string> {
    // Send to AI for processing
    const response = await fetch('/api/ai/process-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });

    const { answer } = await response.json();
    return answer;
  }

  async startConversation() {
    await this.speak('Olá! Como posso ajudar você hoje?');

    this.startListening(
      async (text) => {
        console.log('User said:', text);

        const response = await this.processCommand(text);
        await this.speak(response);

        // Continue listening
        setTimeout(() => this.startConversation(), 1000);
      },
      (error) => {
        console.error('Speech recognition error:', error);
      }
    );
  }

  stop() {
    this.recognizer?.close();
    this.synthesizer?.close();
  }
}

export const voiceAssistant = new AIVoiceAssistant();

// Usage:
// <button onClick={() => voiceAssistant.startConversation()}>
//   🎤 Start Voice Assistant
// </button>
