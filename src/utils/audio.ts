// Classroom-friendly sound generator using Web Audio API
// Does not require any external audio assets or network requests.

class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public playTick(pitchMultiplier: number = 1.0) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440 * pitchMultiplier, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880 * pitchMultiplier, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // Audio playback fails gracefully
    }
  }

  public playPop() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // ignore
    }
  }

  public playRiser(durationSeconds: number = 1.5) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + durationSeconds);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + durationSeconds * 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSeconds);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSeconds);
    } catch {
      // ignore
    }
  }

  public playVictory() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // Triumphant chord sequence: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        const startTime = ctx.currentTime + idx * 0.08;
        const duration = 0.5 + (idx === 3 ? 0.6 : 0.2);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });

      // Add a sparkly harmonic shimmer
      setTimeout(() => {
        const shimmerCtx = this.getContext();
        if (!shimmerCtx) return;
        const shimmerNotes = [1318.51, 1567.98, 2093.0];
        shimmerNotes.forEach((f, i) => {
          const osc = shimmerCtx.createOscillator();
          const gain = shimmerCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, shimmerCtx.currentTime + i * 0.06);
          gain.gain.setValueAtTime(0.1, shimmerCtx.currentTime + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, shimmerCtx.currentTime + i * 0.06 + 0.4);
          osc.connect(gain);
          gain.connect(shimmerCtx.destination);
          osc.start(shimmerCtx.currentTime + i * 0.06);
          osc.stop(shimmerCtx.currentTime + i * 0.06 + 0.45);
        });
      }, 300);
    } catch {
      // ignore
    }
  }

  public playShuffle() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // Noise burst for cards/dice shuffling
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // ignore
    }
  }
}

export const soundEffects = new SoundFX();
