import { AudioManager } from '../core/AudioManager';
import { Metronome } from '../core/Metronome';
import type { RhythmPattern, PatternMode } from '../types';

export abstract class BaseRhythmEngine {
  protected audioManager: AudioManager;
  protected metronome: Metronome;

  protected _bpm: number = 70;
  protected _metronomeEnabled: boolean = true;
  protected _loopEnabled: boolean = false;
  protected _selectedSound: number = 0;
  protected _lowerOctave: boolean = false;
  protected _patternMode: PatternMode = 'default';
  protected _selectedPatterns: Set<number> = new Set();

  protected isPlaying: boolean = false;
  protected isStopping: boolean = false;
  protected currentTimeout: number | null = null;
  protected currentSynth: any = null;
  protected loopTimeout: number | null = null;
  protected metronomeTimeouts: number[] = [];

  protected visualObj: any = null;

  protected rhythmPatterns: RhythmPattern[] = [
    { pattern: 'C2', name: '四分音符' },
    { pattern: 'CC', name: '八分音符' },
    { pattern: 'C/2C/2C/2C/2', name: '十六分音符' },
    { pattern: '(3CCC', name: '三连音' },
    { pattern: 'C>C', name: '前附点' },
    { pattern: 'C<C', name: '后附点' },
    { pattern: 'CC/2C/2', name: '前八后十六' },
    { pattern: 'C/2C/2C', name: '前十六后八' },
    { pattern: 'C/2CC/2', name: '切分' },
    { pattern: 'z/2C3/2', name: '2点位' },
    { pattern: 'zC', name: '反拍' },
    { pattern: 'z3/2C/2', name: '4点位' },
    { pattern: 'z/2C/2C/2C/2', name: '234点位' },
    { pattern: 'z/2C/2C/2z/2', name: '23点位' },
    { pattern: 'zC/2C/2', name: '34点位' },
    { pattern: 'z/2 C/2 z/2 C/2', name: '24点位' }
  ];

  protected soundDefaultOctave: { [key: number]: boolean } = {
    0: false,
    33: true
  };

  constructor() {
    this.audioManager = AudioManager.getInstance();
    this.metronome = new Metronome();
    this.audioManager.init();
  }

  get bpm(): number { return this._bpm; }
  set bpm(value: number) {
    const MIN_BPM = 40;
    const MAX_BPM = 100;
    this._bpm = Math.min(Math.max(value, MIN_BPM), MAX_BPM);
  }

  get metronomeEnabled(): boolean { return this._metronomeEnabled; }
  set metronomeEnabled(value: boolean) { this._metronomeEnabled = value; }

  get loopEnabled(): boolean { return this._loopEnabled; }
  set loopEnabled(value: boolean) { this._loopEnabled = value; }

  get selectedSound(): number { return this._selectedSound; }
  set selectedSound(value: number) { this._selectedSound = value; }

  get lowerOctave(): boolean { return this._lowerOctave; }
  set lowerOctave(value: boolean) { this._lowerOctave = value; }

  get patternMode(): PatternMode { return this._patternMode; }
  set patternMode(value: PatternMode) { this._patternMode = value; }

  get metronomeVolume(): number { return this.metronome.volume; }
  set metronomeVolume(value: number) { this.metronome.volume = value; }

  protected buildAbcNotation(rhythm: string, title: string, midiProgram: number, lowerOctave: boolean): string {
    const lines = [
      'X:1',
      `T:${title}`,
      'M:4/4',
      'L:1/8',
      `%%MIDI program ${midiProgram}`
    ];
    
    if (lowerOctave) {
      lines.push('%%MIDI transpose -12');
    }
    
    lines.push('K:C', rhythm);
    
    return lines.join('\n');
  }

  protected stopPlayback(): void {
    this.isStopping = true;
    
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
    }
    
    this.metronome.clearTimeouts(this.metronomeTimeouts);
    
    if (this.currentSynth) {
      try {
        this.currentSynth.stop();
      } catch (e) {
        console.warn('停止播放失败:', e);
      }
      this.currentSynth = null;
    }
    
    this.isPlaying = false;
    
    setTimeout(() => {
      this.isStopping = false;
    }, 50);
  }

  protected scheduleLoop(callback: () => void): void {
    if (!this._loopEnabled) return;
    
    this.loopTimeout = window.setTimeout(() => {
      if (this._loopEnabled && !this.isStopping) {
        callback();
      }
    }, 1000);
  }

  protected get millisecondsPerBeat(): number {
    return (60 / this._bpm) * 1000;
  }

  protected get millisecondsPerMeasure(): number {
    return this.millisecondsPerBeat * 4;
  }

  protected playMetronomeClick(): void {
    this.metronome.playClick();
  }

  protected getAudioContext(): AudioContext {
    return this.audioManager.ensureContext();
  }

  protected updatePlayButton(buttonId: string, playing: boolean): void {
    const btnPlay = document.getElementById(buttonId);
    if (btnPlay) {
      btnPlay.textContent = playing ? '■ 停止' : '▶ 播放';
    }
  }

  protected enableButtons(playBtnId: string, showAnswerBtnId: string): void {
    const btnPlay = document.getElementById(playBtnId) as HTMLButtonElement;
    const btnShowAnswer = document.getElementById(showAnswerBtnId) as HTMLButtonElement;

    if (btnPlay) btnPlay.disabled = false;
    if (btnShowAnswer) btnShowAnswer.disabled = false;
  }

  protected abstract generateNewQuestion(): void;

  protected abstract play(): Promise<void>;

  protected abstract getButtonIds(): { play: string; showAnswer: string; bpm: string; bpmValue: string };
}