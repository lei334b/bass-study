import { AudioManager } from './AudioManager';

export class Metronome {
  private _volume: number = 0.3;

  get volume(): number {
    return this._volume;
  }

  set volume(value: number) {
    this._volume = Math.max(0, Math.min(1, value));
  }

  playClick(volume?: number): void {
    const audioManager = AudioManager.getInstance();
    const ctx = audioManager.ensureContext();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';

    const effectiveVolume = volume ?? this._volume;
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(effectiveVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    oscillator.start(now);
    oscillator.stop(now + 0.05);
  }

  scheduleClicks(
    audioContext: AudioContext,
    millisecondsPerBeat: number,
    totalDurationMs: number,
    startIndex: number = 0
  ): number[] {
    const timeoutIds: number[] = [];
    const totalBeats = Math.floor(totalDurationMs / millisecondsPerBeat);

    for (let beat = startIndex; beat < totalBeats; beat++) {
      const timeout = beat * millisecondsPerBeat;
      const timeoutId = window.setTimeout(() => {
        this.playClick();
      }, timeout);
      timeoutIds.push(timeoutId);
    }

    return timeoutIds;
  }

  clearTimeouts(timeoutIds: number[]): void {
    timeoutIds.forEach(id => clearTimeout(id));
    timeoutIds.length = 0;
  }
}