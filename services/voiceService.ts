
export class VoiceTacticalEngine {
  private recognition: any;
  private isListening: boolean = false;

  constructor(onCommand: (command: string) => void) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.lang = 'pt-PT';
      this.recognition.interimResults = false;

      this.recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase().trim();
        onCommand(command);
      };

      this.recognition.onerror = () => {
        this.isListening = false;
      };
    }
  }

  start() {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
      this.isListening = true;
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
