import * as ABCJS from 'abcjs';
import { BaseRhythmEngine } from './BaseRhythmEngine';
import type { RhythmVariation as RhythmVariationType } from '../types';

export class RhythmVariation extends BaseRhythmEngine {
  private originalRhythm: string[] = [];
  private variations: RhythmVariationType[] = [];
  private visualObjs: Map<string, any> = new Map();
  private currentPlayIndex: number = -1;
  private allRhythms: string[] = [];
  private patternListId: string = 'pattern-list-variation';

  constructor() {
    super();
    this.init();
  }

  private init(): void {
    this.bindEvents();
    this.initBpmControl();
    this.initMetronomeControl();
    this.initSoundControl();
    this.initOctaveControl();
    this.initPatternModeControl();
    this.initPatternCheckboxes();
    this.initLoopControl();
    this.initVolumeControl();
  }

  private bindEvents(): void {
    const btnPlay = document.getElementById('btn-play-variation');
    const btnShowAnswer = document.getElementById('btn-show-answer-variation');
    const btnNewQuestion = document.getElementById('btn-new-question-variation');

    btnPlay?.addEventListener('click', () => {
      if (this.isPlaying) {
        this.stopPlayback();
      } else {
        this.play();
      }
    });
    btnShowAnswer?.addEventListener('click', () => this.showVariations());
    btnNewQuestion?.addEventListener('click', () => this.generateNewQuestion());
  }

