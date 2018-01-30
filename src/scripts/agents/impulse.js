import Tone from 'tone'

const SENSITIVITY = 0.01

export default class ImpulseAgent {
  constructor(visuals) {
    this.visuals = visuals

    this.meter = new Tone.Meter()

    this.synth = new Tone.PolySynth(1, Tone.Synth, {
      oscillator: {
        partials: [0, 2, 3, 4, 8],
      },
      envelope : {
        attack: 0.05,
        decay: 0.05,
        sustain: 0.1,
        release: 0.1,
      },
    }).connect(this.meter)

    this.meter.toMaster()
  }

  start() {
    Meyda.bufferSize = 256
  }

  update(signal, runtime, gainNode) {
    const features = Meyda.extract(['rms', 'chroma'], signal)

    const synthValue = Math.abs(this.meter.getValue())
    gainNode.mute = synthValue > 0.001

    if (features.rms > SENSITIVITY) {
      this.visuals.flash()
      this.synth.triggerAttackRelease('C3', 0.1)
    }
  }
}
