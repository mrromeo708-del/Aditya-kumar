
class AudioService {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmIntervalId: number | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playFlip() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playMatch() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.1, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.2);
    });
  }

  playMismatch() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playVictory() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const melody = [523.25, 523.25, 659.25, 783.99, 659.25, 1046.50];
    
    melody.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      gain.gain.setValueAtTime(0.1, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.4);
    });
  }

  startBGM() {
    this.init();
    if (!this.ctx || this.isBgmPlaying) return;
    this.isBgmPlaying = true;

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.bgmGain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 2); // Fade in over 2s
    this.bgmGain.connect(this.ctx.destination);

    const tempo = 120;
    const quarterNote = 60 / tempo;
    let step = 0;
    
    // Cheerful Pentatonic C Major scale: C4, D4, E4, G4, A4, C5
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    const melodyPattern = [0, 2, 3, 5, 4, 3, 2, 1]; // Step-wise movement
    const bassPattern = [261.63, 196.00]; // C3, G2 (simplified)

    const playStep = () => {
      if (!this.ctx || !this.bgmGain) return;
      const now = this.ctx.currentTime;
      
      // Melody note (Triangle)
      const melOsc = this.ctx.createOscillator();
      const melGain = this.ctx.createGain();
      melOsc.type = 'triangle';
      melOsc.frequency.setValueAtTime(scale[melodyPattern[step % melodyPattern.length]], now);
      melGain.gain.setValueAtTime(0.3, now);
      melGain.gain.exponentialRampToValueAtTime(0.01, now + quarterNote * 0.8);
      melOsc.connect(melGain);
      melGain.connect(this.bgmGain);
      melOsc.start(now);
      melOsc.stop(now + quarterNote * 0.8);

      // Bass note (Sine) - every 2nd beat
      if (step % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassPattern[(step / 2) % bassPattern.length] / 2, now);
        bassGain.gain.setValueAtTime(0.5, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + quarterNote * 1.5);
        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);
        bassOsc.start(now);
        bassOsc.stop(now + quarterNote * 1.5);
      }

      step++;
    };

    // Use a high-frequency interval to schedule precisely if needed, 
    // but for simple BGM, setInterval is fine.
    this.bgmIntervalId = window.setInterval(playStep, quarterNote * 1000);
    playStep(); // Initial beat
  }

  stopBGM() {
    if (!this.ctx || !this.bgmGain || !this.isBgmPlaying) return;
    
    this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.bgmGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5); // Fade out over 1.5s
    
    this.isBgmPlaying = false;
    
    setTimeout(() => {
      if (this.bgmIntervalId) {
        window.clearInterval(this.bgmIntervalId);
        this.bgmIntervalId = null;
      }
      if (this.bgmGain) {
        this.bgmGain.disconnect();
        this.bgmGain = null;
      }
    }, 1500);
  }
}

export const audioService = new AudioService();