  private initBpmControl(): void {
    const bpmSlider = document.getElementById('bpm-slider-variation') as HTMLInputElement;
    const bpmValue = document.getElementById('bpm-value-variation');
    
    if (bpmSlider && bpmValue) {
      bpmSlider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.bpm = parseInt(target.value);
        bpmValue.textContent = this.bpm.toString();
      });
    }
  }

  private initMetronomeControl(): void {
    const metronomeCheckbox = document.getElementById('metronome-checkbox-variation') as HTMLInputElement;
    
    if (metronomeCheckbox) {
      metronomeCheckbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        this.metronomeEnabled = target.checked;
      });
    }
  }

  private initLoopControl(): void {
    const loopCheckbox = document.getElementById('loop-checkbox-variation') as HTMLInputElement;
    
    if (loopCheckbox) {
      loopCheckbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        this.loopEnabled = target.checked;
      });
    }
  }

  private initVolumeControl(): void {
    const metronomeVolumeSlider = document.getElementById('metronome-volume-slider-variation') as HTMLInputElement;
    const metronomeVolumeValue = document.getElementById('metronome-volume-value-variation');
    
    if (metronomeVolumeSlider) {
      metronomeVolumeSlider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.metronomeVolume = parseFloat(target.value);
        if (metronomeVolumeValue) {
          metronomeVolumeValue.textContent = this.metronomeVolume.toFixed(1);
        }
      });
    }
  }

  private initSoundControl(): void {
    const soundSelect = document.getElementById('sound-select-variation') as HTMLSelectElement;
    const octaveCheckbox = document.getElementById('octave-checkbox-variation') as HTMLInputElement;
    
    if (soundSelect) {
      soundSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        this.selectedSound = parseInt(target.value);
        if (octaveCheckbox) {
          this.lowerOctave = this.soundDefaultOctave[this.selectedSound] || false;
          octaveCheckbox.checked = this.lowerOctave;
        }
      });
    }
  }

  private initOctaveControl(): void {
    const octaveCheckbox = document.getElementById('octave-checkbox-variation') as HTMLInputElement;
    
    if (octaveCheckbox) {
      octaveCheckbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        this.lowerOctave = target.checked;
      });
    }
  }

  private initPatternModeControl(): void {
    const modeDefault = document.getElementById('mode-default-variation') as HTMLInputElement;
    const modeCustom = document.getElementById('mode-custom-variation') as HTMLInputElement;
    
    if (modeDefault && modeCustom) {
      modeDefault.addEventListener('change', () => {
        this.patternMode = 'default';
        this.updateAllCheckboxes(true);
        this.disableAllCheckboxes(true);
      });
      
      modeCustom.addEventListener('change', () => {
        this.patternMode = 'custom';
        this.disableAllCheckboxes(false);
      });
    }
  }

  private initPatternCheckboxes(): void {
    const patternList = document.getElementById(this.patternListId);
    if (!patternList) return;
    
    patternList.innerHTML = '';
    
    this.rhythmPatterns.forEach((item, index) => {
      const label = document.createElement('label');
      label.className = 'pattern-checkbox-label';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      checkbox.disabled = true;
      checkbox.dataset.index = index.toString();
      
      checkbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const idx = parseInt(target.dataset.index || '0');
        
        if (target.checked) {
          this._selectedPatterns.add(idx);
        } else {
          this._selectedPatterns.delete(idx);
        }
      });
      
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(item.name));
      patternList.appendChild(label);
      
      this._selectedPatterns.add(index);
    });
  }

  private updateAllCheckboxes(checked: boolean): void {
    const checkboxes = document.querySelectorAll(`#${this.patternListId} input[type="checkbox"]`);
    checkboxes.forEach((checkbox) => {
      (checkbox as HTMLInputElement).checked = checked;
    });
    
    this._selectedPatterns.clear();
    if (checked) {
      this.rhythmPatterns.forEach((_, index) => {
        this._selectedPatterns.add(index);
      });
    }
  }

  private disableAllCheckboxes(disabled: boolean): void {
    const checkboxes = document.querySelectorAll(`#${this.patternListId} input[type="checkbox"]`);
    checkboxes.forEach((checkbox) => {
      (checkbox as HTMLInputElement).disabled = disabled;
    });
  }

  private generateRandomRhythm(): string[] {
    if (this._selectedPatterns.size === 0) {
      alert('请至少选择一个节奏型！');
      return [];
    }
    
    const rhythms: string[] = [];
    const patternIndices = Array.from(this._selectedPatterns);
    
    for (let i = 0; i < 8; i++) {
      const randomIndex = patternIndices[Math.floor(Math.random() * patternIndices.length)];
      rhythms.push(this.rhythmPatterns[randomIndex].pattern);
    }

    return rhythms;
  }

  private generateUniquePattern(excludedPatterns: Set<string>): string {
    const patternIndices = Array.from(this._selectedPatterns);
    let maxAttempts = 100;
    
    while (maxAttempts > 0) {
      const randomIndex = patternIndices[Math.floor(Math.random() * patternIndices.length)];
      const pattern = this.rhythmPatterns[randomIndex].pattern;
      
      if (!excludedPatterns.has(pattern)) {
        return pattern;
      }
      maxAttempts--;
    }
    
    return this.rhythmPatterns[patternIndices[Math.floor(Math.random() * patternIndices.length)]].pattern;
  }

  private generateVariations(): void {
    this.variations = [];
    const usedPatterns = new Set(this.originalRhythm);
    
    for (let i = 0; i < 4; i++) {
      const modifiedIndex = Math.floor(Math.random() * 8);
      const newPattern = this.generateUniquePattern(usedPatterns);
      
      usedPatterns.add(newPattern);
      
      const newRhythm = [...this.originalRhythm];
      newRhythm[modifiedIndex] = newPattern;
      
      this.variations.push({
        rhythm: newRhythm,
        modifiedIndex: modifiedIndex,
        modifiedPattern: newPattern
      });
    }
  }

  public generateNewQuestion(): void {
    this.stopPlayback();
    this.visualObjs.clear();
    
    this.originalRhythm = this.generateRandomRhythm();
    
    if (this.originalRhythm.length === 0) return;
    
    this.generateVariations();

    this.renderOriginalRhythm();
    this.prepareCombinedPlayback();

    const display = document.getElementById('variation-display');
    if (display) {
      display.innerHTML = '<p class="hint">点击「显示答案」查看变体节奏型</p>';
    }

    this.enableButtons('btn-play-variation', 'btn-show-answer-variation');
  }

  private renderOriginalRhythm(): void {
    const display = document.getElementById('original-display');
    if (!display) return;

    display.innerHTML = '';

    const titleEl = document.createElement('div');
    titleEl.className = 'original-title';
    titleEl.textContent = '原始节奏';

    const container = document.createElement('div');
    container.className = 'abc-container';

    display.appendChild(titleEl);
    display.appendChild(container);

    const firstMeasure = this.originalRhythm.slice(0, 4).join(' ');
    const secondMeasure = this.originalRhythm.slice(4, 8).join(' ');
    const abcNotation = this.buildAbcNotation(`${firstMeasure} | ${secondMeasure}`, '原始节奏', this.selectedSound, this.lowerOctave);

    try {
      const visualObjArray = ABCJS.renderAbc(container, abcNotation, {
        responsive: 'resize',
        visualTranspose: 0,
        staffwidth: 600
      });

      if (visualObjArray && visualObjArray[0]) {
        const key = this.originalRhythm.join(' ');
        this.visualObjs.set(key, visualObjArray[0]);
        this.visualObjs.get(key).setUpAudio();
      }
    } catch (error) {
      console.warn('渲染原始节奏失败:', error);
    }
  }

  public showVariations(): void {
    if (this.originalRhythm.length === 0) return;

    const display = document.getElementById('variation-display');
    if (!display) return;

    display.innerHTML = '';

    const originalItem = this.createVariationItem('原始节奏', '', this.originalRhythm, true, '');
    display.appendChild(originalItem);

    this.variations.forEach((variation, index) => {
      const beatNumber = variation.modifiedIndex + 1;
      const patternName = this.getPatternName(variation.modifiedPattern);
      const desc = `第${beatNumber}拍修改为「${patternName}」`;
      
      const item = this.createVariationItem(`变体${index + 1}`, desc, variation.rhythm, false, '');
      display.appendChild(item);
    });

    this.prepareCombinedPlayback();
  }

  private prepareCombinedPlayback(): void {
    if (this.originalRhythm.length === 0) return;

    this.allRhythms = [
      this.originalRhythm.join(' '),
      ...this.variations.map(v => v.rhythm.join(' '))
    ];

    const combinedRhythm = this.allRhythms.join(' | ');
    const abcNotation = this.buildAbcNotation(combinedRhythm, '节奏变体', this.selectedSound, this.lowerOctave);
    
    const tempDiv = document.createElement('div');
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);
    
    try {
      const visualObjArray = ABCJS.renderAbc(tempDiv, abcNotation, {
        responsive: 'resize',
        visualTranspose: 0,
        add_classes: true,
        staffwidth: 700
      });
      
      if (visualObjArray && visualObjArray[0]) {
        this.visualObjs.set('__combined__', visualObjArray[0]);
        this.visualObjs.get('__combined__').setUpAudio();
      }
    } catch (error) {
      console.warn('预加载组合播放失败:', error);
    }
    
    document.body.removeChild(tempDiv);
  }

  private createVariationItem(title: string, desc: string, rhythm: string[], isOriginal: boolean, abcTitle: string): HTMLElement {
    const item = document.createElement('div');
    item.className = `variation-item${isOriginal ? ' original' : ''}`;
    item.dataset.rhythm = rhythm.join(' ');

    const titleEl = document.createElement('div');
    titleEl.className = 'variation-title';
    titleEl.textContent = title;

    const descEl = document.createElement('div');
    descEl.className = 'variation-desc';
    descEl.textContent = desc;

    const container = document.createElement('div');
    container.className = 'abc-container';

    item.appendChild(titleEl);
    item.appendChild(descEl);
    item.appendChild(container);

    const firstMeasure = rhythm.slice(0, 4).join(' ');
    const secondMeasure = rhythm.slice(4, 8).join(' ');
    const abcNotation = this.buildAbcNotation(`${firstMeasure} | ${secondMeasure}`, abcTitle, this.selectedSound, this.lowerOctave);
    
    const tempDiv = document.createElement('div');
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);
    
    try {
      const visualObjArray = ABCJS.renderAbc(tempDiv, abcNotation, {
        responsive: 'resize',
        visualTranspose: 0,
        add_classes: true,
        staffwidth: 500
      });
      
      if (visualObjArray && visualObjArray[0]) {
        const key = rhythm.join(' ');
        this.visualObjs.set(key, visualObjArray[0]);
        this.visualObjs.get(key).setUpAudio();
        
        ABCJS.renderAbc(container, abcNotation, {
          responsive: 'resize',
          visualTranspose: 0,
          staffwidth: 500
        });
      }
    } catch (error) {
      console.warn('渲染失败:', error);
    }
    
    document.body.removeChild(tempDiv);

    return item;
  }

  private getPatternName(pattern: string): string {
    const found = this.rhythmPatterns.find(p => p.pattern === pattern);
    return found ? found.name : pattern;
  }

  protected async play(): Promise<void> {
    if (this.isStopping) return;
    
    this.stopPlayback();
    
    if (this.originalRhythm.length === 0) return;

    this.isPlaying = true;
    this.updatePlayButton('btn-play-variation', true);
    this.highlightCurrentItem(0);

    await this.playCombinedRhythm();

    this.isPlaying = false;
    this.updatePlayButton('btn-play-variation', false);
    this.clearHighlight();

    if (this.loopEnabled && !this.isStopping) {
      this.scheduleLoop(() => this.play());
    }
  }

  private async playCombinedRhythm(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const audioContext = this.getAudioContext();

        const visualObj = this.visualObjs.get('__combined__');
        if (!visualObj) {
          console.warn('visualObj 未找到');
          resolve();
          return;
        }

        const synth = new (ABCJS as any).synth.CreateSynth();
        this.currentSynth = synth;
        
        const totalDurationMs = 40 * this.millisecondsPerBeat;
        
        synth.init({
          audioContext: audioContext,
          visualObj: visualObj,
          millisecondsPerMeasure: this.millisecondsPerMeasure
        }).then(() => {
          return synth.prime();
        }).then(() => {
          if (this.metronomeEnabled) {
            this.playMetronomeClick();
            
            const timeoutId = window.setTimeout(() => {
              this.playMetronomeClick();
            }, this.millisecondsPerBeat);
            this.metronomeTimeouts.push(timeoutId);
          }
          
          const startDelay = this.metronomeEnabled ? this.millisecondsPerBeat * 2 : 0;
          
          const startTimeoutId = window.setTimeout(() => {
            if (!this.isPlaying) {
              try { synth.stop(); } catch (e) {}
              resolve();
              return;
            }
            
            synth.start();
            
            if (this.metronomeEnabled) {
              this.metronome.scheduleClicks(audioContext, this.millisecondsPerBeat, totalDurationMs, 0);
            }
            
            this.scheduleHighlightUpdate(this.millisecondsPerBeat * 8);
            
            this.currentTimeout = window.setTimeout(() => {
              try { synth.stop(); } catch (e) {}
              resolve();
            }, totalDurationMs + 100);
          }, startDelay);
          this.metronomeTimeouts.push(startTimeoutId);
        }).catch((error: any) => {
          console.error('播放失败:', error);
          resolve();
        });

      } catch (error: any) {
        console.error('播放异常:', error);
        resolve();
      }
    });
  }

  private scheduleHighlightUpdate(intervalMs: number): void {
    let currentIndex = 1;
    
    const scheduleNext = () => {
      if (!this.isPlaying || currentIndex >= 5) return;
      
      const timeoutId = window.setTimeout(() => {
        if (this.isPlaying) {
          this.highlightCurrentItem(currentIndex);
          currentIndex++;
          
          if (currentIndex < 5) {
            scheduleNext();
          }
        }
      }, intervalMs);
      
      this.metronomeTimeouts.push(timeoutId);
    };
    
    scheduleNext();
  }

  private highlightCurrentItem(index: number): void {
    const items = document.querySelectorAll('.variation-item');
    items.forEach((item, i) => {
      if (i === index) {
        item.classList.add('playing');
      } else {
        item.classList.remove('playing');
      }
    });
  }

  private clearHighlight(): void {
    const items = document.querySelectorAll('.variation-item');
    items.forEach(item => {
      item.classList.remove('playing');
    });
  }

  protected getButtonIds(): { play: string; showAnswer: string; bpm: string; bpmValue: string } {
    return {
      play: 'btn-play-variation',
      showAnswer: 'btn-show-answer-variation',
      bpm: 'bpm-slider-variation',
      bpmValue: 'bpm-value-variation'
    };
  }
}