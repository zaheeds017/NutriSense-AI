// Web Audio API feedback utility for barcode detection & scan completion

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a crisp double-tone beep characteristic of a retail barcode scanner.
 */
export function playScanBeep() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tone 1: High frequency sharp beep (1046.5 Hz - C6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.5, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);

    // Tone 2: Pitch shift up (1318.5 Hz - E6) for positive feedback
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.5, now + 0.07);
    gain2.gain.setValueAtTime(0.15, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.16);
  } catch (e) {
    console.warn('Audio feedback unavailable:', e);
  }
}

/**
 * Plays a pleasant ascending completion chime when analysis finishes loading.
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Soft ascending triad notes: F5 (698.46Hz) -> A5 (880Hz) -> C6 (1046.5Hz)
    const frequencies = [698.46, 880.0, 1046.5];
    frequencies.forEach((freq, idx) => {
      const startTime = now + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  } catch (e) {
    console.warn('Audio feedback unavailable:', e);
  }
}
