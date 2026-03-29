/**
 * Lightweight Web Audio chimes — no external files; works after a user gesture
 * (tap/type) which already happens before submit.
 */

let sharedCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new Ctx();
  }
  return sharedCtx;
}

function beep(
  frequency: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  when: number,
  freqEnd?: number,
): void {
  const c = ctx();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t0);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), t0 + duration);
  }
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/** Bright two-note “ding” for a correct answer. */
export function playCorrectSound(): void {
  const c = ctx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  beep(523.25, 0.12, "sine", 0.22, 0);
  beep(659.25, 0.18, "sine", 0.2, 0.1);
  beep(783.99, 0.22, "sine", 0.16, 0.22);
}

/** Soft descending “uh-oh” for a wrong answer. */
export function playWrongSound(): void {
  const c = ctx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  beep(220, 0.2, "triangle", 0.14, 0, 140);
  beep(180, 0.18, "triangle", 0.1, 0.12, 100);
}
