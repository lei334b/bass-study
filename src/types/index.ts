export interface RhythmPattern {
  pattern: string;
  name: string;
}

export interface PlaybackOptions {
  bpm: number;
  metronomeEnabled: boolean;
  loopEnabled: boolean;
  sound: number;
  lowerOctave: boolean;
  metronomeVolume: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  isStopping: boolean;
  currentTimeout: number | null;
  currentSynth: any | null;
  loopTimeout: number | null;
  metronomeTimeouts: number[];
}

export type PatternMode = 'default' | 'custom';

export interface RhythmVariation {
  rhythm: string[];
  modifiedIndex: number;
  modifiedPattern: string;
}

export interface AbcOptions {
  responsive: 'resize';
  visualTranspose: number;
  add_classes?: boolean;
  staffwidth: number;
}