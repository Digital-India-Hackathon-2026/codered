import LiveAudioStream from 'react-native-live-audio-stream';
import { Platform, PermissionsAndroid } from 'react-native';

import { env } from '../config/env';

const DEEPGRAM_API_KEY = env.DEEPGRAM_API_KEY;

type TranscriptCallback = (text: string, isFinal: boolean) => void;
type StateCallback = (state: 'idle' | 'recording' | 'paused' | 'processing') => void;
type AutoSendCallback = (finalText: string) => void;

class DeepgramVoiceService {
  private ws: WebSocket | null = null;
  private isRecording = false;
  private isPaused = false;
  private language: 'en' | 'te' = 'en';
  private onTranscript: TranscriptCallback | null = null;
  private onStateChange: StateCallback | null = null;
  private onAutoSend: AutoSendCallback | null = null;
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private accumulatedText = '';
  private lastFinalTime = 0;
  private autoSendEnabled = true;
  private silenceTimeout = 2000; // 2s silence = auto stop & send

  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        { title: 'Microphone', message: 'LifeLens needs mic access for voice input.', buttonPositive: 'Allow' }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  async start(
    language: 'en' | 'te',
    onTranscript: TranscriptCallback,
    onStateChange?: StateCallback,
    onAutoSend?: AutoSendCallback,
  ): Promise<boolean> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return false;

    this.language = language;
    this.onTranscript = onTranscript;
    this.onStateChange = onStateChange || null;
    this.onAutoSend = onAutoSend || null;
    this.accumulatedText = '';
    this.lastFinalTime = Date.now();
    this.isPaused = false;

    const url = `wss://api.deepgram.com/v1/listen?model=nova-3&language=${language}&encoding=linear16&sample_rate=16000&channels=1&endpointing=300&interim_results=true&punctuate=true&smart_format=true`;

    // @ts-ignore - React Native WebSocket supports headers in 3rd arg
    this.ws = new WebSocket(url, null, { headers: { Authorization: `Token ${DEEPGRAM_API_KEY}` } });

    return new Promise((resolve) => {
      if (!this.ws) { resolve(false); return; }

      this.ws.onopen = () => {
        LiveAudioStream.init({
          sampleRate: 16000,
          channels: 1,
          bitsPerSample: 16,
          audioSource: 6,
          wavFile: '',
        } as any);

        LiveAudioStream.start();
        this.isRecording = true;
        this.onStateChange?.('recording');

        LiveAudioStream.on('data', (base64: string) => {
          if (this.ws?.readyState === WebSocket.OPEN && !this.isPaused) {
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            this.ws.send(bytes.buffer);
          }
        });

        resolve(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          const transcript = data?.channel?.alternatives?.[0]?.transcript;
          const isFinal = data?.is_final === true;

          if (transcript && transcript.trim()) {
            if (isFinal) {
              this.accumulatedText += (this.accumulatedText ? ' ' : '') + transcript.trim();
              this.lastFinalTime = Date.now();
              this.resetSilenceTimer();
            }
            this.onTranscript?.(transcript, isFinal);
          }
        } catch {}
      };

      this.ws.onerror = () => {
        this.cleanup();
        resolve(false);
      };

      this.ws.onclose = () => {
        this.isRecording = false;
        this.onStateChange?.('idle');
      };
    });
  }

  private resetSilenceTimer() {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (!this.autoSendEnabled) return;

    this.silenceTimer = setTimeout(() => {
      // Auto-stop and send after silence
      if (this.isRecording && this.accumulatedText.trim()) {
        const text = this.accumulatedText.trim();
        this.stopAndSend();
        this.onAutoSend?.(text);
      }
    }, this.silenceTimeout);
  }

  pause() {
    if (this.isRecording && !this.isPaused) {
      this.isPaused = true;
      this.onStateChange?.('paused');
      if (this.silenceTimer) clearTimeout(this.silenceTimer);
    }
  }

  resume() {
    if (this.isRecording && this.isPaused) {
      this.isPaused = false;
      this.onStateChange?.('recording');
      this.lastFinalTime = Date.now();
      this.resetSilenceTimer();
    }
  }

  togglePause() {
    if (this.isPaused) this.resume();
    else this.pause();
  }

  stopAndSend(): string {
    const text = this.accumulatedText.trim();
    this.cleanup();
    return text;
  }

  stop(): string {
    const text = this.accumulatedText.trim();
    this.cleanup();
    return text;
  }

  private cleanup() {
    if (this.silenceTimer) { clearTimeout(this.silenceTimer); this.silenceTimer = null; }
    if (this.isRecording) {
      LiveAudioStream.stop();
      this.isRecording = false;
    }
    this.isPaused = false;
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'CloseStream' }));
      }
      this.ws.close();
      this.ws = null;
    }
    this.onTranscript = null;
    this.onStateChange?.('idle');
    this.onStateChange = null;
  }

  getState(): 'idle' | 'recording' | 'paused' {
    if (!this.isRecording) return 'idle';
    if (this.isPaused) return 'paused';
    return 'recording';
  }

  getAccumulatedText(): string {
    return this.accumulatedText;
  }

  setAutoSend(enabled: boolean, timeoutMs?: number) {
    this.autoSendEnabled = enabled;
    if (timeoutMs) this.silenceTimeout = timeoutMs;
  }
}

export const deepgramVoice = new DeepgramVoiceService();
