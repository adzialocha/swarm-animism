import Tone from 'tone'

const SENSITIVITY = 0.05

export default class ImpulseAgent {
  constructor(visuals) {
    this.visuals = visuals
    this.synth = new Tone.PolySynth(6, Tone.Synth, {
      oscillator: {
        partials: [0, 2, 3, 4],
      },
    }).toMaster()
  }

  start() {
    Meyda.bufferSize = 256
  }

  update(signal, runtime) {
    const features = Meyda.extract(['rms', 'chroma'], signal)

    if (features.rms > SENSITIVITY) {
      this.visuals.flash()
      this.synth.triggerAttackRelease('C4', 1)
    }
  }
}
