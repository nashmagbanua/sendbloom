// Bulletproof Web Audio API synthesizer for SendBloom
// Zero external files, 100% fail-safe (errors are silently caught so UI never breaks)

let audioCtx: AudioContext | null = null;
let isMuted = false;
let bgMusicInterval: ReturnType<typeof setInterval> | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
  if (muted && bgMusicInterval) {
    stopMelodicBackground();
  }
}

export function getSoundMuted(): boolean {
  return isMuted;
}

/** Soft wooden marimba/bell pop when adding a flower */
export function playFlowerPop(pitchIndex = 0) {
  try {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreqs = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const freq = baseFreqs[Math.abs(pitchIndex) % baseFreqs.length];

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  } catch {}
}

/** Gentle paper rustle / ribbon untie sound */
export function playRustle() {
  try {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = Math.max(256, Math.floor(ctx.sampleRate * 0.1));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  } catch {}
}

/** Wax seal break snap */
export function playSealBreak() {
  try {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  } catch {}
}

/** Magical flower bloom celebration chime arpeggio */
export function playBloomCelebration() {
  try {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    chords.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.52);
    });
  } catch {}
}

/** Sweet acoustic melody progression that plays when opened */
export function playMelodicBackground() {
  try {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    stopMelodicBackground();

    const sequence = [
      [523.25, 659.25, 783.99],       // C chord
      [587.33, 698.46, 880.00],       // Dm chord
      [659.25, 783.99, 987.77],       // Em chord
      [698.46, 880.00, 1046.50],      // F chord
    ];

    let chordIdx = 0;
    const playNextChord = () => {
      if (isMuted) return;
      const notes = sequence[chordIdx % sequence.length];
      chordIdx++;

      notes.forEach((freq, i) => {
        const now = ctx.currentTime + i * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.25);
      });
    };

    playNextChord();
    bgMusicInterval = setInterval(playNextChord, 2200);
  } catch {}
}

export function stopMelodicBackground() {
  if (bgMusicInterval) {
    clearInterval(bgMusicInterval);
    bgMusicInterval = null;
  }
}
