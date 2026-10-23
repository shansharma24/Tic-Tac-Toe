// Web Audio API Sound Synthesizer for Floyd Technology Hub
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('floyd_sound_muted') === 'true';
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  setMuted(val) {
    this.muted = !!val;
    localStorage.setItem('floyd_sound_muted', this.muted ? 'true' : 'false');
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.2, attack = 0.01) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainVal, this.ctx.currentTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio synthesis errors on locked autoplay
    }
  }

  // Tactile UI click
  playClick() {
    this.playTone(800, 'triangle', 0.06, 0.15);
  }

  // Move placed: Crisp pop with mark-specific pitch
  playMove(mark = 'X') {
    if (this.muted) return;
    const freq = mark === 'X' ? 587.33 : 440; // D5 vs A4
    this.playTone(freq, 'sine', 0.12, 0.25);
  }

  // Game started chime
  playGameStart() {
    if (this.muted) return;
    this.playTone(440, 'triangle', 0.12, 0.2);
    setTimeout(() => this.playTone(554.37, 'triangle', 0.12, 0.2), 120);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.25, 0.25), 240);
  }

  // Triumphant victory fanfare (C Major arpeggio + high chord)
  playVictory() {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.25, 0.3);
      }, idx * 100);
    });
  }

  // Soft defeat sound
  playDefeat() {
    if (this.muted) return;
    const notes = [440, 415.3, 392, 349.23];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.22, 0.2);
      }, idx * 120);
    });
  }

  // Draw harmonic chord
  playDraw() {
    if (this.muted) return;
    this.playTone(392, 'sine', 0.35, 0.18);
    this.playTone(493.88, 'sine', 0.35, 0.18);
  }

  // Soft bubble chat notification ping
  playChat() {
    if (this.muted) return;
    this.playTone(987.77, 'sine', 0.08, 0.15);
  }
}

export const sound = new SoundEngine();
