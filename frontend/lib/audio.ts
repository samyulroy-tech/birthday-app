// Lightweight Web Audio synth engine, ported and extended from the original
// single-file experience. All sounds are synthesized (no audio assets needed)
// except optional background music from a URL.

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let volume = 0.6;
let musicEl: HTMLAudioElement | null = null;
let musicPlaying = false;
let scheduledBar: number | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
  }
  ctx.resume();
  return ctx;
}

export function setVolume(v: number) {
  volume = v;
  if (masterGain) masterGain.gain.value = v;
  if (musicEl) musicEl.volume = v;
}

export function getVolume() {
  return volume;
}

function tone(freq: number, dur = 0.25, type: OscillatorType = "sine", vel = 0.12, when = 0, to?: number) {
  try {
    const a = getCtx();
    const t = a.currentTime + when;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    gain.gain.setValueAtTime(vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(masterGain!);
    osc.start(t);
    osc.stop(t + dur);
  } catch {}
}

function noise(dur = 0.15, vel = 0.3, filterFreq = 1200) {
  try {
    const a = getCtx();
    const n = Math.floor(a.sampleRate * dur);
    const buffer = a.createBuffer(1, n, a.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = a.createBufferSource();
    const gain = a.createGain();
    const filter = a.createBiquadFilter();
    filter.frequency.value = filterFreq;
    gain.gain.value = vel;
    src.buffer = buffer;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain!);
    src.start();
  } catch {}
}

export const sfx = {
  pop: () => {
    noise(0.12, 0.5, 2500);
    tone(500, 0.1, "sine", 0.1, 0, 120);
  },
  unlock: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.6, "triangle", 0.12, i * 0.12)),
  firework: () => {
    noise(0.5, 0.2, 600);
    tone(900, 0.4, "sine", 0.05, 0.05, 200);
  },
  photo: () => tone(660, 0.5, "sine", 0.08, 0, 990),
  gift: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.8, "triangle", 0.12, i * 0.09)),
  cut: () => {
    noise(0.25, 0.25, 3500);
    tone(300, 0.3, "sawtooth", 0.04, 0, 80);
  },
  blow: () => noise(0.35, 0.25, 500),
  ding: () => tone(1046, 0.9, "sine", 0.12),
  click: () => tone(700, 0.08, "sine", 0.06),
  swoosh: () => noise(0.3, 0.12, 4500),
};

const midiFreq = (m: number) => 440 * 2 ** ((m - 69) / 12);
const CHORDS = [
  [57, 60, 64],
  [53, 57, 60],
  [48, 52, 55],
  [55, 59, 62],
];
let barIndex = 0;

function playBar() {
  if (!musicPlaying) return;
  const chord = CHORDS[barIndex++ % 4];
  chord.forEach((m) => tone(midiFreq(m), 2.6, "triangle", 0.05));
  for (let k = 0; k < 8; k++) tone(midiFreq(chord[k % 3] + 12), 0.5, "sine", 0.04, k * 0.3);
}

export function startMusic(url?: string | null) {
  musicPlaying = true;
  if (url) {
    musicEl = new Audio(url);
    musicEl.loop = true;
    musicEl.volume = volume;
    musicEl.play().catch(() => {
      musicPlaying = false;
    });
  } else {
    getCtx();
    playBar();
    scheduledBar = window.setInterval(playBar, 2400);
  }
}

export function toggleMusic(playing: boolean) {
  musicPlaying = playing;
  if (musicEl) {
    playing ? musicEl.play() : musicEl.pause();
  } else if (playing) {
    playBar();
  }
}

export function isMusicPlaying() {
  return musicPlaying;
}

export function stopMusic() {
  musicPlaying = false;
  if (musicEl) {
    musicEl.pause();
    musicEl = null;
  }
  if (scheduledBar) {
    clearInterval(scheduledBar);
    scheduledBar = null;
  }
}

export function primeAudio() {
  getCtx();
}
