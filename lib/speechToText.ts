export interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export class SpeechToTextService {
  private recognition: SpeechRecognition | null = null;
  private isSupported = false;

  constructor() {
    this.isSupported = this.checkSupport();
    if (this.isSupported) {
      this.initializeRecognition();
    }
  }

  private checkSupport(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  private initializeRecognition(): void {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
    }
  }

  public get supported(): boolean {
    return this.isSupported;
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onStart: () => void,
    onEnd: () => void
  ): void {
    if (!this.recognition || !this.isSupported) {
      onError('Speech recognition not supported');
      return;
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript, true);
      }
      if (interimTranscript) {
        onResult(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not available';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied';
          break;
        case 'network':
          errorMessage = 'Network error';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }
      
      onError(errorMessage);
    };

    this.recognition.onstart = onStart;
    this.recognition.onend = onEnd;

    try {
      this.recognition.start();
    } catch {
      onError('Failed to start speech recognition');
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  public abortListening(): void {
    if (this.recognition) {
      this.recognition.abort();
    }
  }
}
