/**
 * Lightweight Web Audio beep engine for scanner feedback sounds.
 * Uses the Web Audio API so no audio files are required.
 */

let audioCtx = null;

function getAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioCtx) audioCtx = new AudioCtx();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/**
 * Play a single beep tone.
 * @param {Object} options
 */
export function playBeep({
  frequency = 880,
  duration = 0.15,
  type = 'square',
  volume = 0.15,
  delay = 0
} = {}) {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t0 = ctx.currentTime + delay;

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t0);
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  } catch (err) {
    console.warn('Beep failed:', err);
  }
}

export const SOUNDS = {
  // Alert tone when a human face is detected in the viewfinder
  faceDetected() {
    playBeep({ frequency: 260, duration: 0.4, type: 'square', volume: 0.18 });
  },
  // Short "click" when a scan begins
  scanStart() {
    playBeep({ frequency: 720, duration: 0.1, type: 'sine', volume: 0.12 });
  },
  // Rising two-tone success chime when extraction completes
  scanSuccess() {
    playBeep({ frequency: 880, duration: 0.12, type: 'sine', volume: 0.18 });
    playBeep({ frequency: 1174.66, duration: 0.18, type: 'sine', volume: 0.18, delay: 0.14 });
  },
  // Low buzz when processing fails
  scanError() {
    playBeep({ frequency: 180, duration: 0.35, type: 'sawtooth', volume: 0.12 });
  }
};
