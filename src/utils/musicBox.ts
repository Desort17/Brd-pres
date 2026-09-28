// Polyphonic Web Audio API Music Box & Celesta Synthesizer
// Zero external audio dependencies — guaranteed playback in all modern browsers.

export type MelodyId = 'birthday' | 'waltz' | 'healing';

interface NoteEvent {
  freq: number;
  duration: number; // in beats
  harmony?: number[];
}

// Frequencies in Hz
const N = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.00,
};

const MELODIES: Record<MelodyId, { name: string; bpm: number; notes: NoteEvent[] }> = {
  birthday: {
    name: 'Music Box Birthday',
    bpm: 104,
    notes: [
      { freq: N.C4, duration: 0.75 },
      { freq: N.C4, duration: 0.25 },
      { freq: N.D4, duration: 1, harmony: [N.F4, N.A4] },
      { freq: N.C4, duration: 1, harmony: [N.E4, N.G4] },
      { freq: N.F4, duration: 1, harmony: [N.A4, N.C5] },
      { freq: N.E4, duration: 2, harmony: [N.G4, N.C5] },

      { freq: N.C4, duration: 0.75 },
      { freq: N.C4, duration: 0.25 },
      { freq: N.D4, duration: 1, harmony: [N.F4, N.B4] },
      { freq: N.C4, duration: 1, harmony: [N.G4, N.B4] },
      { freq: N.G4, duration: 1, harmony: [N.B4, N.D5] },
      { freq: N.F4, duration: 2, harmony: [N.A4, N.C5] },

      { freq: N.C4, duration: 0.75 },
      { freq: N.C4, duration: 0.25 },
      { freq: N.C5, duration: 1, harmony: [N.E4, N.G4] },
      { freq: N.A4, duration: 1, harmony: [N.C4, N.F4] },
      { freq: N.F4, duration: 1, harmony: [N.A4, N.C5] },
      { freq: N.E4, duration: 1, harmony: [N.G4, N.Bb4] },
      { freq: N.D4, duration: 2, harmony: [N.F4, N.A4] },

      { freq: N.Bb4, duration: 0.75 },
      { freq: N.Bb4, duration: 0.25 },
      { freq: N.A4, duration: 1, harmony: [N.C4, N.F4] },
      { freq: N.F4, duration: 1, harmony: [N.A4, N.C5] },
      { freq: N.G4, duration: 1, harmony: [N.E4, N.C5] },
      { freq: N.F4, duration: 2.5, harmony: [N.A4, N.C5, N.F5] },
    ],
  },
  waltz: {
    name: 'Rose Petal Waltz',
    bpm: 112,
    notes: [
      { freq: N.A4, duration: 1.5, harmony: [N.F4, N.C5] },
      { freq: N.C5, duration: 0.75 },
      { freq: N.F5, duration: 0.75 },
      { freq: N.E5, duration: 1.5, harmony: [N.G4, N.C5] },
      { freq: N.D5, duration: 1.5, harmony: [N.F4, N.Bb4] },
      { freq: N.C5, duration: 1.5, harmony: [N.E4, N.A4] },
      { freq: N.A4, duration: 1.5, harmony: [N.D4, N.F4] },
      { freq: N.G4, duration: 1.5, harmony: [N.E4, N.C5] },
      { freq: N.F4, duration: 1.5, harmony: [N.A4, N.C5] },
    ],
  },
  healing: {
    name: 'Starlight Lullaby',
    bpm: 88,
    notes: [
      { freq: N.F5, duration: 1.5, harmony: [N.F4, N.A4, N.C5] },
      { freq: N.E5, duration: 1.5, harmony: [N.E4, N.G4, N.C5] },
      { freq: N.D5, duration: 1.5, harmony: [N.D4, N.F4, N.A4] },
      { freq: N.C5, duration: 1.5, harmony: [N.E4, N.A4] },
      { freq: N.Bb4, duration: 1.5, harmony: [N.D4, N.F4] },
      { freq: N.A4, duration: 1.5, harmony: [N.C4, N.F4] },
      { freq: N.G4, duration: 1.5, harmony: [N.C4, N.E4] },
      { freq: N.A4, duration: 2.5, harmony: [N.F4, N.C5, N.F5] },
    ],
  },
};

class RomanticMusicBox {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentMelody: MelodyId = 'birthday';
  private noteIndex = 0;
  private timerId: number | null = null;
  private volume = 0.25;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playMusicBoxTone(freq: number, durationSec: number, gainScale = 1) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Fundamental sine + delicate overtone bell
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.12, now);

    const peakGain = Math.max(0.001, this.volume * gainScale * 0.35);
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(peakGain, now + 0.025);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.4, durationSec * 1.45));

    osc1.connect(gainNode);
    osc2.connect(osc2Gain);
    osc2Gain.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    const stopTime = now + Math.max(0.45, durationSec * 1.5);
    osc1.stop(stopTime);
    osc2.stop(stopTime);
  }

  private scheduleNextNote() {
    if (!this.isPlaying) return;

    const melody = MELODIES[this.currentMelody];
    const event = melody.notes[this.noteIndex % melody.notes.length];
    const beatSec = 60 / melody.bpm;
    const durationSec = event.duration * beatSec;

    this.playMusicBoxTone(event.freq, durationSec, 1);

    if (event.harmony) {
      event.harmony.forEach((hFreq, idx) => {
        setTimeout(() => {
          if (this.isPlaying) {
            this.playMusicBoxTone(hFreq, durationSec * 1.1, 0.42);
          }
        }, idx * 35);
      });
    }

    this.noteIndex = (this.noteIndex + 1) % melody.notes.length;
    this.timerId = window.setTimeout(() => {
      this.scheduleNextNote();
    }, durationSec * 1000);
  }

  public start(melody?: MelodyId) {
    if (melody) {
      this.currentMelody = melody;
    }
    this.ensureContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.scheduleNextNote();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  public setMelody(melody: MelodyId) {
    this.currentMelody = melody;
    this.noteIndex = 0;
    if (this.isPlaying) {
      if (this.timerId !== null) clearTimeout(this.timerId);
      this.scheduleNextNote();
    }
  }

  public getMelody(): MelodyId {
    return this.currentMelody;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public playChime() {
    const notes = [N.F5, N.A5, N.C5, N.F5];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playMusicBoxTone(freq, 0.55, 0.65);
      }, i * 70);
    });
  }

  public playCelebrationChord() {
    const notes = [N.F4, N.A4, N.C5, N.F5, N.A5];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playMusicBoxTone(freq, 1.1, 0.8);
      }, i * 85);
    });
  }
}

export const musicBox = new RomanticMusicBox();
export { MELODIES };
