import 'abcjs/abcjs-audio.css';
import './styles/main.css';
import { RhythmDictation } from './engines/RhythmDictation';
import { RhythmVariation } from './engines/RhythmVariation';

class App {
  private dictation: RhythmDictation;
  private variation: RhythmVariation;

  constructor() {
    this.dictation = new RhythmDictation();
    this.variation = new RhythmVariation();
    this.initNavigation();
  }

  private initNavigation(): void {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = ['section-dictation', 'section-variation'];

    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset.tab;
        
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        sections.forEach(sectionId => {
          const section = document.getElementById(sectionId);
          if (section) {
            if (sectionId === `section-${tab}`) {
              section.classList.remove('hidden');
            } else {
              section.classList.add('hidden');
            }
          }
        });
      });
    });
  }
}

new App();