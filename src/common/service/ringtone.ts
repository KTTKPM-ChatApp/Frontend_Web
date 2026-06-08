let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gain: GainNode | null = null;
let isPlaying = false;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function playRingtone() {
  if (isPlaying) return;
  const ctx = getContext();
  gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(ctx.destination);

  oscillator = ctx.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = 440;
  oscillator.connect(gain);
  oscillator.start();

  const now = ctx.currentTime;
  for (let i = 0; i < 4; i++) {
    const cycleStart = now + i * 2.5;
    gain.gain.setValueAtTime(0.3, cycleStart);
    gain.gain.setValueAtTime(0, cycleStart + 0.4);
    gain.gain.setValueAtTime(0.3, cycleStart + 0.6);
    gain.gain.setValueAtTime(0, cycleStart + 1.0);
  }

  isPlaying = true;
  oscillator.onended = () => { isPlaying = false; };
}

export function playBusyTone() {
  if (isPlaying) return;
  const ctx = getContext();
  gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(ctx.destination);

  oscillator = ctx.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = 480;
  oscillator.connect(gain);
  oscillator.start();

  const now = ctx.currentTime;
  for (let i = 0; i < 6; i++) {
    const start = now + i * 0.6;
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.setValueAtTime(0, start + 0.3);
  }

  isPlaying = true;
  oscillator.onended = () => { isPlaying = false; };
}

export function stopRingtone() {
  try {
    if (gain) {
      gain.disconnect();
      gain = null;
    }
    if (oscillator) {
      oscillator.disconnect();
      oscillator = null;
    }
  } catch {}
  isPlaying = false;
}
