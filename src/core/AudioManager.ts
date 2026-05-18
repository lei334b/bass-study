export class AudioManager {
  private static instance: AudioManager | null = null;
  private _audioContext: AudioContext | null = null;
  private _initialized = false;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  get audioContext(): AudioContext | null {
    return this._audioContext;
  }

  init(): AudioContext {
    if (!this._audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this._audioContext = new AudioContextClass();
    }
    
    if (!this._initialized) {
      this.setupActivationHandlers();
      this._initialized = true;
    }

    if (this._audioContext.state === 'suspended') {
      this._audioContext.resume();
    }

    return this._audioContext;
  }

  private setupActivationHandlers(): void {
    const activateAudio = () => {
      if (this._audioContext && this._audioContext.state === 'suspended') {
        this._audioContext.resume();
      }
    };

    document.addEventListener('click', activateAudio, { once: true });
    document.addEventListener('touchstart', activateAudio, { once: true });
  }

  resume(): void {
    if (this._audioContext && this._audioContext.state === 'suspended') {
      this._audioContext.resume();
    }
  }

  ensureContext(): AudioContext {
    if (!this._audioContext) {
      return this.init();
    }
    this.resume();
    return this._audioContext;
  }
}