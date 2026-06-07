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
  gain.gain.value = 0.3;
  gain.connect(ctx.destination);

  oscillator = ctx.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = 440;
  oscillator.connect(gain);

  const now = ctx.currentTime;
  // Ring pattern: 0.4s on, 0.2s off, 0.4s on, 1.5s off
  for (let i = 0; i < 4; i++) {
    const cycleStart = now + i * 2.5;
    gain.gain.setValueAtTime(0.3, cycleStart);
    gain.gain.setValueAtTime(0, cycleStart + 0.4);
    gain.gain.setValueAtTime(0.3, cycleStart + 0.6);
    gain.gain.setValueAtTime(0, cycleStart + 1.0);
  }

  oscillator.start(now);
  oscillator.stop(now + 10);
  isPlaying = true;

  oscillator.onended = () => {
    isPlaying = false;
  };
}

export function playBusyTone() {
  if (isPlaying) return;
  const ctx = getContext();
  gain = ctx.createGain();
  gain.gain.value = 0.3;
  gain.connect(ctx.destination);

  oscillator = ctx.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = 480;
  oscillator.connect(gain);

  const now = ctx.currentTime;
  // Busy pattern: 0.3s on, 0.3s off, repeat 6 times
  for (let i = 0; i < 6; i++) {
    const start = now + i * 0.6;
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.setValueAtTime(0, start + 0.3);
  }

  oscillator.start(now);
  oscillator.stop(now + 3.6);
  isPlaying = true;

  oscillator.onended = () => {
    isPlaying = false;
  };
}

export function stopRingtone() {
  try {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      oscillator = null;
    }
    if (gain) {
      gain.disconnect();
      gain = null;
    }
  } catch {}
  isPlaying = false;
}
