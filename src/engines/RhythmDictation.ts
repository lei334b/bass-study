import * as ABCJS from 'abcjs';
import { BaseRhythmEngine } from './BaseRhythmEngine';

export class RhythmDictation extends BaseRhythmEngine {
  private currentAnswer: string = '';
  private patternListId: string = 'pattern-list';

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
    const btnPlay = document.getElementById('btn-play');
    const btnShowAnswer = document.getElementById('btn-show-answer');
    const btnNewQuestion = document.getElementById('btn-new-question');

    btnPlay?.addEventListener('click', () => {
      if (this.isPlaying) {
        this.stopPlayback();
      } else {
        this.play();
      }
    });
    btnShowAnswer?.addEventListener('click', () => this.showAnswer());
    btnNewQuestion?.addEventListener('click', () => this.generateNewQuestion());
  }

  private initBpmControl(): void {
    const bpmSlider = document.getElementById('bpm-slider') as HTMLInputElement;
    const bpmValue = document.getElementById('bpm-value');
    
    if (bpmSlider && bpmValue) {
      bpmSlider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.bpm = parseInt(target.value);
        bpmValue.textContent = this.bpm.toString();
      });
    }
  }

  private initMetronomeControl(): void {
    const metronomeCheckbox = document.getElementById('metronome-checkbox') as HTMLInputElement;
    
    if (metronomeCheckbox) {
      metronomeCheckbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        this.metronomeEnabled = target.checked;
      });
    }
  }

  private initLoopControl(): void {
    const loopCheckbox = document.getElementById('loop-checkbox') as HTMLInputElement;
    
    if (loopCheckbox) {
      loopCheckbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        this.loopEnabled = target.checked;
      });
    }
  }

  private initVolumeControl(): void {
    const metronomeVolumeSlider = document.getElementById('metronome-volume-slider') as HTMLInputElement;
    const metronomeVolumeValue = document.getElementById('metronome-volume-value');
    
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
    const soundSelect = document.getElementById('sound-select') as HTMLSelectElement;
    const octaveCheckbox = document.getElementById('octave-checkbox') as HTMLInputElement;
    
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
    const octaveCheckbox = document.getElementById('octave-checkbox') as HTMLInputElement;
    
    if (octaveCheckbox) {
      octaveCheckbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        this.lowerOctave = target.checked;
      });
    }
  }

  private initPatternModeControl(): void {
    const modeDefault = document.getElementById('mode-default') as HTMLInputElement;
    const modeCustom = document.getElementById('mode-custom') as HTMLInputElement;
    
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

  public generateNewQuestion(): void {
    this.stopPlayback();
    
    this.currentAnswer = this.generateRandomRhythm();

    const questionDisplay = document.getElementById('question-display');
    const answerDisplay = document.getElementById('answer-display');

    if (!questionDisplay || !answerDisplay) return;

    questionDisplay.innerHTML = '<p class="hint">播放节奏，听完后填写节奏型</p>';
    answerDisplay.classList.add('hidden');
    answerDisplay.style.display = 'none';
    answerDisplay.innerHTML = '';

    const abcNotation = this.buildAbcNotation(this.currentAnswer, '节奏听写', this.selectedSound, this.lowerOctave);
    
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
        this.visualObj = visualObjArray[0];
        this.visualObj.setUpAudio();
      }
    } catch (error) {
      console.warn('音色预加载失败，将在播放时加载:', error);
      this.visualObj = null;
    }
    
    document.body.removeChild(tempDiv);

    this.enableButtons('btn-play', 'btn-show-answer');
  }

  private generateRandomRhythm(): string {
    if (this._selectedPatterns.size === 0) {
      alert('请至少选择一个节奏型！');
      return '';
    }
    
    const rhythms: string[] = [];
    const patternIndices = Array.from(this._selectedPatterns);
    
    for (let i = 0; i < 4; i++) {
      const randomIndex = patternIndices[Math.floor(Math.random() * patternIndices.length)];
      rhythms.push(this.rhythmPatterns[randomIndex].pattern);
    }

    return rhythms.join(' ');
  }

  protected async play(): Promise<void> {
    if (this.isStopping) return;
    
    this.stopPlayback();
    
    if (!this.visualObj) return;

    this.isPlaying = true;
    this.updatePlayButton('btn-play', true);

    try {
      await this.playWithAbcSynth();
    } catch (error: any) {
      console.error('播放失败:', error);
      alert(this.getErrorMessage(error));
    }
  }

  private playWithAbcSynth(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audioContext = this.getAudioContext();

        if (!this.visualObj) {
          console.warn('visualObj 未初始化，尝试重新生成...');
          reject(new Error('音色未准备好，请重试'));
          return;
        }

        const synth = new (ABCJS as any).synth.CreateSynth();
        this.currentSynth = synth;
        
        const totalDurationMs = 4 * this.millisecondsPerBeat;
        
        synth.init({
          audioContext: audioContext,
          visualObj: this.visualObj,
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
            if (!this.isPlaying) return;
            
            synth.start();
            
            if (this.metronomeEnabled) {
              this.metronome.scheduleClicks(audioContext, this.millisecondsPerBeat, totalDurationMs, 0);
            }
            
            if (this.currentTimeout) {
              clearTimeout(this.currentTimeout);
            }
            
            this.currentTimeout = window.setTimeout(() => {
              this.isPlaying = false;
              this.updatePlayButton('btn-play', false);
              this.currentSynth = null;
              
              if (this.loopEnabled && !this.isStopping) {
                this.scheduleLoop(() => this.play());
              }
              
              resolve();
            }, totalDurationMs + 100);
          }, startDelay);
          this.metronomeTimeouts.push(startTimeoutId);
        }).catch((error: any) => {
          console.error('ABC Synth播放失败:', error);
          this.isPlaying = false;
          this.updatePlayButton('btn-play', false);
          this.currentSynth = null;
          reject(new Error(this.getErrorMessage(error)));
        });

      } catch (error: any) {
        console.error('播放异常:', error);
        reject(new Error(this.getErrorMessage(error)));
      }
    });
  }

  public showAnswer(): void {
    if (!this.currentAnswer) return;

    const answerDisplay = document.getElementById('answer-display');
    const questionDisplay = document.getElementById('question-display');

    if (!answerDisplay || !questionDisplay) return;

    questionDisplay.innerHTML = '<div id="question-abc"></div>';

    const abcNotation = this.buildAbcNotation(this.currentAnswer, '节奏听写 - 答案', this.selectedSound, this.lowerOctave);
    
    const visualObjArray = ABCJS.renderAbc('question-abc', abcNotation, {
      responsive: 'resize',
      visualTranspose: 0,
      add_classes: true,
      staffwidth: 500
    });
    
    if (visualObjArray && visualObjArray[0]) {
      this.visualObj = visualObjArray[0];
      this.visualObj.setUpAudio();
    }

    answerDisplay.innerHTML = '';

    this.play();
  }

  private getErrorMessage(error: any): string {
    const message = error?.message || '';
    
    if (message.includes('sound') || message.includes('load') || message.includes('soundfont')) {
      return '音色加载失败，请确保网络连接后点击"新题目"重试';
    }
    
    if (message.includes('AudioContext')) {
      return '音频初始化失败，请点击页面任意位置后重试';
    }
    
    return '播放失败，请检查网络连接后重试';
  }

  protected getButtonIds(): { play: string; showAnswer: string; bpm: string; bpmValue: string } {
    return {
      play: 'btn-play',
      showAnswer: 'btn-show-answer',
      bpm: 'bpm-slider',
      bpmValue: 'bpm-value'
    };
  }
}