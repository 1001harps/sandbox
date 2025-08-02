import { Device } from "@9h/lib";

export class DrumSynthPrototype implements Device {
  context = new AudioContext();

  async init(context?: AudioContext): Promise<void> {
    this.context = context || new AudioContext();
  }

  trigger(note: number, timestamp: number): void {
    const channels = [
      (ts: number) => playKick(this.context, ts, 72, 38, 0.18, 0.62, 1.2),
      (ts: number) => playRimshot(this.context, ts, 520, 0.035, 0.017, 0.6),
      (ts: number) => playClap(this.context, ts, 0.16, 1.1),
      (ts: number) => playSnare(this.context, ts, 180, 0.1, 0.18, 0.6),
      (ts: number) => playTom(this.context, ts, 220, 0.35, 0.5),
      (ts: number) => playTom(this.context, ts, 440, 0.35, 0.5),
      (ts: number) => playHat(this.context, ts, 0.06, 0.38, false),
      (ts: number) => playHat(this.context, ts, 0.21, 0.38, true),
    ];

    const playFunc = channels[note % channels.length];
    if (playFunc) {
      playFunc(timestamp);
    }
  }

  noteOn(note: number, timestamp: number): void {
    // not used
  }
  noteOff(note: number, timestamp: number): void {
    // note used
  }
}

function makeResonator(
  context: AudioContext,
  freq: number,
  decay: number,
  gain: number,
  hpFreq: number = 50,
  startTime: number = context.currentTime
): AudioNode {
  const osc = context.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;

  const env = context.createGain();
  env.gain.setValueAtTime(gain, startTime);
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);

  let lastNode = env;

  if (hpFreq) {
    const hp = context.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = hpFreq;
    env.connect(hp);
    lastNode = hp;
  }

  osc.connect(env);

  osc.start(startTime);
  osc.stop(startTime + decay);
  osc.onended = () => {
    osc.disconnect();
    env.disconnect();
    if (hpFreq) lastNode.disconnect();
  };

  return lastNode;
}

function playTom(
  context: AudioContext,
  startTime: number = context.currentTime,
  freq: number = 320,
  decay: number = 0.35,
  gain: number = 0.5
): void {
  const body = makeResonator(context, freq, decay, gain, 50, startTime);
  body.connect(context.destination);
}

function playSnare(
  context: AudioContext,
  startTime: number = context.currentTime,
  bodyFreq: number = 180,
  noiseDecay: number = 0.1,
  bodyDecay: number = 0.18,
  gain: number = 0.6
): void {
  const body = makeResonator(context, bodyFreq, bodyDecay, gain, 0, startTime); // No highpass for shell

  const bufferSize = Math.floor(context.sampleRate * noiseDecay);
  const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const noiseSource = context.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const noiseFilter = context.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 2300;
  noiseFilter.Q.value = 1.0;

  const noiseEnv = context.createGain();
  noiseEnv.gain.setValueAtTime(gain * 0.7, startTime);
  noiseEnv.gain.exponentialRampToValueAtTime(0.0001, startTime + noiseDecay);

  noiseSource.connect(noiseFilter).connect(noiseEnv);

  const snareMix = context.createGain();
  snareMix.gain.value = 0.3;

  body.connect(snareMix);
  noiseEnv.connect(snareMix);
  snareMix.connect(context.destination);

  noiseSource.start(startTime);
  noiseSource.stop(startTime + noiseDecay);

  noiseSource.onended = () => {
    noiseSource.disconnect();
    noiseEnv.disconnect();
    noiseFilter.disconnect();
    snareMix.disconnect();
  };
}

