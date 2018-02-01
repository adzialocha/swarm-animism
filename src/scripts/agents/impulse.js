import Meyda from 'meyda'

const RMS_SENSITIVITY = 0.01
const MUTE_SENSITIVITY = 0.001
const NOISEINESS_TRESHOLD = 0.12
const TRIGGER_CHROMA_KEYS = [0, 2]

export default class ImpulseAgent {
  constructor(options = {}, visuals, gainNode) {
    const Tone = require('tone')

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
    const features = Meyda.extract([
      'rms',
      'chroma',
    ], signal)

    const { chroma, rms } = features

    // Calculate the noiseiness of the whole signal
    const noiseiness = chroma.reduce((a, b) => a + b, 0) / chroma.length

    // Order the chroma keys so we get the strongest ones at the top
    const strongestKeys = chroma.reduce((acc, value, index) => {
      acc.push({
        key: index,
        value,
      })

      return acc
    }, []).sort((a, b) => b.value - a.value)

    // Check if the strongest keys match the ones we need (this does not work yet)
    const isChromaTriggered = TRIGGER_CHROMA_KEYS.reduce((acc, value, index) => {
      return acc && strongestKeys[index].key == value
    }, true)

    // Mute the microphone gain when we agent makes sound
    const synthValue = Math.abs(this.meter.getValue())
    gainNode.mute = synthValue > MUTE_SENSITIVITY

    // Check some requirements before we really can make sound
    if (
      rms > RMS_SENSITIVITY
      // && noiseiness < NOISEINESS_TRESHOLD
      // && isChromaTriggered
    ) {
      this.visuals.flash()
      this.synth.triggerAttackRelease('C3', 0.1)
    }
  }
}