function playClap(
  context: AudioContext,
  startTime: number = context.currentTime,
  decay: number = 0.16,
  gain: number = 1.1
): void {
  const t = startTime;

  const bufferSize = Math.floor(context.sampleRate * (decay + 0.09));
  const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noiseSource = context.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const bp = context.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1250;
  bp.Q.value = 0.55;

  const hp = context.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 300;

  const env = context.createGain();
  env.gain.value = 0;

  noiseSource.connect(bp).connect(hp).connect(env);

  const burstT = [0.0, 0.021, 0.047, 0.085];
  const burstA = [gain, gain * 0.8, gain * 0.6, gain * 0.45];
  burstT.forEach((delay, i) => {
    env.gain.setValueAtTime(burstA[i], t + delay);
    env.gain.linearRampToValueAtTime(0.0001, t + delay + 0.013);
  });
  env.gain.setValueAtTime(0.0006, t + 0.12);
  env.gain.linearRampToValueAtTime(0.00001, t + decay + 0.07);

  const out = context.createGain();
  out.gain.value = 0.6;
  env.connect(out);
  out.connect(context.destination);

  noiseSource.start(t);
  noiseSource.stop(t + decay + 0.11);

  noiseSource.onended = () => {
    noiseSource.disconnect();
    bp.disconnect();
    hp.disconnect();
    env.disconnect();
    out.disconnect();
  };
}
function playKick(
  context: AudioContext,
  startTime: number = context.currentTime,
  startFreq: number = 72,
  endFreq: number = 38,
  pitchDecay: number = 0.18,
  ampDecay: number = 0.62,
  gain: number = 1.2
): void {
  const t = startTime;

  const osc = context.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(startFreq, t);
  osc.frequency.exponentialRampToValueAtTime(endFreq, t + pitchDecay);

  const env = context.createGain();
  env.gain.setValueAtTime(gain, t);
  env.gain.exponentialRampToValueAtTime(0.0001, t + ampDecay);

  osc.connect(env).connect(context.destination);

  osc.start(t);
  osc.stop(t + ampDecay + 0.02);

  osc.onended = () => {
    osc.disconnect();
    env.disconnect();
  };
}

function playHat(
  context: AudioContext,
  startTime: number = context.currentTime,
  decay: number = 0.07,
  gain: number = 0.38,
  isOpen: boolean = false
): void {
  const t = startTime;
  const actualDecay = isOpen ? 0.23 : decay;
  const actualGain = isOpen ? gain * 1.18 : gain;

  const bufferSize = Math.floor(context.sampleRate * (actualDecay + 0.05));
  const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

  const noiseSource = context.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const bp = context.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 10400;
  bp.Q.value = 1.4;

  const hp = context.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 7000;

  const env = context.createGain();
  env.gain.setValueAtTime(actualGain, t);
  env.gain.exponentialRampToValueAtTime(0.0001, t + actualDecay);

  noiseSource.connect(bp).connect(hp).connect(env).connect(context.destination);

  noiseSource.start(t);
  noiseSource.stop(t + actualDecay + 0.02);

  noiseSource.onended = () => {
    noiseSource.disconnect();
    bp.disconnect();
    hp.disconnect();
    env.disconnect();
  };
}

function playRimshot(
  context: AudioContext,
  startTime: number = context.currentTime,
  freq: number = 520,
  oscDecay: number = 0.035,
  noiseDecay: number = 0.017,
  gain: number = 0.6
): void {
  const t = startTime;

  const bufferSize = Math.floor(context.sampleRate * (noiseDecay + 0.01));
  const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

  const noiseSource = context.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const bp = context.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 0.9;

  const noiseEnv = context.createGain();
  noiseEnv.gain.setValueAtTime(gain * 0.45, t);
  noiseEnv.gain.exponentialRampToValueAtTime(0.0001, t + noiseDecay);

  noiseSource.connect(bp).connect(noiseEnv);

  // -- "Shell" Oscillator --
  const osc = context.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = freq;

  const oscEnv = context.createGain();
  oscEnv.gain.setValueAtTime(gain, t);
  oscEnv.gain.exponentialRampToValueAtTime(0.0001, t + oscDecay);

  osc.connect(oscEnv);

  const rimMix = context.createGain();
  rimMix.gain.value = 0.33;

  oscEnv.connect(rimMix);
  noiseEnv.connect(rimMix);
  rimMix.connect(context.destination);

  osc.start(t);
  osc.stop(t + oscDecay + 0.01);

  noiseSource.start(t);
  noiseSource.stop(t + noiseDecay + 0.005);

  osc.onended = () => {
    osc.disconnect();
    oscEnv.disconnect();
  };
  noiseSource.onended = () => {
    noiseSource.disconnect();
    noiseEnv.disconnect();
    bp.disconnect();
    rimMix.disconnect();
  };
}
